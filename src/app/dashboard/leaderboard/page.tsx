type LeaderEntry = {
  address: string
  baz: number
}

const entries: LeaderEntry[] = [
  // ensure highest is 500
  // { address: "0xhuWihhwiuhwhihmwefs", baz: 500 },
  { address: "0x3F91a7bE2cC19d8f14E0", baz: 445 },
  { address: "0xA1b2C3d4E5f6a7B8c9D0", baz: 430 },
  { address: "0x77Ee99bb22AA1188cc33", baz: 410 },
  { address: "0x1a2b3c4d5e6f7a8b9c0d", baz: 395 },
  { address: "0x9f8e7d6c5b4a3f2e1d0c", baz: 372 },
  { address: "0xABCDEF0123456789abcd", baz: 360 },
  { address: "You", baz: 10 },
  // { address: "0x0f1e2d3c4b5a69788776", baz: 330 },
  // { address: "0xDEADbeef0000Cafe1234", baz: 318 },
  // { address: "0x1234567890abcdef1234", baz: 305 },
  // { address: "0x9876abcd5432ef109876", baz: 290 },
]

// sort by tokens desc just in case
const sorted = [...entries].sort((a, b) => b.baz - a.baz)

export default function LeaderboardPage() {
  return (
    <div className="w-full">
      <header className="w-full py-4">
        <h1 className="text-center text-2xl md:text-3xl font-semibold tracking-tight">Leader Board</h1>
      </header>

      <div className="mt-4 flex flex-col gap-4">
        {sorted.map((item, idx) => (
          <div
            key={item.address + idx}
            className="w-full backdrop-blur-xl bg-white/5 hover:bg-white/10 transition-colors rounded-xl border border-white/10 p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-4 min-w-0">
              {/* sl. no. */}
              <div
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/10 border border-white/10 text-sm font-semibold"
                aria-label={`Rank ${idx + 1}`}
                title={`Rank ${idx + 1}`}
              >
                {idx + 1}
              </div>
              {/* address */}
              <div className="min-w-0">
                <p className="text-sm md:text-base font-medium truncate">{item.address}</p>
                <p className="text-xs text-white/60">Address</p>
              </div>
            </div>
            {/* tokens */}
            <div className="text-right">
              <p className="text-sm md:text-base font-semibold">{item.baz} Baz</p>
              <p className="text-xs text-white/60">Tokens</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
