"use client"

import { motion } from "framer-motion"

export default function HowItWorks() {
  const phases = [
    {
      id: "01",
      title: "Connect & Play",
      subtitle: "Wallet Connection & Activity Launch",
      description:
        "Connect your wallet securely and dive into DeFi actions — swap, bridge, lend, or stake. Every transaction counts toward your progress and earns instant rewards.",
      extra: "Track your moves, gain XP, and build your on-chain profile.",
      details: [
        "Secure wallet connection",
        "Perform DeFi actions: swap, bridge, lend, stake",
        "Earn cashback and XP instantly",
      ],
    }, 
    {
      id: "02",
      title: "Earn & Rise",
      subtitle: "Rewards, Games & Leaderboard",
      description:
        "Turn every on-chain move into fun — play mini-games after transactions, complete daily quests, and climb the leaderboard.",
      extra: "Redeem your Celo Sepolia Testnet tokens for real prizes or reinvest them to boost your DeFi journey.",
      details: [
        "Mini-games after every transaction",
        "Daily quests and monthly leaderboard",
        "Redeem Celo Sepolia Testnet tokens for real rewards",
      ],
    },
  ]

  return (
    <div className="w-full py-16 px-4 flex items-center justify-center">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-[100px] mt-[60px]"
        >
          <h1 className="text-6xl  text-white mb-4 tracking-tight">How it works ?</h1>
          
        </motion.div>

        {/* Process Flow: 2 containers, glass only (no colored gradients) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
          {/* Neutral connection line for large screens */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-px -translate-y-1/2 z-0">
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.2, delay: 0.4 }}
              className="h-full bg-white/10"
            />
          </div>

          {phases.map((phase, index) => (
            <motion.div
              key={phase.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="group relative z-10"
            >
              {/* Glass Container only */}
              <div className="relative h-full rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-500 hover:-translate-y-2 overflow-hidden">
                {/* Content */}
                <div className="relative z-10 p-8 md:p-10 h-full flex flex-col">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-gray-400 text-sm font-mono tracking-wider">PHASE {phase.id}</span>
                    <div className="px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs text-gray-300">
                      {phase.subtitle}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl font-bold text-white mb-3">{phase.title}</h3>

                  {/* Description */}
                  <p className="text-gray-300 text-base leading-relaxed mb-4">{phase.description}</p>
                  {phase.extra && <p className="text-gray-400 text-sm leading-relaxed mb-6">{phase.extra}</p>}

                  {/* Details List */}
                  <div className="flex-1">
                    <ul className="space-y-3">
                      {phase.details.map((detail, detailIndex) => (
                        <motion.li
                          key={detailIndex}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            delay: index * 0.2 + detailIndex * 0.08 + 0.6,
                          }}
                          className="flex items-start gap-3 text-sm text-gray-300"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-white/50 mt-2 flex-shrink-0" />
                          <span className="leading-relaxed">{detail}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Subtle neutral glow on hover */}
                <div className="absolute inset-0 rounded-2xl bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>

              {/* Mobile Flow Indicator */}
              {index < phases.length - 1 && (
                <div className="md:hidden flex justify-center my-6">
                  <motion.div
                    initial={{ opacity: 0, scaleY: 0 }}
                    animate={{ opacity: 1, scaleY: 1 }}
                    transition={{ delay: index * 0.2 + 0.8 }}
                    className="w-px h-8 bg-white/10"
                  />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Optional CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="text-center mt-16"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-8 py-3 bg-white/10 backdrop-blur-xl border border-white/20 text-white rounded-full font-medium text-sm transition-all duration-300 hover:bg-white/15 hover:border-white/30"
          >
            Get Started
          </motion.button>
          <p className="text-gray-500 text-xs mt-3">Connect your wallet and start earning instantly</p>
        </motion.div>
      </div>
    </div>
  )
}
