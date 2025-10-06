import type { LanguageModelUsage, TextStreamPart, ToolSet } from "ai"
import type { TokenUsageMetadata } from "./types"

export function getTokenUsageMetadata(
	totalUsage: LanguageModelUsage,
	modelId: string,
	providerId: string,
): TokenUsageMetadata {
	return {
		totalUsage,
		modelId,
		providerId,
	}
}

export function extractTokenUsageMetadata(
	part: TextStreamPart<ToolSet>,
	modelId: string,
	providerId: string,
): TokenUsageMetadata | undefined {
	switch (part.type) {
		case "finish":
			return {
				totalUsage: part.totalUsage,
				modelId,
				providerId,
			} satisfies TokenUsageMetadata
		default:
			return undefined
	}
}
