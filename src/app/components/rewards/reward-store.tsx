"use client"

import * as React from "react"

export type RewardEntry = {
  id: string
  amount: number
  token: "BAZ"
  status: "Claimed"
  createdAt: string
}

const STORAGE_KEY = "baz_rewards_v1"

function readRewards(): RewardEntry[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as RewardEntry[]) : []
  } catch {
    return []
  }
}

function writeRewards(data: RewardEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {}
}

export function useRewards() {
  const [rewards, setRewards] = React.useState<RewardEntry[]>([])

  React.useEffect(() => {
    setRewards(readRewards())
  }, [])

  const addReward = React.useCallback((amount: number) => {
    const next: RewardEntry = {
      id: crypto.randomUUID(),
      amount,
      token: "BAZ",
      status: "Claimed",
      createdAt: new Date().toISOString(),
    }
    setRewards((prev) => {
      const merged = [next, ...prev]
      writeRewards(merged)
      return merged
    })
    return next
  }, [])

  return { rewards, addReward }
}
