import type { UIMessage } from "ai"
import type { TokenUsageMetadata } from "../../shared-types"
import { BaseError, UnknownError } from "../errors"
import type { NormalizedTokenUsage, TokenAccountingPolicy, TokenUsageError } from "../types"

export function toTokenUsageError(err: unknown) {
	return err instanceof BaseError ? err.toJSON() : new UnknownError().toJSON()
}

export function resultError(error: TokenUsageError) {
	return {
		data: undefined,
		isLoading: false,
		error,
	}
}

export function resultLoading() {
	return {
		data: undefined,
		isLoading: true,
		error: null,
	}
}

export function resultSuccess<T>(data: T) {
	return {
		data,
		isLoading: false,
		error: null,
	}
}

const DEFAULT_POLICY: TokenAccountingPolicy = { reasoningBakedIn: false }
const PROVIDER_POLICY: Record<string, TokenAccountingPolicy> = {
	openai: { reasoningBakedIn: true },
	google: { reasoningBakedIn: false },
	anthropic: { reasoningBakedIn: false },
}

function getPolicy(providerId: string) {
	return PROVIDER_POLICY[providerId] ?? DEFAULT_POLICY
}

export function normalizeTokenUsage(message: UIMessage, stripEmptyReasoning: boolean = false): NormalizedTokenUsage {
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

export function parseCanonicalSlug(slug: string): { providerId: string; modelId: string } {
	const [providerId = "", modelId = ""] = slug.split("/", 2)
	return { providerId, modelId }
}

export function hasInvalidTokenUsageMetadata(message: UIMessage | undefined): boolean {
	if (!message) return false

	const meta = (message as { metadata?: unknown }).metadata
	if (meta == null) return true

	const m = meta as Partial<TokenUsageMetadata> & Record<string, unknown>

	const hasIds = typeof m.canonicalSlug === "string"
	const hasTotalUsage = typeof m.totalUsage === "object" && m.totalUsage !== null

	return !(hasIds && hasTotalUsage)
}
