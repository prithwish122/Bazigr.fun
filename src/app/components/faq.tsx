"use client"
import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import { Globe } from "./Globe"

export default function FAQ() {
  const [openItems, setOpenItems] = useState<number[]>([0])

  const faqs = [
    {
      question: "What is Bazigr?",
      answer:
        "Bazigr is a gamified DeFi platform where every on-chain action — swap, bridge, lend, or stake — earns you rewards, XP, and cashback while you climb the leaderboard.",
    },
    {
      question: "How do I start using Bazigr?",
      answer:
        "Simply connect your wallet, perform any DeFi action on Celo Sepolia Testnet, and start earning. No KYC, no signup — just play, transact, and earn.",
    },
    {
      question: "What kind of rewards can I earn?",
      answer:
        "You earn instant cashback, XP points, and Celo Sepolia Testnet tokens that can be redeemed for real prizes or used to unlock mini-games and boosts.",
    },
    {
      question: "Is Bazigr beginner-friendly?",
      answer:
        "Absolutely. Our built-in AI DeFi Agent guides you through every action — from swapping to staking — so even newcomers can earn with confidence.",
    },
    {
      question: "How does the leaderboard work?",
      answer:
        "Every transaction, quest, and game adds to your score. At the end of each month, top players win bonus Celo Sepolia Testnet tokens and exclusive in-game rewards.",
    },
  ]

  const toggleItem = (index: number) => {
    setOpenItems((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]))
  }

  return (
    <div className="w-full py-24">
      <div className="max-w-7xl mx-auto px-8">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-5xl tracking-tight text-white mb-6 font-sans"
          >
            Everything you <span className="italic text-pink-300">need</span> to know.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-blue-200/80 font-sans"
          >
            Got questions? We've got answers. Here's everything you need to know before getting started.
          </motion.p>
        </div>

        {/* Side by side layout */}
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* FAQ Section - Left Side */}
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="border border-pink-500/20 rounded-2xl overflow-hidden bg-gradient-to-r from-pink-950/20 to-transparent hover:from-pink-950/30 hover:to-transparent transition-all duration-300"
              >
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-blue-800/10 transition-colors duration-200"
                >
                  <span className="text-white font-medium text-lg pr-4 font-sans">{faq.question}</span>
                  <motion.div animate={{ rotate: openItems.includes(index) ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="w-5 h-5 text-blue-400" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {openItems.includes(index) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="px-8 pb-6 text-blue-200/90 leading-relaxed font-sans">{faq.answer}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>

          {/* Globe Section - Right Side */}
          <div className="flex items-center justify-center lg:justify-start sticky top-24">
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative"
            >
               
              <Globe className="drop-shadow-2xl" />
            
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}