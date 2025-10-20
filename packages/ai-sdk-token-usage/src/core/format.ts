/**
 * Formats a numeric token count into a compact, human-readable string.
 *
 * Uses the built-in `Intl.NumberFormat` API with `"compact"` notation
 * (e.g., `1K`, `2.5M`) and a U.S. English locale.
 *
 * @example
 * ```ts
 * formatTokenAmount(15230) // "15.2K"
 * formatTokenAmount(1000000) // "1M"
 * ```
 *
 * @param tokens - The number of tokens to format.
 * @returns A compact, localized string representation of the token amount.
 */
export function formatTokenAmount(tokens: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
  }).format(tokens)
}

/**
 * Formats a numeric value as a localized currency string.
 *
 * Uses the built-in `Intl.NumberFormat` API to format the given price
 * in the specified currency. Defaults to USD if no currency code is provided.
 *
 * @example
 * ```ts
 * formatPrice(0.032) // "$0.03"
 * formatPrice(1.2, "EUR") // "€1.20"
 * ```
 *
 * @param price - The numeric value to format as a currency.
 * @param currency - The ISO 4217 currency code (defaults to `"USD"`).
 * @returns A localized currency string representing the formatted price.
 */
export function formatPrice(price: number, currency: string = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(price)
}
