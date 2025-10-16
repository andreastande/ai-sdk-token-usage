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

export function useTokenContext(messages: readonly UIMessage[], canonicalSlug: string): Result<Context> {
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
