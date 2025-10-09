import type { FinishReason, LanguageModelUsage, TextStreamPart, ToolSet } from "ai"

export type TokenUsageMetadata = {
	totalUsage: LanguageModelUsage
	canonicalSlug: string
}

export type TokenUsagePart = {
	part: TextStreamPart<ToolSet>
	canonicalSlug: string
}

export type TokenUsageFinishPart = {
	part: {
		type: "finish"
		finishReason: FinishReason
		totalUsage: LanguageModelUsage
	}
	canonicalSlug: string
}
