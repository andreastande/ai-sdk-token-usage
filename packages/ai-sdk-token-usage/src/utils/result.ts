import type { TokenUsageError } from "../types"

export function resultError(error: TokenUsageError) {
	return {
		data: undefined,
		isLoading: false,
		error,
	}
}

export function resultLoading() {
	return {
		data: undefined,
		isLoading: true,
		error: null,
	}
}

export function resultSuccess<T>(data: unknown) {
	return {
		data: data as T,
		isLoading: false,
		error: null,
	}
}
