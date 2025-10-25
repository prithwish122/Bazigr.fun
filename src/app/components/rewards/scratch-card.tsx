"use client"

import * as React from "react"
import { cn } from "@/app/lib/utils"

type ScratchCardProps = {
  rewardText: string
  width?: number
  height?: number
  onRevealComplete?: () => void
}

export function ScratchCard({ rewardText, width = 320, height = 180, onRevealComplete }: ScratchCardProps) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null)
  const ctxRef = React.useRef<CanvasRenderingContext2D | null>(null)
  const drawingRef = React.useRef(false)
  const lastPointRef = React.useRef<{ x: number; y: number } | null>(null)
  const [revealed, setRevealed] = React.useState(false)

  // Config: larger, smoother brush and lower reveal threshold to make scratching easier
  const BRUSH_PX = 30 // increased from 18 for easier scratching
  const REVEAL_THRESHOLD = 0.5 // slightly easier than 0.6

  // Setup overlay (fully opaque so reward isn't visible before scratching)
  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1))
    canvas.width = Math.floor(width * dpr)
    canvas.height = Math.floor(height * dpr)
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`

    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctxRef.current = ctx
    ctx.setTransform(1, 0, 0, 1, 0, 0) // reset any previous transform
    ctx.scale(dpr, dpr)

    // Fully opaque metallic overlay so content underneath isn't visible pre-scratch
    const grd = ctx.createLinearGradient(0, 0, width, height)
    grd.addColorStop(0, "rgba(180,180,185,1)") // opacities set to 1
    grd.addColorStop(1, "rgba(120,120,125,1)")
    ctx.fillStyle = grd
    ctx.fillRect(0, 0, width, height)

    // Subtle noise on top for realism
    ctx.save()
    ctx.globalAlpha = 0.12
    for (let i = 0; i < 400; i++) {
      const x = Math.random() * width
      const y = Math.random() * height
      const r = Math.random() * 2
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fillStyle = "black"
      ctx.fill()
    }
    ctx.restore()
  }, [width, height])

  function scratchStrokeTo(x: number, y: number) {
    const ctx = ctxRef.current
    if (!ctx) return
    ctx.save()
    ctx.globalCompositeOperation = "destination-out"
    ctx.lineJoin = "round"
    ctx.lineCap = "round"
    ctx.lineWidth = BRUSH_PX
    const last = lastPointRef.current
    if (last) {
      ctx.beginPath()
      ctx.moveTo(last.x, last.y)
      ctx.lineTo(x, y)
      ctx.stroke()
    }
    // Ensure no gaps if the mouse moves fast
    ctx.beginPath()
    ctx.arc(x, y, BRUSH_PX / 2, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
    lastPointRef.current = { x, y }
  }

  function scratchAt(clientX: number, clientY: number) {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const x = clientX - rect.left
    const y = clientY - rect.top
    scratchStrokeTo(x, y)
  }

  function computeReveal() {
    const canvas = canvasRef.current
    const ctx = ctxRef.current
    if (!canvas || !ctx) return 0
    const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1))
    const img = ctx.getImageData(0, 0, Math.floor(width * dpr), Math.floor(height * dpr))
    let cleared = 0
    // Count pixels with alpha = 0
    for (let i = 3; i < img.data.length; i += 4) {
      if (img.data[i] === 0) cleared++
    }
    const total = Math.floor(width * dpr) * Math.floor(height * dpr)
    return cleared / total
  }

  function endStroke() {
    drawingRef.current = false
    lastPointRef.current = null
    const pct = computeReveal()
    if (!revealed && pct >= REVEAL_THRESHOLD) {
      setRevealed(true)
      onRevealComplete?.()
    }
  }

  // Pointer events (unified mouse/touch)
  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.setPointerCapture?.(e.pointerId)
    drawingRef.current = true
    scratchAt(e.clientX, e.clientY)
  }
  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return
    scratchAt(e.clientX, e.clientY)
  }
  const onPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (canvas && canvas.hasPointerCapture?.(e.pointerId)) {
      canvas.releasePointerCapture?.(e.pointerId)
    }
    endStroke()
  }
  const onPointerLeave = () => endStroke()

  return (
    <div
      className={cn(
        "relative rounded-xl border border-border/60 bg-card/20 backdrop-blur-md p-4",
        "shadow-lg select-none",
      )}
      style={{ width, height }}
    >
      {/* Reward content (hidden by fully opaque overlay until scratched or fully revealed) */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className={cn(
            "text-4xl font-bold tracking-wide transition-all duration-300",
            revealed ? "text-foreground" : "text-foreground",
          )}
        >
          <span
            className={cn(
              revealed ? "bg-amber-300/30 text-amber-200 ring-2 ring-amber-300/60" : "bg-transparent",
              "px-3 py-1 rounded-lg shadow-[0_0_24px_rgba(255,193,7,0.35)]",
            )}
          >
            {rewardText}
          </span>
        </div>
      </div>

      {/* Scratch overlay */}
      {!revealed && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 rounded-xl cursor-crosshair" // clearer crosshair cursor
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerLeave}
        />
      )}

      {/* Hint */}
      {!revealed && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-pink-600/80 px-3 py-1 text-xs text-white">
          Scratch here
        </div>
      )}
    </div>
  )
}

export default ScratchCard
