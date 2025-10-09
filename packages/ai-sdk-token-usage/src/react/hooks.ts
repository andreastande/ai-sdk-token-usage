"use client"

import type { UIMessage } from "ai"
import { useMemo } from "react"
import useSWR from "swr"
import { CostComputationError, FetchError, MissingMetadataError, ModelNotFoundError, UnknownError } from "../errors"
import type { ContextWindow, Cost, ModelResolver, Provider, Result } from "../types"
import {
	computeContextWindow,
	computeCost,
	parseCanonicalSlug,
	resultError,
	resultLoading,
	resultSuccess,
} from "../utils"

function findLast<T>(arr: readonly T[], pred: (x: T) => boolean): T | undefined {
	for (let i = arr.length - 1; i >= 0; i--) {
		const v = arr[i]
		if (v === undefined) continue
		if (pred(v)) return v
	}
	return undefined
}

async function fetchModels<T>(url: string) {
	const res = await fetch(url)

	if (!res.ok) {
		throw new FetchError(res.status, await res.json())
	}

	return res.json() as Promise<T>
}

function useModels() {
	const { data, isLoading, error } = useSWR<Record<string, Provider>, FetchError>("/__models.dev", fetchModels)

	return {
		data,
		isLoading,
		error,
	}
}

export function useTokenContext(messages: readonly UIMessage[], canonicalSlug: string): Result<ContextWindow> {
	const { data: models, isLoading, error } = useModels()

	const mostRecentAssistantMessage = useMemo(() => findLast(messages, (m) => m.role === "assistant"), [messages])

	if (isLoading) return resultLoading()
	if (error) return resultError(error.toJSON())

	const { providerId, modelId } = parseCanonicalSlug(canonicalSlug)

	const model = models?.[providerId]?.models[modelId]
	if (!model) {
		return resultError(new ModelNotFoundError({ modelId, providerId }).toJSON())
	}

	try {
		return resultSuccess<ContextWindow>(computeContextWindow(mostRecentAssistantMessage, model))
	} catch (err) {
		if (err instanceof MissingMetadataError) {
			return resultError(err.toJSON())
		}
		return resultError(new UnknownError().toJSON())
	}
}

export function useTokenCost(messages: readonly UIMessage[]): Result<Cost>
export function useTokenCost(message: UIMessage): Result<Cost>

export function useTokenCost(input: UIMessage | readonly UIMessage[]): Result<Cost> {
	const { data: models, isLoading, error } = useModels()

	const messages = useMemo(() => (Array.isArray(input) ? input : [input]), [input])
	const assistantMessages = useMemo(() => messages.filter((m) => m.role === "assistant"), [messages])

	if (isLoading) return resultLoading()
	if (error) return resultError(error.toJSON())

	const resolveModel: ModelResolver = ({ providerId, modelId }) => models?.[providerId]?.models?.[modelId]

	try {
		return resultSuccess<Cost>(computeCost(assistantMessages, resolveModel))
	} catch (err) {
		if (err instanceof MissingMetadataError || err instanceof CostComputationError) {
			return resultError(err.toJSON())
		}
		return resultError(new UnknownError().toJSON())
	}
}
