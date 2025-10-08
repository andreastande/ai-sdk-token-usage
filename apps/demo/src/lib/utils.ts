import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { models } from "./models"

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

export function getModel(modelId: string) {
	// biome-ignore lint/style/noNonNullAssertion: assume safe
	return models.find((m) => m.modelId === modelId)!
}
