"use client"

import Image from "next/image"
import { useState } from "react"
import { Card, CardContent } from "@/app/components/ui/card"
import { Dialog, DialogContent, DialogTitle } from "@/app/components/ui/dialog"
import { ExternalLink } from "lucide-react"

type PoolCard = {
  key: string
  name: string
  description: string
  icon: string
  url: string
  gradient: string
  iconGradient: string
}

const pools: PoolCard[] = [
  {
    key: "owlto",
    name: "Owlto Finance",
    description: "Cross-chain bridge and liquidity protocol",
    icon: "O",
    url: "https://owlto.finance/",
    gradient: "from-cyan-500/20 via-purple-500/20 to-pink-500/20",
    iconGradient: "from-cyan-400/30 to-purple-500/30"
  },
  {
    key: "staking",
    name: "U2U Staking",
    description: "Stake U2U tokens and earn rewards",
    icon: "U",
    url: "https://staking.u2u.xyz/",
    gradient: "from-blue-500/20 via-indigo-500/20 to-purple-500/20",
    iconGradient: "from-blue-400/30 to-indigo-500/30"
  }
]

export default function PoolsPage() {
  const [openModal, setOpenModal] = useState<string | null>(null)
  const [iframeError, setIframeError] = useState<string | null>(null)

  const handleCardClick = (pool: PoolCard) => {
    setOpenModal(pool.key)
  }

  const handleIframeError = () => {
    setIframeError("This site cannot be embedded. Please visit the site directly.")
  }

  return (
    <main className="w-full h-full p-4 md:p-6">
      {/* Banner */}
      <div className="w-full mb-4 md:mb-6">
        <Image src="/images/pools-banner.png" alt="Pools" width={1400} height={200} className="w-full h-auto rounded-xl" priority />
      </div>

      {/* Heading centered */}
      <div className="w-full flex items-center justify-center mb-4 md:mb-6">
        <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-white/90">Pools</h1>
      </div>

      {/* Cards grid - glass containers */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6" aria-label="Pools list">
        {pools.map((pool) => (
          <Card
            key={pool.key}
            className="group relative overflow-hidden rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/20 cursor-pointer"
            onClick={() => handleCardClick(pool)}
          >
            {/* Liquid wave effect background */}
            <div className="absolute inset-0 opacity-30">
              <div className={`absolute inset-0 bg-gradient-to-r ${pool.gradient} animate-pulse`} />
            </div>

            {/* Content */}
            <CardContent className="p-6 flex flex-col gap-4 relative z-10">
              <div className="flex items-center gap-4">
                {/* Icon with glass effect */}
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${pool.iconGradient} backdrop-blur-sm border border-white/30 flex items-center justify-center shadow-lg`}>
                  <div className="text-2xl font-bold bg-gradient-to-r from-white/90 to-white/70 bg-clip-text text-transparent">
                    {pool.icon}
                  </div>
                </div>

                {/* Text content */}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-1 group-hover:text-cyan-300 transition-colors">
                    {pool.name}
                  </h3>
                  <p className="text-white/60 text-sm">{pool.description}</p>
                </div>
              </div>

              {/* Trade button */}
              <button
                className="w-full px-4 py-3 rounded-lg text-sm font-medium text-white border border-white/10 bg-gradient-to-r from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-green-500/20"
                onClick={(e) => {
                  e.stopPropagation()
                  handleCardClick(pool)
                }}
              >
                TRADE NOW!
              </button>

              {/* Decorative liquid wave effect */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Modals */}
      {pools.map((pool) => (
        <Dialog key={pool.key} open={openModal === pool.key} onOpenChange={() => setOpenModal(null)}>
          <DialogContent className="max-w-6xl h-[80vh] p-0 bg-black/90 backdrop-blur-xl border-white/20">
            <DialogTitle className="sr-only">{pool.name}</DialogTitle>
            {iframeError ? (
              <div className="flex flex-col items-center justify-center h-full text-white">
                <div className="text-6xl mb-4">🚫</div>
                <h3 className="text-xl font-bold mb-2">Connection Refused</h3>
                <p className="text-white/60 mb-4">{iframeError}</p>
                <button
                  onClick={() => window.open(pool.url, "_blank", "noopener,noreferrer")}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg hover:from-cyan-600 hover:to-purple-600 transition-all duration-200"
                >
                  <ExternalLink className="w-4 h-4 inline mr-2" />
                  Open in New Tab
                </button>
              </div>
            ) : (
              <iframe
                src={pool.url}
                className="w-full h-full rounded-lg"
                title={pool.name}
                allow="clipboard-read; clipboard-write"
                onError={handleIframeError}
              />
            )}
          </DialogContent>
        </Dialog>
      ))}
    </main>
  )
}
