"use client"

import { CostComputationError, ModelNotFoundError } from "../errors"
import type { Result, TokenDetails } from "../types"
import { parseCanonicalSlug, resultError, resultLoading, resultSuccess } from "./helpers"
import { useModels } from "./use-models"

export function useTokenDetails(canonicalSlug: string): Result<TokenDetails> {
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

	const tokenDetails: TokenDetails = {
		canonicalSlug,
		pricing: {
			input: cost.input,
			output: cost.output,
			reasoning: cost.reasoning ?? cost.output,
			cachedInput: cost.cache_read ?? cost.input,
		},
		limit,
	}

	return resultSuccess<TokenDetails>(tokenDetails)
}
