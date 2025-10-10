"use client"

import type { UIMessage } from "ai"
import { useMemo } from "react"
import type { TokenUsageMetadata } from "../../shared-types"
import { CostComputationError, MissingMetadataError, ModelNotFoundError } from "../errors"
import type { Cost, ModelResolver, Result } from "../types"
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

export function computeCost(messages: readonly UIMessage[], resolveModel: ModelResolver): Cost {
	const breakdown = { input: 0, output: 0, reasoning: 0, cachedInput: 0 }

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

		breakdown.input += (tokens.input / 1_000_000) * cost.input
		breakdown.output += (tokens.output / 1_000_000) * cost.output
		breakdown.reasoning += (tokens.reasoning / 1_000_000) * (cost.reasoning ?? cost.output)
		breakdown.cachedInput += (tokens.cachedInput / 1_000_000) * (cost.cache_read ?? cost.input)
	})

	const total = Object.values(breakdown).reduce((sum, v) => sum + v, 0)

	return { breakdown, total, currency: "USD" }
}

export function useTokenCost(messages: readonly UIMessage[]): Result<Cost>
export function useTokenCost(message: UIMessage): Result<Cost>

export function useTokenCost(input: UIMessage | readonly UIMessage[]): Result<Cost> {
	const { data: models, isLoading, error } = useModels()

	const messages = useMemo(() => (Array.isArray(input) ? input : [input]), [input])
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
