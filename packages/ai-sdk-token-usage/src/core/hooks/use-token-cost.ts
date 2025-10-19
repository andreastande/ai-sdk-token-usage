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

export function useTokenCost({ messages }: { messages: readonly UIMessage[] }): Result<Cost>
export function useTokenCost({ message }: { message: UIMessage }): Result<Cost>

export function useTokenCost(args: { messages: readonly UIMessage[] } | { message: UIMessage }): Result<Cost> {
  const { data: models, isLoading, error } = useModels()

  const messages: readonly UIMessage[] = "messages" in args ? args.messages : [args.message]
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
