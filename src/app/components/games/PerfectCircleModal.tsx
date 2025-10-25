"use client"

import type React from "react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { X, Trophy } from "lucide-react"
import { cn } from "@/app/lib/utils"
import { useAppKitAccount } from "@reown/appkit/react"
import { usePublicClient, useWriteContract } from "wagmi"
import tokenAbi from "@/app/contract/abi.json"

type Props = {
  open: boolean
  onClose: () => void
}

type Pt = { x: number; y: number }

export default function PerfectCircleModal({ open, onClose }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [drawing, setDrawing] = useState(false)
  const [points, setPoints] = useState<Pt[]>([])
  const [score, setScore] = useState<number | null>(null)
  const [claimed, setClaimed] = useState(false)
  const [paid, setPaid] = useState(false)
  const [hasDrawn, setHasDrawn] = useState(false)
  const [showRules, setShowRules] = useState(false)

  const { address, isConnected } = useAppKitAccount()
  const { writeContractAsync } = useWriteContract()
  const publicClient = usePublicClient()

  const TOKEN_ADDRESS = "0xC345f186C6337b8df46B19c8ED026e9d64ab9F80" as `0x${string}`
  const TREASURY = "0x10B6E5bB22D387AF4E9E2961a6183291337F76fc" as `0x${string}`

  // Resize canvas for DPR
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current
    const wrap = containerRef.current
    if (!canvas || !wrap) return
    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1))
    const rect = wrap.getBoundingClientRect()
    canvas.width = Math.floor(rect.width * dpr)
    canvas.height = Math.floor(rect.height * dpr)
    const ctx = canvas.getContext("2d")
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    draw() // redraw after resize
  }, [])

  useEffect(() => {
    if (!open) return
    resizeCanvas()
    const onResize = () => resizeCanvas()
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [open, resizeCanvas])

  const reset = () => {
    setPoints([])
    setScore(null)
    setClaimed(false)
    draw(true)
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!open) return
    if (!paid || hasDrawn) return
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect()
    setDrawing(true)
    setScore(null)
    setPoints([{ x: e.clientX - rect.left, y: e.clientY - rect.top }])
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!drawing) return
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect()
    setPoints((prev) => {
      const next = prev.concat({ x: e.clientX - rect.left, y: e.clientY - rect.top })
      drawPath(next)
      return next
    })
  }

  const handlePointerUp = () => {
    setDrawing(false)
    if (points.length > 8) {
      const s = computeScore(points)
      setScore(s)
    }
    setHasDrawn(true)
  }

  const draw = (clearOnly = false) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    // clear
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    // background
    const w = canvas.width / (ctx.getTransform().a || 1)
    const h = canvas.height / (ctx.getTransform().d || 1)
    const grd = ctx.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, Math.max(w, h))
    grd.addColorStop(0, "rgba(0,0,0,1)")
    grd.addColorStop(1, "rgba(0,0,0,1)")
    ctx.fillStyle = grd
    ctx.fillRect(0, 0, w, h)

    if (clearOnly) return

    if (points.length > 1) drawPath(points)
    if (score !== null) drawCenterScore(score)
  }

  const drawPath = (pts: Pt[]) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    // redraw base
    draw(true)
    // colorized path
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
    ctx.lineWidth = 5
    for (let i = 1; i < pts.length; i++) {
      const t = i / (pts.length - 1)
      const hue = 35 + 20 * t
      ctx.strokeStyle = `hsl(${hue}, 100%, 55%)`
      ctx.shadowColor = `hsla(${hue}, 100%, 55%, 0.5)`
      ctx.shadowBlur = 12
      ctx.beginPath()
      ctx.moveTo(pts[i - 1].x, pts[i - 1].y)
      ctx.lineTo(pts[i].x, pts[i].y)
      ctx.stroke()
    }
  }

  const drawCenterScore = (s: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const w = canvas.width / (ctx.getTransform().a || 1)
    const h = canvas.height / (ctx.getTransform().d || 1)

    const text = `${s.toFixed(1)}%`
    ctx.save()
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.font = "700 64px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono'"
    ctx.fillStyle = "rgba(255,100,0,0.25)"
    ctx.fillText(text, w / 2, h / 2)
    ctx.fillStyle = "rgb(255,160,80)"
    ctx.fillText(text, w / 2, h / 2)
    ctx.restore()
  }

  // Circle scoring
  const computeScore = (pts: Pt[]) => {
    const cx = pts.reduce((s, p) => s + p.x, 0) / pts.length
    const cy = pts.reduce((s, p) => s + p.y, 0) / pts.length
    const radii = pts.map((p) => Math.hypot(p.x - cx, p.y - cy))
    const rMean = radii.reduce((s, r) => s + r, 0) / radii.length
    const varR = radii.reduce((s, r) => s + (r - rMean) * (r - rMean), 0) / radii.length
    const sd = Math.sqrt(varR)
    const uniformity = Math.max(0, 1 - sd / (rMean || 1))
    const angles = pts.map((p) => Math.atan2(p.y - cy, p.x - cx))
    angles.sort((a, b) => a - b)
    const TWO_PI = Math.PI * 2
    let maxGap = 0
    for (let i = 1; i < angles.length; i++) maxGap = Math.max(maxGap, angles[i] - angles[i - 1])
    maxGap = Math.max(maxGap, angles[0] + TWO_PI - angles[angles.length - 1])
    const coverage = Math.max(0, 1 - maxGap / TWO_PI)
    const start = pts[0]
    const end = pts[pts.length - 1]
    const closeDist = Math.hypot(end.x - start.x, end.y - start.y)
    const closure = Math.max(0, 1 - closeDist / (rMean || 1))
    const combined = uniformity * 0.6 + coverage * 0.25 + closure * 0.15
    return Math.max(0, Math.min(100, combined * 100))
  }

  const prize = useMemo(() => {
    if (score === null) return { baz: 0, label: "Draw to score" }
    if (score >= 90) return { baz: 20, label: "Perfect! 20 BAZ" }
    if (score >= 85) return { baz: 15, label: "Excellent! 15 BAZ" }
    return { baz: 0, label: "Not eligible" }
  }, [score])

  async function handlePay() {
    if (!isConnected || !address) return
    try {
      const hash = await writeContractAsync({
        abi: tokenAbi as any,
        functionName: "send",
        address: TOKEN_ADDRESS,
        args: [TREASURY, "10"],
      })
      await publicClient?.waitForTransactionReceipt({ hash })
      setPaid(true)
      setHasDrawn(false)
      setClaimed(false)
      setScore(null)
      setShowRules(true)
    } catch {}
  }

  async function handleClaim() {
    if (!isConnected || !address) return
    if (claimed) return
    const amount = score !== null && score >= 90 ? "20" : score !== null && score >= 85 ? "15" : "0"
    if (amount === "0") return
    try {
      const hash = await writeContractAsync({
        abi: tokenAbi as any,
        functionName: "mint",
        address: TOKEN_ADDRESS,
        args: [address as `0x${string}`, amount],
      })
      await publicClient?.waitForTransactionReceipt({ hash })
      setClaimed(true)
      // Close modal after claim to avoid double claim
      setTimeout(() => onClose(), 400)
    } catch {}
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        className={cn(
          "relative w-[95vw] max-w-5xl h-[85vh] rounded-2xl overflow-hidden",
          "border border-white/10 backdrop-blur-xl bg-black/30",
        )}
      >
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-3 border-b border-white/10">
          <div className="flex items-center gap-2 text-white/80">
            <Trophy className="h-4 w-4 text-yellow-400/80" />
            <span className="text-sm">Draw Perfect Circle</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-2 py-1.5 rounded-md text-white/80 hover:text-white border border-white/10 bg-white/10 hover:bg-white/15"
              aria-label="Close"
              title="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div ref={containerRef} className="absolute inset-0 pt-12 pb-16 px-4">
          <canvas
            ref={canvasRef}
            className="w-full h-full rounded-lg ring-1 ring-white/10 bg-black"
            style={{ cursor: hasDrawn ? "crosshair" : "auto", pointerEvents: hasDrawn ? "none" : "auto" }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={() => drawing && handlePointerUp()}
          />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            {paid ? (
              score !== null ? (
                <div className="text-center">
                  <div className="text-5xl font-mono font-bold text-orange-300 drop-shadow-[0_0_10px_rgba(255,150,50,0.35)]">
                    {score.toFixed(1)}%
                  </div>
                  <div className="mt-1 text-sm text-white/90">
                    {score >= 90 ? "Congrats! Eligible for 20 BAZ" : score >= 85 ? "Congrats! Eligible for 15 BAZ" : "Better luck next time"}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-white/70">Draw a single circle in one stroke</div>
              )
            ) : null}
          </div>

          {!paid && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/70">
              <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/10 backdrop-blur-xl p-5 text-white">
                <div className="text-center">
                  <div className="text-base font-medium">Complete your transaction</div>
                  <div className="mt-1 text-sm text-white/80">10 BAZ</div>
                  <button
                    onClick={handlePay}
                    className="mt-4 inline-flex items-center justify-center px-4 py-2 rounded-lg border border-white/10 bg-white/10 hover:bg-white/15 transition-colors text-sm"
                  >
                    Pay & Start (10 BAZ)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Rules Popup */}
          {showRules && (
            <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/80">
              <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/10 backdrop-blur-xl p-6 text-white">
                <div className="text-center">
                  <div className="text-lg font-bold mb-4">Game Rules</div>
                  <div className="space-y-3 text-sm text-white/90">
                    <div className="flex items-center justify-between">
                      <span>90% and above:</span>
                      <span className="font-bold text-green-400">20 BAZ tokens</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>85% and above:</span>
                      <span className="font-bold text-yellow-400">15 BAZ tokens</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Below 85%:</span>
                      <span className="font-bold text-red-400">No reward</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowRules(false)}
                    className="mt-6 inline-flex items-center justify-center px-6 py-2 rounded-lg border border-white/10 bg-white/10 hover:bg-white/15 transition-colors text-sm"
                  >
                    Start Drawing
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-10 px-4 py-3 border-t border-white/10">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="px-3 py-2 rounded-lg border border-white/10 bg-white/10 text-white/90 text-sm">
                {!paid ? "Complete your transaction to play" : score === null ? "Draw to score" : score >= 90 ? "Perfect! 20 BAZ" : score >= 85 ? "Excellent! 15 BAZ" : "Not eligible"}
              </div>
              {paid && score !== null && (
                <div className="text-xs text-white/60 truncate">≥90% earn 20 BAZ, ≥85% earn 15 BAZ</div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={!paid || score === null || !hasDrawn || claimed || score < 85}
                onClick={handleClaim}
                className={cn(
                  "px-4 py-2 rounded-lg border text-sm transition-colors",
                  paid && score !== null && score >= 85 && !claimed ? "text-white border-white/10 bg-white/10 hover:bg-white/15" : "text-white/50 border-white/10 bg-white/5 cursor-not-allowed",
                )}
              >
                {claimed ? "Claimed" : score !== null && score >= 90 ? "Claim 20 BAZ" : score !== null && score >= 85 ? "Claim 15 BAZ" : "Not eligible"}
              </button>
            </div>
          </div>
          {claimed && (
            <div className="mt-2 px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white/80 text-sm">Congrats! Your reward has been recorded.</div>
          )}
        </div>
      </div>
    </div>
  )
}


