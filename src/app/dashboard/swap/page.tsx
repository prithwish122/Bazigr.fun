"use client"
import Image from "next/image"
import dynamic from "next/dynamic"

// Lazy-load client component to avoid SSR hiccups for Radix Select
const SwapBox = dynamic(() => import("@/app/components/swap/swap-box").then((m) => m.SwapBox), { ssr: false })

export default function SwapPage() {
  return (
    <div className="w-full">
      <Image src="/images/swap-banner.png" alt="Swap" width={1400} height={200} className="w-full h-auto" priority />
      <div className="px-4 py-6">
        <SwapBox />
      </div>
    </div>
  )
}
