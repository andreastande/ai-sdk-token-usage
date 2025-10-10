import type { TokenUsageMetadata } from "../shared-types"
import type { TokenUsageFinishPart, TokenUsagePart } from "./types"

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
