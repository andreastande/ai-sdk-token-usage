"use client"

import type { UIMessage } from "ai"
import { useMemo } from "react"
import { MissingMetadataError, ModelNotFoundError } from "../errors"
import type { Context, Model, Result } from "../types"
import {
  hasInvalidTokenUsageMetadata,
  normalizeTokenUsage,
  parseCanonicalSlug,
  resultError,
  resultLoading,
  resultSuccess,
  toTokenUsageError,
} from "./helpers"
import { useModels } from "./use-models"

function findLast<T>(arr: readonly T[], pred: (x: T) => boolean): T | undefined {
  for (let i = arr.length - 1; i >= 0; i--) {
    const v = arr[i]
    if (v === undefined) continue
    if (pred(v)) return v
  }
  return undefined
}

function computeContext(message: UIMessage | undefined, model: Model): Context {
  if (message && hasInvalidTokenUsageMetadata(message)) {
    throw new MissingMetadataError({ message, metadata: message.metadata })
  }

  const breakdown = message ? normalizeTokenUsage(message, true) : { input: 0, output: 0, reasoning: 0, cachedInput: 0 }

  const used = Object.values(breakdown).reduce((sum, v) => sum + v, 0)
  const limit = model.limit.context
  const remaining = Math.max(0, limit - used)
  const fractionUsed = limit > 0 ? used / limit : 0
  const percentageUsed = fractionUsed * 100
  const isExceeded = used > limit

  return {
    breakdown,
    used,
    limit,
    remaining,
    fractionUsed,
    percentageUsed,
    isExceeded,
  }
}

/**
 * React hook that provides insight into how much of the model’s context window is remaining.
 *
 * The hook derives usage information directly from the message metadata and the model’s defined
 * context window. It returns pre-computed values such as used and remaining tokens, percentage used,
 * and whether the context limit has been exceeded.
 *
 * Internally, the hook leverages SWR and follows the SWR-style return pattern with
 * `data`, `isLoading`, and `error` states for consistent asynchronous handling.
 *
 * @param params - The parameters for the hook.
 * @param params.messages - The messages in the chat, typically returned from `useChat`.
 * @param params.canonicalSlug - The canonical model identifier, composed of provider and model ID (e.g. `"openai/gpt-5"`).
 *
 * @returns A {@link Result} object containing:
 * - `data`: The computed {@link Context} with usage metrics.
 * - `isLoading`: Whether model data is still being loaded.
 * - `error`: A {@link TokenUsageError} if an error occurred.
 */
export function useTokenContext({
  messages,
  canonicalSlug,
}: {
  messages: readonly UIMessage[]
  canonicalSlug: string
}): Result<Context> {
  const { data: models, isLoading, error } = useModels()

  const mostRecentAssistantMessage = useMemo(
    () => findLast(messages, (m) => m.role === "assistant" && m.metadata !== undefined),
    [messages],
  )

  if (isLoading) return resultLoading()
  if (error) return resultError(error.toJSON())

  const { providerId, modelId } = parseCanonicalSlug(canonicalSlug)

  const model = models?.[providerId]?.models[modelId]
  if (!model) {
    return resultError(new ModelNotFoundError({ modelId, providerId }).toJSON())
  }

  try {
    return resultSuccess<Context>(computeContext(mostRecentAssistantMessage, model))
  } catch (err) {
    return resultError(toTokenUsageError(err))
  }
}
