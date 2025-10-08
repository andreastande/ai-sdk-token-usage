import type { FinishReason, LanguageModelUsage, TextStreamPart, ToolSet } from "ai"
import type { TokenUsageMetadata } from "../types"

export function getTokenUsageMetadata(
	part: {
		type: "finish"
		finishReason: FinishReason
		totalUsage: LanguageModelUsage
	},
	modelId: string,
	providerId: string,
): TokenUsageMetadata {
	return {
		totalUsage: part.totalUsage,
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
