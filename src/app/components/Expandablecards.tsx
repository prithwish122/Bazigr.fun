"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"

export interface Card {
  id: number
  title: string
  image: string
  description: string
}

const defaultCards: Card[] = [
  {
    id: 1,
    title: "Swap",
    image: "/images/swap.png",
    description: "Swap and earn rewards on every transaction with the best rates in DeFi",
  },
  {
    id: 2,
    title: "Bridge",
    image: "/images/bridge.png",
    description: "Bridge assets seamlessly across multiple chains with minimal fees",
  },
  {
    id: 3,
    title: "Pools",
    image: "/images/pools.png",
    description: "Provide liquidity to pools and earn passive income from trading fees",
  },
]

const smoothEasing = [0.4, 0.0, 0.2, 1]

export interface ExpandableCardsProps {
  cards?: Card[]
  selectedCard?: number | null
  onSelect?: (id: number | null) => void
  className?: string
  cardClassName?: string
}

export default function ExpandableCards({
  cards = defaultCards,
  selectedCard: controlledSelected,
  onSelect,
  className = "",
  cardClassName = "",
}: ExpandableCardsProps) {
  const [internalSelected, setInternalSelected] = useState<number | null>(1)

  const selectedCard = controlledSelected !== undefined ? controlledSelected : internalSelected

  useEffect(() => {
    if (controlledSelected === undefined && internalSelected === null) {
      setInternalSelected(1)
    }
  }, [controlledSelected, internalSelected])

  const handleCardClick = (id: number) => {
    if (selectedCard === id) {
      return // Prevent collapsing the selected card
    }
    if (onSelect) onSelect(id)
    else setInternalSelected(id)
  }

  return (
    <div className={`flex w-full flex-col items-center justify-center py-12 ${className}`}>
      <div className="flex items-center justify-center gap-4 max-w-7xl mx-auto px-4">
        {cards.map((card) => (
          <motion.div
            key={card.id}
            layout
            data-card-id={card.id}
            className={`relative flex-shrink-0 cursor-pointer overflow-hidden rounded-3xl shadow-2xl ${cardClassName}`}
            animate={{
              width: selectedCard === card.id ? "650px" : "400px",
              height: "500px",
            }}
            transition={{
              duration: 0.6,
              ease: smoothEasing,
            }}
            onClick={() => handleCardClick(card.id)}
          >
            <div className="relative h-full w-full flex">
              {/* Image section */}
              <motion.div
                className="relative h-full overflow-hidden"
                animate={{
                  width: selectedCard === card.id ? "400px" : "100%",
                }}
                transition={{
                  duration: 0.6,
                  ease: smoothEasing,
                }}
              >
                <img src={card.image || "/placeholder.svg"} alt={card.title} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                <div className="absolute bottom-8 left-8">
                  <h2 className="text-4xl font-bold text-white tracking-tight">{card.title}</h2>
                </div>
              </motion.div>

              {/* Expanded content section */}
              <AnimatePresence mode="popLayout">
                {selectedCard === card.id && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "250px" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{
                      duration: 0.6,
                      ease: smoothEasing,
                    }}
                    className="h-full bg-white/10 backdrop-blur-xl"
                  >
                    <motion.div
                      className="flex h-full flex-col justify-center px-6"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: 0.2, duration: 0.4 }}
                    >
                      <p className="text-white text-lg leading-relaxed font-medium">{card.description}</p>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
