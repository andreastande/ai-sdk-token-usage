// shared by core and metadata, public + internal

import type { LanguageModelUsage } from "ai"

export type TokenUsageMetadata = {
  totalUsage: LanguageModelUsage
  canonicalSlug: string
}
