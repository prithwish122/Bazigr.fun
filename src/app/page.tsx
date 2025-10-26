"use client"
import Link from "next/link"
import { motion } from "framer-motion"
import ExpandableCards from "./components/Expandablecards"
import FAQ from "./components/faq"
import HowItWorks from "./components/Howitworks"
import { Navbar } from "./components/navbar"
import WhyChooseUs from "./components/Whychooseus"
import Companies from "./components/companies"

export default function Page() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <section className="relative mx-auto flex min-h-[70vh] w-[min(92vw,980px)] flex-col items-center justify-center text-center mb-0">
        <h1 className="text-balance font-extrabold leading-[0.95] tracking-tight uppercase">
          <span className="block text-5xl sm:text-7xl md:text-8xl lg:text-9xl">Your Defi</span>
          <span className="mt-1 block text-5xl sm:text-7xl md:text-8xl lg:text-9xl">Reimagined</span>
        </h1>
        <p className="mt-5 text-pretty italic opacity-95 text-lg sm:text-xl md:text-2xl">Every move gets rewarded</p>
        
        <Link href="/dashboard/transfer" className="mt-8">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-8 py-3 bg-white/10 backdrop-blur-xl border border-white/20 text-white rounded-full font-medium text-sm transition-all duration-300 hover:bg-white/15 hover:border-white/30"
          >
            Get Started
          </motion.button>
        </Link>
      </section>
      {/* <Companies /> */}
      <ExpandableCards />
      <WhyChooseUs/>
      <HowItWorks />
      <FAQ />
    </main>
  )
}