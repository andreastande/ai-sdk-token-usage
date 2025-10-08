export type Breakdown = {
	input: number
	output: number
	reasoning: number
	cachedInput: number
}

export type NormalizedTokenUsage = Breakdown

export type ContextWindow = {
	breakdown: Breakdown
	used: number
	limit: number
	remaining: number
	fractionUsed: number
	percentageUsed: number
}

export type Cost = {
	breakdown: Breakdown
	total: number
	currency: "USD"
}

export type TokenAccountingPolicy = {
	reasoningBakedIn: boolean
}
