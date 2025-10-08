import { CostComputationError } from "../errors"
import type {
	AssistantWithUsage,
	ContextWindow,
	Cost,
	Model,
	ModelResolver,
	NormalizedTokenUsage,
	UIMessage,
} from "../types"
import { getPolicy } from "./policy"

export function isAssistantWithUsage(m: UIMessage): m is AssistantWithUsage {
	return m.role === "assistant" && !!m.metadata
}

function normalizeTokenUsage(message: AssistantWithUsage, stripEmptyReasoning: boolean = false): NormalizedTokenUsage {
	const { totalUsage, providerId } = message.metadata
	const policy = getPolicy(providerId)

	const input = totalUsage.inputTokens ?? 0
	const cachedInput = totalUsage.cachedInputTokens ?? 0
	const output = totalUsage.outputTokens ?? 0
	const reasoning = totalUsage.reasoningTokens ?? 0

	const reasoningPart = message.parts.find((p) => p.type === "reasoning")
	const hasEmptyReasoningPart = reasoningPart && reasoningPart.text.trim() === ""

	// When computing the context window, strip reasoning tokens if the reasoning part is empty
	const shouldZeroReasoning = hasEmptyReasoningPart && stripEmptyReasoning

	return {
		input,
		output: policy.reasoningBakedIn ? Math.max(0, output - reasoning) : output,
		reasoning: shouldZeroReasoning ? 0 : reasoning,
		cachedInput,
	}
}

export function computeContextWindow(message: AssistantWithUsage | undefined, model: Model): ContextWindow {
	const breakdown = message ? normalizeTokenUsage(message, true) : { input: 0, output: 0, reasoning: 0, cachedInput: 0 }

	const used = Object.values(breakdown).reduce((sum, v) => sum + v, 0)
	const limit = model.limit?.context ?? 0
	const remaining = Math.max(0, limit - used)
	const fractionUsed = limit > 0 ? used / limit : 0
	const percentageUsed = fractionUsed * 100

	return {
		breakdown,
		used,
		limit,
		remaining,
		fractionUsed,
		percentageUsed,
	}
}

export function computeCost(messages: AssistantWithUsage[], resolveModel: ModelResolver): Cost {
	const breakdown = { input: 0, output: 0, reasoning: 0, cachedInput: 0 }

	const issues: Array<{
		type: "MODEL_NOT_FOUND" | "MISSING_PRICING"
		providerId: string
		modelId: string
		index: number
	}> = []

	messages.forEach((m, index) => {
		const { providerId, modelId } = m.metadata
		const model = resolveModel({ providerId, modelId })

		if (!model) {
			issues.push({ type: "MODEL_NOT_FOUND", providerId, modelId, index })
			return
		}
		if (!model.cost) {
			issues.push({ type: "MISSING_PRICING", providerId, modelId, index })
			return
		}

		const tokens = normalizeTokenUsage(m)
		const cost = model.cost

		breakdown.input += (tokens.input / 1_000_000) * cost.input
		breakdown.output += (tokens.output / 1_000_000) * cost.output
		breakdown.reasoning += (tokens.reasoning / 1_000_000) * (cost.reasoning ?? cost.output)
		breakdown.cachedInput += (tokens.cachedInput / 1_000_000) * (cost.cache_read ?? cost.input)
	})

	if (issues.length > 0) {
		throw new CostComputationError({ issues })
	}

	const total = Object.values(breakdown).reduce((sum, v) => sum + v, 0)

	return { breakdown, total, currency: "USD" }
}
