export function formatTokenAmount(tokens: number) {
	return new Intl.NumberFormat("en-US", {
		notation: "compact",
	}).format(tokens)
}

export function formatPrice(price: number, currency: string = "USD") {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency,
	}).format(price)
}
