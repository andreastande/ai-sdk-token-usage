"use client"

import useSWR from "swr"
import type { ProviderRaw, TokenUsageMetadata, UIMessage } from "./types"

const fetcher = <T>(url: string) => fetch(url).then((res) => res.json() as Promise<T>)

function useModels() {
	const { data } = useSWR<Record<string, ProviderRaw>>("/__models", fetcher)

	return data
}

export function useMessageUsage(message: UIMessage) {
	const models = useModels()

	const model = message.metadata ? models?.[message.metadata?.providerId]?.models[message.metadata?.modelId] : undefined

	console.log(model)
}

export function useConversationUsage(messages: readonly UIMessage[]) {
	// const models = useModels()

	const assistantMessages = messages.filter(
		(m): m is UIMessage & { metadata: TokenUsageMetadata } => m.role === "assistant" && m.metadata !== undefined,
	)

	console.log(assistantMessages)

	// const usage = {}

	// const lastAssistantReply = assistantMessages[assistantMessages.length - 1]?.metadata.modelId
}

/*
  contextWindow: {
    breakdown: {
      input: number
      output: number
      reasoning: number
      cachedInput: number
    }
    used: number,
    limit: number,
    remaining: number
    fractionUsed: number,
    percentageUsed: number
  }
  cost: {
    breakdown: {
      input: number
      output: number
      reasoning: number
      cachedInput: number
    }
    total: number
    currency: USD
  }
  metadata: {
    model: {
      id: string
      name: string
      pricing: {
        input: number
        output: number
        reasoning?: number
        cachRead?: number
        cacheWrite?: number
        inputAudio?: number
        outputAudio?: number
      }
      tokenLimits: {
        context: number
        output: number
      }
    }
    provider: {
      id: string
      name: string
    }
  }
*/
