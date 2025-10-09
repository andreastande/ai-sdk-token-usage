import type { UIMessage } from "ai"
import type { TokenUsageMetadata } from "../types/metadata"

export function hasInvalidTokenUsageMetadata(message: UIMessage | undefined): boolean {
	if (!message) return false

	const meta = (message as { metadata?: unknown }).metadata
	if (meta == null) return true

	const m = meta as Partial<TokenUsageMetadata> & Record<string, unknown>

	const hasIds = typeof m.modelId === "string" && typeof m.providerId === "string"
	const hasTotalUsage = typeof m.totalUsage === "object" && m.totalUsage !== null

	return !(hasIds && hasTotalUsage)
}
