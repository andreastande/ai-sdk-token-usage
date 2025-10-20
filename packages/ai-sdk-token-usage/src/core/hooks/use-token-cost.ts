"use client"

import type { UIMessage } from "ai"
import { useMemo } from "react"
import type { TokenUsageMetadata } from "../../shared-types"
import { CostComputationError, MissingMetadataError, ModelNotFoundError } from "../errors"
import type { Cost, CostBreakdown, ModelResolver, Result } from "../types"
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

function computeCost(messages: readonly UIMessage[], resolveModel: ModelResolver): Cost {
  const breakdown: CostBreakdown = {
    input: { amount: 0, cost: 0 },
    output: { amount: 0, cost: 0 },
    reasoning: { amount: 0, cost: 0 },
    cachedInput: { amount: 0, cost: 0 },
  }

  messages.forEach((m) => {
    if (hasInvalidTokenUsageMetadata(m)) {
      throw new MissingMetadataError({ message: m, metadata: m.metadata })
    }

    const { canonicalSlug } = m.metadata as TokenUsageMetadata
    const { providerId, modelId } = parseCanonicalSlug(canonicalSlug)

    const model = resolveModel({ providerId, modelId })

    if (!model) {
      throw new ModelNotFoundError({ providerId, modelId })
    }
    if (!model.cost) {
      throw new CostComputationError({ providerId, modelId })
    }

    const tokens = normalizeTokenUsage(m)
    const cost = model.cost

    breakdown.input.amount += tokens.input
    breakdown.input.cost += (tokens.input / 1_000_000) * cost.input

    breakdown.output.amount += tokens.output
    breakdown.output.cost += (tokens.output / 1_000_000) * cost.output

    breakdown.reasoning.amount += tokens.reasoning
    breakdown.reasoning.cost += (tokens.reasoning / 1_000_000) * (cost.reasoning ?? cost.output)

    breakdown.cachedInput.amount += tokens.cachedInput
    breakdown.cachedInput.cost += (tokens.cachedInput / 1_000_000) * (cost.cache_read ?? cost.input)
  })

  const total = Object.values(breakdown).reduce((sum, v) => sum + v.cost, 0)

  return { breakdown, total, currency: "USD" }
}

/**
 * React hook that computes the **monetary cost** of token usage for assistant messages.
 *
 * The hook derives cost directly from message metadata and the model’s pricing
 * information. It returns pre-computed values such as the total cost, a detailed
 * cost breakdown per token type (input, output, reasoning, cached input), and the
 * currency.
 *
 * Internally, the hook leverages SWR and follows the SWR-style return pattern with
 * `data`, `isLoading`, and `error` states for consistent asynchronous handling.
 *
 * @param params - The parameters for the hook. Exactly one of the following must be provided:
 * - `messages`: All chat messages (typically returned from `useChat`).
 * - `message`: A single assistant message.
 *
 * @returns A {@link Result} object containing:
 * - `data`: The computed {@link Cost} with `breakdown`, `total`, and `currency`.
 * - `isLoading`: Whether model pricing data is still being loaded.
 * - `error`: A {@link TokenUsageError} if an error occurred.
 */
export function useTokenCost({ messages }: { messages: readonly UIMessage[] }): Result<Cost>
export function useTokenCost({ message }: { message: UIMessage }): Result<Cost>

export function useTokenCost(params: { messages: readonly UIMessage[] } | { message: UIMessage }): Result<Cost> {
  const { data: models, isLoading, error } = useModels()

  const messages: readonly UIMessage[] = "messages" in params ? params.messages : [params.message]
  const assistantMessages = useMemo(
    () => messages.filter((m) => m.role === "assistant" && m.metadata !== undefined),
    [messages],
  )

  if (isLoading) return resultLoading()
  if (error) return resultError(error.toJSON())

  const resolveModel: ModelResolver = ({ providerId, modelId }) => models?.[providerId]?.models?.[modelId]

  try {
    return resultSuccess<Cost>(computeCost(assistantMessages, resolveModel))
  } catch (err) {
    return resultError(toTokenUsageError(err))
  }
}
