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
      name: this.name,
      message: this.message,
      status: this.status,
      info: this.info,
    }
  }
}

export class FetchError extends BaseError {
  constructor(status: number, info: unknown, message?: string) {
    super(
      status,
      info,
      message ?? "Network request failed or returned an unexpected status. Check `status` and `info` for details.",
    )
    this.name = "FetchError"
  }
}

export class ModelNotFoundError extends BaseError {
  constructor(info: unknown) {
    super(
      404,
      info,
      "Model not found in catalog. Verify the model ID/provider, or inspect the catalog at https://models.dev.",
    )
    this.name = "ModelNotFoundError"
  }
}

export class MissingMetadataError extends BaseError {
  constructor(info: unknown) {
    super(
      422,
      info,
      "Message metadata is missing or invalid. Expected { totalUsage: LanguageModelUsage, canonicalSlug: string }. Extra fields are allowed.",
    )
    this.name = "MissingMetadataError"
  }
}

export class CostComputationError extends BaseError {
  constructor(info: unknown) {
    super(
      404,
      info,
      "Cost computation failed: pricing is missing for one or more models. Visit https://models.dev to see the catalog",
    )
    this.name = "CostComputationError"
  }
}

export class UnknownError extends BaseError {
  constructor() {
    super(500, undefined, "An unknown error occured")
    this.name = "UnknownError"
  }
}
