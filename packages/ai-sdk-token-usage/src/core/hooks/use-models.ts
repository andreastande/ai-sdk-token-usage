"use client"

import useSWR from "swr"
import { FetchError } from "../errors"
import type { Provider } from "../types"

async function fetchModels<T>(url: string) {
  const res = await fetch(url)

  if (!res.ok) {
    throw new FetchError(res.status, await res.json())
  }

  return res.json() as Promise<T>
}

export function useModels() {
  const { data, isLoading, error } = useSWR<Record<string, Provider>, FetchError>("/__models.dev", fetchModels)

  return {
    data,
    isLoading,
    error,
  }
}
