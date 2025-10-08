export class FetchError extends Error {
	status: number
	info: unknown

	constructor(status: number, info: unknown, message?: string) {
		super(message ?? "An error occured while fetching the data")
		this.name = "FetchError"
		this.status = status
		this.info = info
	}

	toJSON() {
		return {
			message: this.message,
			status: this.status,
			info: this.info,
		}
	}
}

export class ModelNotFoundError extends FetchError {
	constructor(info: unknown) {
		super(404, info, "Model not found in catalog. Visit https://models.dev to see the catalog")
		this.name = "ModelNotFoundError"
	}
}

export class CostComputationError extends FetchError {
	constructor(info: unknown) {
		super(
			404,
			info,
			"Cost computation failed: some models were not found in catalog or lack pricing. Visit https://models.dev to see the catalog",
		)
		this.name = "CostComputationError"
	}
}
