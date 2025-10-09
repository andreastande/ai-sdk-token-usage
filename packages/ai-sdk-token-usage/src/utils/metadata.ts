import type { UIMessage } from "ai"
import type { TokenUsageFinishPart, TokenUsageMetadata, TokenUsagePart } from "../types/metadata"

export function getTokenUsageMetadata({ part, canonicalSlug }: TokenUsageFinishPart): TokenUsageMetadata {
	return {
		totalUsage: part.totalUsage,
		canonicalSlug,
	}
}

export function toTokenUsageMetadata({ part, canonicalSlug }: TokenUsagePart): TokenUsageMetadata | undefined {
	switch (part.type) {
		case "finish":
			return {
				totalUsage: part.totalUsage,
				canonicalSlug,
			}
		default:
			return undefined
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
