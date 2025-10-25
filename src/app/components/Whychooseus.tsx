"use client"

export default function WhyChooseUs() {
  return (
    <section className="py-20 px-4 ">
     <h2 className="text-6xl text-white mt-[50px] mb-[80px] tracking-tight text-center ">
            Why Choose Us?
          </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 max-w-7xl mx-auto w-full">
        <div className="col-span-1 lg:col-span-2 h-full min-h-[500px] lg:min-h-[300px] rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 p-8 flex flex-col justify-end">
          <div className="max-w-xs">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
            <h3 className="text-left text-balance text-xl md:text-2xl lg:text-3xl font-semibold tracking-tight text-white mb-3">
              Swap, Bridge & Lend
            </h3>
            <p className="text-left text-sm md:text-base text-gray-400">
              Access all DeFi essentials in one place — move, earn, and grow effortlessly.
            </p>
          </div>
        </div>

        <div className="col-span-1 min-h-[300px] rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 p-8 flex flex-col justify-end">
          <div className="max-w-xs">
            <h3 className="text-left text-balance text-xl md:text-2xl lg:text-3xl font-semibold tracking-tight text-white mb-3">
              Earn Cashbacks & Rewards
            </h3>
            <p className="text-left text-sm md:text-base text-gray-400">
              Every transaction gives you back — get instant cashback and exclusive bonuses.
            </p>
          </div>
        </div>

        <div className="col-span-1 min-h-[300px] rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 p-8 flex flex-col justify-end">
          <div className="max-w-xs">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </div>
            </div>
            <h3 className="text-left text-balance text-xl md:text-2xl lg:text-3xl font-semibold tracking-tight text-white mb-3">
              Daily Tasks
            </h3>
            <p className="text-left text-sm md:text-base text-gray-400">
              Complete simple missions to boost XP, unlock badges, and earn extravian extra rewards.
            </p>
          </div>
        </div>

        <div className="col-span-1 min-h-[300px] rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 p-8 flex flex-col justify-end">
          <div className="max-w-xs">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
            <h3 className="text-left text-balance text-xl md:text-2xl lg:text-3xl font-semibold tracking-tight text-white mb-3">
              Defi Agent
            </h3>
            <p className="text-left text-sm md:text-base text-gray-400">
              Your smart companion that guides, automates, and simplifies every on-chain move.
            </p>
          </div>
        </div>

        <div className="col-span-1 min-h-[300px] rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 p-8 flex flex-col justify-end">
          <div className="max-w-xs">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
                </svg>
              </div>
            </div>
            <h3 className="text-left text-balance text-xl md:text-2xl lg:text-3xl font-semibold tracking-tight text-white mb-3">
              Mini Games After Every Move
            </h3>
            <p className="text-left text-sm md:text-base text-gray-400">
              Turn each DeFi action into fun and surprises.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
