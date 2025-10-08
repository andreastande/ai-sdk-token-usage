import type { TokenUsageFinishPart, TokenUsageMetadata, TokenUsagePart } from "../types/metadata"

export function getTokenUsageMetadata({ part, modelId, providerId }: TokenUsageFinishPart): TokenUsageMetadata {
	return {
		totalUsage: part.totalUsage,
		modelId,
		providerId,
	}
}

export function toTokenUsageMetadata({ part, modelId, providerId }: TokenUsagePart): TokenUsageMetadata | undefined {
	switch (part.type) {
		case "finish":
			return {
				totalUsage: part.totalUsage,
				modelId,
				providerId,
			}
		default:
			return undefined
	}
}
