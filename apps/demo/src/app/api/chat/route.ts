import { convertToModelMessages, gateway, streamText } from "ai"
import { extractTokenUsageMetadata, type UIMessage } from "ai-sdk-token-usage"
import type { Model } from "@/types/model"

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: Request) {
	const { messages, model }: { messages: UIMessage[]; model: Model } = await req.json()

	const result = streamText({
		model: gateway(`${model.providerId}/${model.id}`),
		messages: convertToModelMessages(messages),
		providerOptions: {
			openai: {
				reasoningSummary: "auto",
			},
			google: {
				thinkingConfig: {
					thinkingBudget: 8192,
					includeThoughts: true,
				},
			},
			anthropic: {
				thinking: {
					type: "enabled",
					budgetTokens: 12000,
				},
			},
		},
	})

	return result.toUIMessageStreamResponse({
		messageMetadata: ({ part }) => extractTokenUsageMetadata(part, model.id, model.providerId),
	})
}
