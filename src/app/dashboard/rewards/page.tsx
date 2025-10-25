import Image from "next/image"

export default function RewardsPage() {
  return (
    <div className="w-full">
      <Image
        src="/images/rewards-banner.jpg"
        alt="Rewards"
        width={1400}
        height={200}
        className="w-full h-auto"
        priority
      />
    </div>
  )
}
