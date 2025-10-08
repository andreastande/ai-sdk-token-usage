import type { LanguageModelUsage, UIMessage as UIMessageOriginal } from "ai"

export type TokenUsageMetadata = {
	totalUsage: LanguageModelUsage
	modelId: string
	providerId: string
}

export type UIMessage = UIMessageOriginal<TokenUsageMetadata>

export type AssistantWithUsage = UIMessageOriginal<TokenUsageMetadata> & {
	role: "assistant"
	metadata: TokenUsageMetadata
}
