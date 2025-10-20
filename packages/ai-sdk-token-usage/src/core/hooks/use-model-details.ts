"use client"

import { CostComputationError, ModelNotFoundError } from "../errors"
import type { ModelDetails, Result } from "../types"
import { parseCanonicalSlug, resultError, resultLoading, resultSuccess } from "./helpers"
import { useModels } from "./use-models"

/**
 * React hook that retrieves **model details**, such as pricing and token limits.
 *
 * The hook derives model information directly from the model registry based on
 * the provided {@link canonicalSlug}. It returns structured data including
 * per-token pricing (input, output, reasoning, cached input) and context/output
 * token limits.
 *
 * Internally, the hook leverages SWR and follows the SWR-style return pattern with
 * `data`, `isLoading`, and `error` states for consistent asynchronous handling.
 *
 * @param params - The parameters for the hook.
 * @param params.canonicalSlug - The canonical model identifier, composed of provider and model ID
 * (e.g. `"openai/gpt-5"`).
 *
 * @returns A {@link Result} object containing:
 * - `data`: The resolved {@link ModelDetails}, including pricing and limits.
 * - `isLoading`: Whether model data is still being loaded.
 * - `error`: A {@link TokenUsageError} if an error occurred.
 */
export function useModelDetails({ canonicalSlug }: { canonicalSlug: string }): Result<ModelDetails> {
  const { data: models, isLoading, error } = useModels()

  if (isLoading) return resultLoading()
  if (error) return resultError(error.toJSON())

  const { providerId, modelId } = parseCanonicalSlug(canonicalSlug)

  const model = models?.[providerId]?.models[modelId]
  if (!model) {
    return resultError(new ModelNotFoundError({ providerId, modelId }).toJSON())
  }
  if (!model.cost) {
    return resultError(new CostComputationError({ providerId, modelId }))
  }

  const cost = model.cost
  const limit = model.limit

  const modelDetails: ModelDetails = {
    canonicalSlug,
    pricing: {
      input: cost.input,
      output: cost.output,
      reasoning: cost.reasoning ?? cost.output,
      cachedInput: cost.cache_read ?? cost.input,
    },
    limit,
  }

  return resultSuccess<ModelDetails>(modelDetails)
}
