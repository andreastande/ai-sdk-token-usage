import type { UIMessage } from "ai"
import { CostComputationError, MissingMetadataError } from "../errors"
import type { ContextWindow, Cost, Model, ModelResolver, NormalizedTokenUsage, TokenUsageMetadata } from "../types"
import { hasInvalidTokenUsageMetadata, parseCanonicalSlug } from "./metadata"
import { getPolicy } from "./policy"

function normalizeTokenUsage(message: UIMessage, stripEmptyReasoning: boolean = false): NormalizedTokenUsage {
	if (hasInvalidTokenUsageMetadata(message)) {
		throw new MissingMetadataError({ message, metadata: message?.metadata })
	}

	const { totalUsage, canonicalSlug } = message.metadata as TokenUsageMetadata
	const { providerId } = parseCanonicalSlug(canonicalSlug)

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

export function computeContextWindow(message: UIMessage | undefined, model: Model): ContextWindow {
	const breakdown = message ? normalizeTokenUsage(message, true) : { input: 0, output: 0, reasoning: 0, cachedInput: 0 }

	const used = Object.values(breakdown).reduce((sum, v) => sum + v, 0)
	const limit = model.limit.context
	const remaining = Math.max(0, limit - used)
	const fractionUsed = limit > 0 ? used / limit : 0
	const percentageUsed = fractionUsed * 100
	const isExceeded = used > limit

	return {
		breakdown,
		used,
		limit,
		remaining,
		fractionUsed,
		percentageUsed,
		isExceeded,
	}
}

export function computeCost(messages: readonly UIMessage[], resolveModel: ModelResolver): Cost {
	const breakdown = { input: 0, output: 0, reasoning: 0, cachedInput: 0 }

	const metadataIssues: Array<{
		message: UIMessage
		metadata: unknown
	}> = []

	const costIssues: Array<{
		type: "MODEL_NOT_FOUND" | "MISSING_PRICING"
		providerId: string
		modelId: string
		index: number
	}> = []

	messages.forEach((m, index) => {
		if (hasInvalidTokenUsageMetadata(m)) {
			metadataIssues.push({ message: m, metadata: m.metadata })
			return
		}

		const { canonicalSlug } = m.metadata as TokenUsageMetadata
		const { providerId, modelId } = parseCanonicalSlug(canonicalSlug)

		const model = resolveModel({ providerId, modelId })

		if (!model) {
			costIssues.push({ type: "MODEL_NOT_FOUND", providerId, modelId, index })
			return
		}
		if (!model.cost) {
			costIssues.push({ type: "MISSING_PRICING", providerId, modelId, index })
			return
		}

		const tokens = normalizeTokenUsage(m)
		const cost = model.cost

		breakdown.input += (tokens.input / 1_000_000) * cost.input
		breakdown.output += (tokens.output / 1_000_000) * cost.output
		breakdown.reasoning += (tokens.reasoning / 1_000_000) * (cost.reasoning ?? cost.output)
		breakdown.cachedInput += (tokens.cachedInput / 1_000_000) * (cost.cache_read ?? cost.input)
	})

	if (metadataIssues.length > 0) {
		throw new MissingMetadataError({ metadataIssues })
	}

	if (costIssues.length > 0) {
		throw new CostComputationError({ costIssues })
	}

	const total = Object.values(breakdown).reduce((sum, v) => sum + v, 0)

	return { breakdown, total, currency: "USD" }
}
