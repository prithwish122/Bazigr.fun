"use client"

import { useState } from "react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer } from "../../components/ui/chart"
import { Info } from "lucide-react"

// Mock BAZ price data
const priceData = [
  { time: "00:00", price: 0.242, volume: 1200 },
  { time: "04:00", price: 0.2445, volume: 1400 },
  { time: "08:00", price: 0.241, volume: 1100 },
  { time: "12:00", price: 0.248, volume: 1600 },
  { time: "16:00", price: 0.2455, volume: 1300 },
  { time: "20:00", price: 0.2473, volume: 1500 },
  { time: "22:00", price: 0.2465, volume: 1400 },
  { time: "23:00", price: 0.2478, volume: 1550 },
]

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="backdrop-blur-xl bg-black/80 border border-white/20 rounded-lg p-3">
        <p className="text-white/80 text-xs">{data.time}</p>
        <p className="text-white font-semibold">Price: ${data.price.toFixed(6)}</p>
      </div>
    )
  }
  return null
}

export default function PriceChartPage() {
  const [timeRange, setTimeRange] = useState("24H")

  const timeRanges = ["24H", "7D", "1M", "3M", "1Y", "Max"]
  const currentPrice = 0.2471
  const priceChange = -0.9
  const priceChangeAmount = -0.0022
  const btcPrice = "0.0₂212 BTC"
  const btcChange = -16

  const metrics = [
    { label: "Market Cap", value: "$144,459,180", icon: true },
    { label: "Fully Diluted Valuation", value: "$247,318,994", icon: true },
    { label: "24 Hour Trading Vol", value: "$9,157,931", icon: false },
    { label: "Total Value Locked (TVL)", value: "$40,704,531", icon: true },
    { label: "Circulating Supply", value: "584,100,629", icon: true },
    { label: "Total Supply", value: "1,000,000,000", icon: false },
    { label: "Max Supply", value: "1,000,000,000", icon: true },
  ]

  return (
    <div className="w-full min-h-screen p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Sidebar - Token Info & Metrics */}
        <div className="lg:col-span-1">
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-lg p-6 space-y-6">
            {/* Token Header */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-yellow-400/20 flex items-center justify-center">
                  <span className="text-yellow-400 font-bold text-lg">₿</span>
                </div>
                <div>
                  <h1 className="text-white font-bold">BAZ</h1>
                  <p className="text-white/60 text-xs">BAZ Token</p>
                </div>
              </div>

              {/* Current Price */}
              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-white">${currentPrice.toFixed(4)}</span>
                  <span className={`text-sm font-semibold ${priceChange < 0 ? "text-red-400" : "text-green-400"}`}>
                    {priceChange > 0 ? "▲" : "▼"} {Math.abs(priceChange)}% (24h)
                  </span>
                </div>
                <p className="text-white/60 text-sm">
                  {priceChangeAmount > 0 ? "+" : ""}
                  {priceChangeAmount.toFixed(4)}
                </p>
              </div>

              {/* BTC Price */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-white/60 text-xs mb-1">Bitcoin Price</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-white font-semibold">{btcPrice}</span>
                  <span className={`text-xs ${btcChange < 0 ? "text-red-400" : "text-green-400"}`}>
                    {btcChange > 0 ? "▲" : "▼"} {Math.abs(btcChange)}%
                  </span>
                </div>
              </div>

              {/* Price Range */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-yellow-400 text-sm font-semibold">$0.244</span>
                  <span className="text-white/60 text-xs">24h Range</span>
                  <span className="text-white text-sm font-semibold">$0.255</span>
                </div>
                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full w-1/3 bg-gradient-to-r from-yellow-400 to-green-400 rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Add to Portfolio Button */}
            <button className="w-full backdrop-blur-xl bg-white/10 border border-white/20 hover:bg-white/15 rounded-lg py-3 text-white font-semibold transition-all flex items-center justify-center gap-2">
              <span>★</span>
              Add to Portfolio • 68,814 added
            </button>

            {/* Metrics List */}
            <div className="space-y-4 pt-4 border-t border-white/10">
              {metrics.map((metric, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-white/60 text-sm">{metric.label}</span>
                    {metric.icon && <Info className="w-4 h-4 text-white/40" />}
                  </div>
                  <span className="text-white font-semibold text-sm">{metric.value}</span>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-white/10">
              <button className="bg-green-500 hover:bg-green-600 text-black font-bold py-2 rounded-lg transition-all text-sm">
                Buy / Sell
              </button>
              <button className="bg-green-500 hover:bg-green-600 text-black font-bold py-2 rounded-lg transition-all text-sm">
                Wallet
              </button>
              <button className="bg-green-500 hover:bg-green-600 text-black font-bold py-2 rounded-lg transition-all text-sm">
                Earn Crypto
              </button>
            </div>
          </div>
        </div>

        {/* Right Side - Price Chart */}
        <div className="lg:col-span-2">
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">Price Chart</h2>
              <div className="flex gap-2 flex-wrap">
                {timeRanges.map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                      timeRange === range
                        ? "bg-white/20 text-white"
                        : "text-white/60 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>

            <ChartContainer
              config={{
                price: {
                  label: "Price",
                  color: "hsl(0, 84%, 60%)",
                },
              }}
              className="h-96"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={priceData}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#dc2626" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="time" stroke="rgba(255,255,255,0.5)" />
                  <YAxis stroke="rgba(255,255,255,0.5)" domain={["dataMin - 0.001", "dataMax + 0.001"]} />
                  <CustomTooltip />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke="#dc2626"
                    fillOpacity={1}
                    fill="url(#colorPrice)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
