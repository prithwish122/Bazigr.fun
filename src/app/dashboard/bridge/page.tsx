"use client"
import Image from "next/image"
import dynamic from "next/dynamic"

const BridgeBox = dynamic(() => import("@/app/components/bridge/bridge-box").then((m) => m.BridgeBox), { ssr: false })

export default function BridgePage() {
  return (
    <div className="w-full">
      <Image
        src="/images/bridge-banner.png"
        alt="Bridge"
        width={1400}
        height={200}
        className="w-full h-auto"
        priority
      />
      <div className="px-4 py-6">
        <BridgeBox />
      </div>
    </div>
  )
}
