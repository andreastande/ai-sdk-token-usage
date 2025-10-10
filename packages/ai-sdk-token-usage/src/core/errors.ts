import type { TokenUsageError } from "./types"

export class BaseError extends Error {
	status: number
	info: unknown

	constructor(status: number, info: unknown, message?: string) {
		super(message ?? "An error occurred")
		this.name = "BaseError"
		this.status = status
		this.info = info
	}

	toJSON(): TokenUsageError {
		return {
			message: this.message,
			status: this.status,
			info: this.info,
		}
	}
}

export class FetchError extends BaseError {
	constructor(status: number, info: unknown, message?: string) {
		super(status, info, message ?? "An error occurred while fetching the data")
		this.name = "FetchError"
	}
}

export class ModelNotFoundError extends BaseError {
	constructor(info: unknown) {
		super(404, info, "Model not found in catalog. Visit https://models.dev to see the catalog")
		this.name = "ModelNotFoundError"
	}
}

export class MissingMetadataError extends BaseError {
	constructor(info: unknown) {
		super(
			422,
			info,
			"Message metadata is missing or invalid. Expected metadata to include TokenUsageMetadata fields: { totalUsage: LanguageModelUsage, canonicalSlug: string }. Extra fields are allowed.",
		)
		this.name = "MissingMetadataError"
	}
}

export class CostComputationError extends BaseError {
	constructor(info: unknown) {
		super(404, info, "Cost computation failed: some models lack pricing. Visit https://models.dev to see the catalog")
		this.name = "CostComputationError"
	}
}

export class UnknownError extends BaseError {
	constructor() {
		super(500, {}, "An unknown error occured")
		this.name = "UnknownError"
	}
}
