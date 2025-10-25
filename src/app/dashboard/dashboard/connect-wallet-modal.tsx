"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { X, Wallet } from "lucide-react"

export function ConnectWalletModal() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Show modal on page load
    setIsOpen(true)
  }, [])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative bg-black/30 backdrop-blur-xl border border-white/20 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="flex flex-col items-center space-y-6 text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#C71585] to-[#FF69B4] flex items-center justify-center">
            <Wallet className="w-8 h-8 text-white" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">Connect Wallet</h2>
            <p className="text-white/60 text-sm">
              Connect your wallet to access all features and start earning rewards
            </p>
          </div>

          <Button
            size="lg"
            className="w-full bg-gradient-to-r from-[#C71585] to-[#B31373] hover:from-[#B31373] hover:to-[#C71585] text-white font-semibold rounded-lg py-6"
          >
            <Wallet className="w-5 h-5 mr-2" />
            Connect Wallet
          </Button>

          <button
            onClick={() => setIsOpen(false)}
            className="text-sm text-white/40 hover:text-white/60 transition-colors"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  )
}
