import type { Model } from "@/types/model"

export const models: Model[] = [
	{
		id: "gpt-5",
		name: "GPT-5",
		providerId: "openai",
	},
	{
		id: "gemini-2.5-flash",
		name: "Gemini 2.5 Flash",
		providerId: "google",
	},
	{
		id: "claude-sonnet-4-20250514",
		name: "Claude Sonnet 4",
		providerId: "anthropic",
	},
]
