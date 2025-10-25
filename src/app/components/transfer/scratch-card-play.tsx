"use client"

import * as React from "react"
import { cn } from "@/app/lib/utils"

type ScratchCardPlayProps = {
  open: boolean
  onClose: () => void
  hiddenAmount: number // 1-10
  onClaim: (amount: number) => void
}

export function ScratchCardPlay({ open, onClose, hiddenAmount, onClaim }: ScratchCardPlayProps) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null)
  const [ready, setReady] = React.useState(false)
  const [revealed, setRevealed] = React.useState(false)
  const [percent, setPercent] = React.useState(0)

  React.useEffect(() => {
    if (!open) return
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d", { willReadFrequently: true })
    if (!ctx) return

    // Size canvas to element box
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = Math.floor(rect.width * dpr)
    canvas.height = Math.floor(rect.height * dpr)
    ctx.scale(dpr, dpr)

    // Paint glossy pink cover
    const grd = ctx.createLinearGradient(0, 0, rect.width, rect.height)
    grd.addColorStop(0, "#ff6aa2")
    grd.addColorStop(1, "#ff3f8e")
    ctx.fillStyle = grd
    ctx.fillRect(0, 0, rect.width, rect.height)

    // Subtle shine
    const shine = ctx.createLinearGradient(0, 0, rect.width, 0)
    shine.addColorStop(0, "rgba(255,255,255,0.28)")
    shine.addColorStop(0.4, "rgba(255,255,255,0.06)")
    shine.addColorStop(1, "rgba(255,255,255,0)")
    ctx.fillStyle = shine
    ctx.fillRect(0, 0, rect.width, rect.height / 3)

    setReady(true)
  }, [open])

  React.useEffect(() => {
    if (!open) {
      setRevealed(false)
      setPercent(0)
    }
  }, [open])

  const scratchAt = (x: number, y: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d", { willReadFrequently: true })
    if (!ctx) return
    ctx.globalCompositeOperation = "destination-out"
    ctx.beginPath()
    ctx.arc(x, y, 18, 0, Math.PI * 2)
    ctx.fill()

    // compute revealed percent occasionally
    const { width, height } = canvas
    const sample = ctx.getImageData(0, 0, width, height).data
    let cleared = 0
    // Each pixel has 4 components: r,g,b,a. a=0 means cleared
    for (let i = 3; i < sample.length; i += 4) {
      if (sample[i] === 0) cleared++
    }
    const total = width * height
    const p = Math.round((cleared / total) * 100)
    setPercent(p)
    if (p > 55) setRevealed(true)
  }

  const handlePointer = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    scratchAt(x, y)
  }

  if (!open) return null

  return (
    <div
      className={cn(
        "fixed inset-0 z-50",
        "bg-white/10 backdrop-blur-md", // non-black overlay
        "flex items-center justify-center p-4",
      )}
      role="dialog"
      aria-modal="true"
      aria-label="Scratch card reward"
      onClick={(e) => {
        // click outside to close
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className={cn(
          "relative w-full max-w-sm rounded-xl border border-border/60 bg-background/50 backdrop-blur-xl",
          "shadow-[0_0_1px_1px_rgba(255,255,255,0.05)]",
        )}
      >
        <div className="p-4 md:p-5">
          <h3 className="text-base font-semibold text-foreground/90">Congratulations!</h3>
          <p className="mt-1 text-sm text-muted-foreground/90">Scratch to reveal your BAZ coins.</p>

          <div className="mt-4">
            <div className="relative h-40 w-full overflow-hidden rounded-lg border border-border/60 bg-background/60">
              {/* Hidden prize */}
              <div className="absolute inset-0 z-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl font-extrabold text-foreground/95">{hiddenAmount}</div>
                  <div className="mt-1 text-sm font-medium text-foreground/85">BAZ Coins</div>
                </div>
              </div>

              {/* Pink scratch cover */}
              <canvas
                ref={canvasRef}
                onPointerDown={handlePointer}
                onPointerMove={(e) => e.buttons === 1 && handlePointer(e)}
                className="relative z-10 h-full w-full touch-none cursor-crosshair"
                aria-label="Scratch cover"
              />
            </div>
            <div className="mt-2 text-right text-xs text-muted-foreground">{percent}% revealed</div>
          </div>

          <div className="mt-4 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 items-center justify-center rounded-md bg-secondary px-3 text-xs font-medium text-secondary-foreground hover:bg-secondary/80"
            >
              Close
            </button>
            <button
              type="button"
              disabled={!revealed}
              onClick={() => {
                onClaim(hiddenAmount)
                onClose()
              }}
              className={cn(
                "inline-flex h-9 items-center justify-center rounded-md px-3 text-xs font-medium transition-colors",
                revealed
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-primary/50 text-primary-foreground/80 cursor-not-allowed",
              )}
            >
              Claim
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
