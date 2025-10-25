"use client"
import Image from "next/image"
import { ConnectWalletModal } from "@/app/components/dashboard/connect-wallet-modal"
import dynamic from "next/dynamic"

const TransferBox = dynamic(() => import("@/app/components/transfer/transfer-box").then((m) => m.TransferBox), {
  ssr: false,
})

export default function TransferPage() {
  return (
    <>
      <ConnectWalletModal />
      <div className="w-full">
        <Image
          src="/images/transfer-banner.png"
          alt="Transfer"
          width={1400}
          height={200}
          className="w-full h-auto"
          priority
        />
      </div>
      <div className="px-4 py-6">
        <TransferBox />
      </div>
    </>
  )
}
