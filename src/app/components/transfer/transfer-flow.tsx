"use client"

import * as React from "react"
import { LiquidTransfer } from "./liquid-transfer"
import { useToast } from "@/app/components/ui/use-toast"
import { ScratchCardPlay } from "./scratch-card-play"
import { useRewards } from "@/app/components/rewards/reward-store"

export function TransferFlow() {
  const { toast } = useToast()
  const { addReward } = useRewards()
  const [scratchOpen, setScratchOpen] = React.useState(false)
  const [scratchAmount, setScratchAmount] = React.useState<number>(0)
  const [resetKey, setResetKey] = React.useState(0)

  const handleSubmit = (payload: {
    fromAccount: string
    toAccount: string
    token: "U2U" | "BAZ"
    amount: string
  }) => {
    // success toast in glass style
    toast({
      title: "Transfer successful",
      description: `${payload.amount} ${payload.token} sent to ${payload.toAccount.slice(0, 6)}...`,
    })

    // open scratch with random 1..10 BAZ
    const prize = Math.floor(Math.random() * 10) + 1
    setScratchAmount(prize)
    setScratchOpen(true)
  }

  const handleCancel = () => {
    // reset form by bumping key
    setResetKey((k) => k + 1)
  }

  const handleClaim = (amount: number) => {
    addReward(amount)
    toast({
      title: "Reward claimed",
      description: `You claimed ${amount} BAZ coins.`,
    })
  }

  return (
    <div className="w-full">
      {/* Inline glass container under banner */}
      <div className="mx-auto max-w-2xl">
        <LiquidTransfer
          key={resetKey}
          defaultToken="U2U"
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          className="w-full"
        />
      </div>

      <ScratchCardPlay
        open={scratchOpen}
        hiddenAmount={scratchAmount}
        onClose={() => setScratchOpen(false)}
        onClaim={handleClaim}
      />
    </div>
  )
}
