export type Model = {
	id: string
	name: string
	attachment: boolean
	reasoning: boolean
	temperature: boolean
	tool_call: boolean
	knowledge?: string
	release_date: string
	last_updated: string
	modalities: {
		input: ("text" | "audio" | "image" | "video" | "pdf")[]
		output: ("text" | "audio" | "image" | "video" | "pdf")[]
	}
	open_weights: boolean
	cost?: {
		input: number
		output: number
		reasoning?: number
		cache_read?: number
		cache_write?: number
		input_audio?: number
		output_audio?: number
	}
	limit: {
		context: number
		output: number
	}
	experimental?: boolean
	provider?: {
		npm?: string
		api?: string
	}
}

export type Provider = {
	id: string
	env: string[]
	npm: string
	api?: string
	name: string
	doc: string
	models: Record<string, Model>
}

export type ModelResolver = (ids: { providerId: string; modelId: string }) => Model | undefined
