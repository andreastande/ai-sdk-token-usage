type HookError = {
	message: string
	status: number
	info: unknown
}

export type Result<T> = { state: "loading" } | { state: "error"; error: HookError } | { state: "success"; data: T }
