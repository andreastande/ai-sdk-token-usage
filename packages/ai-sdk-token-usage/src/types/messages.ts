import type { UIMessage as UIMessageOriginal } from "ai"
import type { TokenUsageMetadata } from "./metadata"

export type UIMessage = UIMessageOriginal<TokenUsageMetadata>

export type AssistantWithUsage = UIMessageOriginal<TokenUsageMetadata> & {
	role: "assistant"
	metadata: TokenUsageMetadata
}
