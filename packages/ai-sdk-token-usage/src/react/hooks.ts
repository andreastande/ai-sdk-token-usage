"use client"

import useSWR from "swr"
import { type CostComputationError, FetchError, ModelNotFoundError } from "../errors"
import type { ContextWindow, Cost, Provider, Result, UIMessage } from "../types"
import { computeContextWindow, computeCost, isAssistantWithUsage } from "../utils/index"

async function fetchModels<T>(url: string) {
	const res = await fetch(url)

	if (!res.ok) {
		throw new FetchError(res.status, await res.json())
	}

	return res.json() as Promise<T>
}

function useModels(): Result<Record<string, Provider>> {
	const { data, isLoading, error } = useSWR<Record<string, Provider>, FetchError>("/__models.dev", fetchModels)

	return {
		data,
		isLoading,
		error: error ? error.toJSON() : null,
	}
}

export function useContextWindow({
	messages,
	modelId,
	providerId,
}: {
	messages: readonly UIMessage[]
	modelId: string
	providerId: string
}): Result<ContextWindow> {
	const { data: models, isLoading, error } = useModels()

	if (isLoading) return { data: undefined, isLoading: true, error: null }
	if (error) return { data: undefined, isLoading: false, error: error }

	const model = models?.[providerId]?.models[modelId]
	if (!model) {
		return { data: undefined, isLoading: false, error: new ModelNotFoundError({ modelId, providerId }).toJSON() }
	}

	const mostRecentMessage = messages.filter(isAssistantWithUsage).at(-1)
	return { data: computeContextWindow(mostRecentMessage, model), isLoading: false, error: null }
}

export function useCost(messages: readonly UIMessage[]): Result<Cost>
export function useCost(message: UIMessage): Result<Cost>

export function useCost(input: UIMessage | readonly UIMessage[]): Result<Cost> {
	const { data: models, isLoading, error } = useModels()

	if (isLoading) return { data: undefined, isLoading: true, error: null }
	if (error) return { data: undefined, isLoading: false, error: error }

	const messagesArray = Array.isArray(input) ? input : [input]
	const messagesWithUsage = messagesArray.filter(isAssistantWithUsage)

	try {
		return {
			data: computeCost(messagesWithUsage, ({ providerId, modelId }) => models?.[providerId]?.models?.[modelId]),
			isLoading: false,
			error: null,
		}
	} catch (err) {
		return { data: undefined, isLoading: false, error: (err as CostComputationError).toJSON() }
	}
}
