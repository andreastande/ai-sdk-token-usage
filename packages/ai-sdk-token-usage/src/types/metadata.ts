import type { FinishReason, LanguageModelUsage, TextStreamPart, ToolSet } from "ai"

export type TokenUsageMetadata = {
	totalUsage: LanguageModelUsage
	modelId: string
	providerId: string
}

export type TokenUsagePart = {
	part: TextStreamPart<ToolSet>
	modelId: string
	providerId: string
}

export type TokenUsageFinishPart = {
	part: {
		type: "finish"
		finishReason: FinishReason
		totalUsage: LanguageModelUsage
	}
	modelId: string
	providerId: string
}
