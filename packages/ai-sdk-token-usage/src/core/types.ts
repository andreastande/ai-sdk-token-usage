// Specific to core, public + internal

export type Result<T> = {
	data: T | undefined
	isLoading: boolean
	error: TokenUsageError | null
}

export type TokenUsageError = {
	message: string
	status: number
	info: unknown
}

export type Breakdown = {
	input: number
	output: number
	reasoning: number
	cachedInput: number
}

export type ContextWindow = {
	breakdown: Breakdown
	used: number
	limit: number
	remaining: number
	fractionUsed: number
	percentageUsed: number
	isExceeded: boolean
}

export type Cost = {
	breakdown: Breakdown
	total: number
	currency: "USD"
}

export type TokenDetails = {
	canonicalSlug: string
	pricing: Breakdown
	limit: {
		context: number
		output: number
	}
}

/** @internal */
export type NormalizedTokenUsage = Breakdown

/** @internal */
export type TokenAccountingPolicy = {
	reasoningBakedIn: boolean
}

/** @internal */
export type Provider = {
	id: string
	env: string[]
	npm: string
	api?: string
	name: string
	doc: string
	models: Record<string, Model>
}

/** @internal */
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

/** @internal */
export type ModelResolver = (ids: { providerId: string; modelId: string }) => Model | undefined
