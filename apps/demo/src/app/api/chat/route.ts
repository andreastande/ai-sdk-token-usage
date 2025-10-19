import { convertToModelMessages, gateway, streamText, type UIMessage } from "ai"
import { toTokenUsageMetadata } from "ai-sdk-token-usage/metadata"
import type { Model } from "@/types/model"

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: Request) {
  const { messages, model }: { messages: UIMessage[]; model: Model } = await req.json()

  const result = streamText({
    model: gateway(model.canonicalSlug),
    messages: convertToModelMessages(messages),
    providerOptions: {
      openai: {
        reasoningSummary: "auto",
      },
      google: {
        thinkingConfig: {
          thinkingBudget: 2000,
          includeThoughts: true,
        },
      },
      anthropic: {
        thinking: { type: "enabled", budgetTokens: 2000 },
      },
    },
  })

  return result.toUIMessageStreamResponse({
    messageMetadata: ({ part }) => toTokenUsageMetadata({ part, canonicalSlug: model.canonicalSlug }),
  })
}
