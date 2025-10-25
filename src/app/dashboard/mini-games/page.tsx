"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import PerfectCircleModal from "@/app/components/games/PerfectCircleModal"

type Game = {
  key: string
  name: string
  poster: string
  tokens: number
  href?: string
  comingSoon?: boolean
}

const games: Game[] = [
  {
    key: "circle",
    name: "Draw Perfect Circle",
    poster: "/images/circle.png",
    tokens: 10,
    href: "#", // hook up later if needed
  },
  {
    key: "runner",
    name: "Endless Runner",
    poster: "/endless-runner-chrome-dino-poster.jpg",
    tokens: 5,
    href: "#", // hook up later if needed
  },
  {
    key: "coming-soon",
    name: "Mystery Game",
    poster: "/coming-soon-game-poster.jpg",
    tokens: 5,
    comingSoon: true,
  },
]

export default function MiniGamesPage() {
  const [circleOpen, setCircleOpen] = useState(false)
  return (
    <main className="w-full h-full p-4 md:p-6">
      {/* Heading centered top */}
      <div className="w-full flex items-center justify-center mb-4 md:mb-6">
        <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-white/90">Mini Games</h1>
      </div>

      {/* Cards grid - glass containers */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6" aria-label="Mini games list">
        {games.map((game) => {
          const CardWrapper = game.href ? Link : "div"
          const wrapperProps = game.href ? { href: game.href } : {}

          return (
            <CardWrapper
              key={game.key}
              {...(wrapperProps as any)}
              className={[
                "group relative overflow-hidden rounded-xl",
                "backdrop-blur-xl bg-white/5 border border-white/10",
                "transition-all duration-200",
                game.href ? "hover:bg-white/10" : "",
                "flex flex-col",
              ].join(" ")}
            >
              {/* Poster - edge-to-edge (bezel-less) at the top */}
              <div className="relative w-full h-64 md:h-80 lg:h-96">
                <Image
                  src={game.poster || "/placeholder.svg"}
                  alt={`${game.name} poster`}
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                />
              </div>

              {/* Content */}
              <div className="p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-base md:text-lg font-medium text-white/90 text-pretty">{game.name}</h3>
                  <span
                    className="px-2 py-1 rounded-md text-xs font-medium"
                    style={{ background: "rgba(255,255,255,0.08)" }}
                  >
                    {game.tokens} BAZ
                  </span>
                </div>

                {/* Actions */}
                <div className="mt-1">
                  {game.comingSoon ? (
                    <button
                      aria-disabled
                      className="w-full px-3 py-2 rounded-lg text-sm text-white/60 border border-white/10 bg-white/5 cursor-not-allowed"
                    >
                      Coming Soon
                    </button>
                  ) : (
                    <button
                      className="w-full px-3 py-2 rounded-lg text-sm text-white border border-white/10 bg-white/10 hover:bg-white/15 transition-colors"
                      onClick={(e) => {
                        // prevent navigation if using Link wrapper with href="#"
                        if (!game.href || game.href === "#") e.preventDefault()
                        if (game.key === "circle") {
                          setCircleOpen(true)
                        }
                      }}
                    >
                      Play Now
                    </button>
                  )}
                </div>
              </div>
            </CardWrapper>
          )
        })}
      </section>
      <PerfectCircleModal open={circleOpen} onClose={() => setCircleOpen(false)} />
    </main>
  )
}
