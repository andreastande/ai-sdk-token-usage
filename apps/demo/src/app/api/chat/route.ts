import { convertToModelMessages, gateway, streamText } from "ai"
import { toTokenUsageMetadata, type UIMessage } from "ai-sdk-token-usage"
import type { Model } from "@/types/model"

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: Request) {
	const {
		messages,
		model: { modelId, providerId },
	}: { messages: UIMessage[]; model: Model } = await req.json()

	const result = streamText({
		model: gateway(`${providerId}/${modelId}`),
		messages: convertToModelMessages(messages),
	})

	return result.toUIMessageStreamResponse({
		messageMetadata: ({ part }) => toTokenUsageMetadata({ part, modelId, providerId }),
	})
}
