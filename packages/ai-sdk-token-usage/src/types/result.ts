export type TokenUsageError = {
	message: string
	status: number
	info: unknown
}

export type Result<T> = {
	data: T | undefined
	isLoading: boolean
	error: TokenUsageError | null
}
