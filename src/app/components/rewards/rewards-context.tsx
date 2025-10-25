"use client"

import React from "react"

export type RewardEntry = {
  id: string
  amount: number
  claimedAt: string
}

type RewardsState = {
  rewards: RewardEntry[]
  claim: (amount: number) => void
}

const RewardsContext = React.createContext<RewardsState | null>(null)
const STORAGE_KEY = "baz_rewards_v1"

export function RewardsProvider({ children }: { children: React.ReactNode }) {
  const [rewards, setRewards] = React.useState<RewardEntry[]>([])

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setRewards(JSON.parse(raw))
    } catch {}
  }, [])

  React.useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rewards))
    } catch {}
  }, [rewards])

  const claim = React.useCallback((amount: number) => {
    setRewards((prev) => [{ id: crypto.randomUUID(), amount, claimedAt: new Date().toISOString() }, ...prev])
  }, [])

  return <RewardsContext.Provider value={{ rewards, claim }}>{children}</RewardsContext.Provider>
}

export function useRewards() {
  const ctx = React.useContext(RewardsContext)
  if (!ctx) throw new Error("useRewards must be used within RewardsProvider")
  return ctx
}
