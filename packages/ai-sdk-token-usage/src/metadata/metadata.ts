import type { TokenUsageMetadata } from "../shared-types"
import type { TokenUsageFinishPart, TokenUsagePart } from "./types"

/**
 * Generates token usage metadata for a completed model response.
 *
 * This helper should be used when you have access to a `finish` part
 * (e.g., at the end of a streamed AI response) and want to attach
 * token usage information to the message metadata.
 *
 * @param part - The final part of the model response, containing total token usage details.
 * @param canonicalSlug - The canonical model identifier (e.g., "openai/gpt-5").
 * @returns A {@link TokenUsageMetadata} object containing total token usage and model identifier metadata.
 */
export function getTokenUsageMetadata({ part, canonicalSlug }: TokenUsageFinishPart): TokenUsageMetadata {
  return {
    totalUsage: part.totalUsage,
    canonicalSlug,
  }
}

/**
 * Generates token usage metadata conditionally for a message part.
 *
 * This helper is typically passed to the `messageMetadata` callback
 * in `toUIMessageStreamResponse`. It automatically returns metadata
 * only for `finish` parts of a streamed response, ensuring that
 * token usage is attached only when the model output is complete.
 *
 * @param part - A streamed message part (input, output, or finish).
 * @param canonicalSlug - The canonical model identifier (e.g., "openai/gpt-5").
 * @returns A {@link TokenUsageMetadata} object if the part type is `finish`, otherwise `undefined`.
 */
export function toTokenUsageMetadata({ part, canonicalSlug }: TokenUsagePart): TokenUsageMetadata | undefined {
  switch (part.type) {
    case "finish":
      return {
        totalUsage: part.totalUsage,
        canonicalSlug,
      }
    default:
      return undefined
  }
}
