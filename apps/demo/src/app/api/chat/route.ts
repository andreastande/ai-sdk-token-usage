import { convertToModelMessages, gateway, streamText, type UIMessage } from "ai"
import { toTokenUsageMetadata } from "ai-sdk-token-usage"
import type { Model } from "@/types/model"

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: Request) {
	const {
		messages,
		model: { modelId, providerId },
	}: { messages: UIMessage[]; model: Model } = await req.json()

	// const [prompt, recentAssistantMsg] = messages.slice(-2)

	const result = streamText({
		model: gateway(`${providerId}/${modelId}`),
		messages: convertToModelMessages(messages),
	})

	return result.toUIMessageStreamResponse({
		messageMetadata: ({ part }) => toTokenUsageMetadata({ part, modelId, providerId }),
	})
}
