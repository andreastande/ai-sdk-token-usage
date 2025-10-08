import type { TokenAccountingPolicy } from "../types"

const DEFAULT_POLICY: TokenAccountingPolicy = { reasoningBakedIn: false }
const PROVIDER_POLICY: Record<string, TokenAccountingPolicy> = {
	openai: { reasoningBakedIn: true },
	google: { reasoningBakedIn: false },
	anthropic: { reasoningBakedIn: false },
}

export function getPolicy(providerId: string) {
	return PROVIDER_POLICY[providerId] ?? DEFAULT_POLICY
}
