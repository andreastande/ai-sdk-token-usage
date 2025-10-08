export class FetchError {
	message: string
	status: number
	info: unknown

	constructor(status: number, info: unknown) {
		this.message = "An error occured while fetching the data"
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
		super(404, info)
		this.message = "Model not found in catalog. Visit https://models.dev to see the catalog"
	}
}

export class CostComputationError extends FetchError {
	constructor(info: unknown) {
		super(404, info)
		this.message =
			"Cost computation failed: some models were not found in catalog or lack pricing. Visit https://models.dev to see the catalog"
	}
}
