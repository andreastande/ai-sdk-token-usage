// Specific to metadata, public + internal
import type { FinishReason, LanguageModelUsage, TextStreamPart, ToolSet } from "ai"

/**
 * Represents a single part of a streamed model response along with
 * the canonical model identifier.
 *
 * Used when generating metadata for a model response that may or may
 * not yet be finished.
 */
export type TokenUsagePart = {
  /** The streamed message part (start, text-delta, finish etc.). */
  part: TextStreamPart<ToolSet>
  /** The canonical model identifier (e.g., "openai/gpt-5"). */
  canonicalSlug: string
}

/**
 * Represents a `finish` part of a model response, which includes
 * the total token usage and reason for completion.
 *
 * Used when generating metadata after the model output is complete.
 */
export type TokenUsageFinishPart = {
  /** The completed model response part containing total usage info. */
  part: {
    type: "finish"
    finishReason: FinishReason
    totalUsage: LanguageModelUsage
  }
  /** The canonical model identifier (e.g., "openai/gpt-5"). */
  canonicalSlug: string
}
