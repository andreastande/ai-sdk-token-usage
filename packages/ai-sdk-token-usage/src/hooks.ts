"use client"

import useSWR from "swr"
import { type CostComputationError, FetchError, ModelNotFoundError } from "./errors"
import type { ContextWindow, Cost, Provider, Result, UIMessage } from "./types"
import { computeContextWindow, computeCost, isAssistantWithUsage } from "./utils/index"

async function fetchModels<T>(url: string) {
	const res = await fetch(url)

	if (!res.ok) {
		throw new FetchError(res.status, await res.json())
	}

	return res.json() as Promise<T>
}

function useModels(): Result<Record<string, Provider>> {
	const { data, isLoading, error } = useSWR<Record<string, Provider>, FetchError>("/__models.dev", fetchModels)

	if (isLoading) return { state: "loading" }
	if (error) return { state: "error", error: error.toJSON() }
	if (!data) return { state: "loading" }

	return { state: "success", data }
}

export function useContextWindow(
	messages: readonly UIMessage[],
	modelInfo: {
		modelId: string
		providerId: string
	},
): Result<ContextWindow> {
	const modelsRes = useModels()

	if (modelsRes.state !== "success") return modelsRes

	const model = modelsRes.data[modelInfo.providerId]?.models[modelInfo.modelId]
	if (!model) {
		return {
			state: "error",
			error: new ModelNotFoundError(modelInfo).toJSON(),
		}
	}

	const mostRecentMessage = messages.filter(isAssistantWithUsage).at(-1)

	return { state: "success", data: computeContextWindow(mostRecentMessage, model) }
}

export function useCost(messages: readonly UIMessage[]): Result<Cost>
export function useCost(message: UIMessage): Result<Cost>

export function useCost(input: UIMessage | readonly UIMessage[]): Result<Cost> {
	const modelsRes = useModels()

	if (modelsRes.state !== "success") return modelsRes

	const messagesArray = Array.isArray(input) ? input : [input]
	const messagesWithUsage = messagesArray.filter(isAssistantWithUsage)

	try {
		return {
			state: "success",
			data: computeCost(messagesWithUsage, ({ providerId, modelId }) => modelsRes.data[providerId]?.models?.[modelId]),
		}
	} catch (err) {
		return { state: "error", error: (err as CostComputationError).toJSON() }
	}
}
