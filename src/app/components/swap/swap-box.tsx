"use client"

import * as React from "react"
import { ArrowDown } from "lucide-react"
import { Button } from "@/app/components/ui/button"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/app/components/ui/select"
import { cn } from "@/app/lib/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/app/components/ui/dialog"
import ScratchCard from "@/app/components/rewards/scratch-card"
import { toast } from "../../toasts/use-toast"
import { useWriteContract, usePublicClient } from "wagmi"
import { useAppKitAccount } from "@reown/appkit/react"
import tokenAbi from "@/app/contract/abi.json"
import swapAbiJson from "@/app/contract/swap-abi.json"

// Extract the ABI from the Hardhat artifact
const swapAbi = swapAbiJson.abi

type Token = "CELO" | "BAZ"
const TOKENS: Token[] = ["CELO", "BAZ"]

function TokenSelect({
  value,
  onChange,
  className,
  placeholder,
}: {
  value: Token
  onChange: (v: Token) => void
  className?: string
  placeholder?: string
}) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as Token)}>
      <SelectTrigger className={cn("min-w-[140px]", className)}>
        <SelectValue placeholder={placeholder ?? "Select token"} />
      </SelectTrigger>
      <SelectContent>
        {TOKENS.map((t) => (
          <SelectItem key={t} value={t}>
            {t}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export function SwapBox() {
  const [fromToken, setFromToken] = React.useState<Token>("CELO")
  const [toToken, setToToken] = React.useState<Token>("BAZ")
  const [fromAmount, setFromAmount] = React.useState<string>("0")
  const [toAmount, setToAmount] = React.useState<string>("0")
  const [isSwapping, setIsSwapping] = React.useState(false)
  const [openCongrats, setOpenCongrats] = React.useState(false)
  const [reward, setReward] = React.useState<number>(() => Math.floor(Math.random() * 10) + 1)
  const [canClaim, setCanClaim] = React.useState(false)

  const { address, isConnected } = useAppKitAccount()
  const { writeContractAsync } = useWriteContract()
  const publicClient = usePublicClient()

  // Deployed addresses on CELO
  const TOKEN_ADDRESS = "0xB5692EC21B4f5667E5fAdA7836F050d9CF51E6A9" as `0x${string}`
  const SWAP_ADDRESS = "0xfE053B49CE20845E6c492A575daCDD5ab7d3038D" as `0x${string}`
  const RATE = 20n

  // keep different tokens selected
  React.useEffect(() => {
    if (fromToken === toToken) {
      const alt = TOKENS.find((t) => t !== fromToken)!
      setToToken(alt)
    }
    // Recompute amounts on token change
    setToAmount((prev) => computeTo(fromAmount))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromToken, toToken])

  function parseCleanNumber(s: string): string {
    if (!s) return "0"
    const cleaned = s.replace(/[^\d.]/g, "")
    const [w, f = ""] = cleaned.split(".")
    if (f.length === 0) return w || "0"
    return `${w}.${f}`
  }

  function computeTo(from: string): string {
    const v = Number(from || 0)
    if (!isFinite(v)) return "0"
    if (fromToken === "CELO" && toToken === "BAZ") return (v * 20).toString()
    if (fromToken === "BAZ" && toToken === "CELO") return (v / 20).toString()
    return from
  }

  function computeFrom(to: string): string {
    const v = Number(to || 0)
    if (!isFinite(v)) return "0"
    if (fromToken === "CELO" && toToken === "BAZ") return (v / 20).toString()
    if (fromToken === "BAZ" && toToken === "CELO") return (v * 20).toString()
    return to
  }

  async function handleSwapClick() {
    if (isSwapping) return
    if (!isConnected || !address) {
      toast({ title: "Wallet not connected", description: "Connect your wallet to swap." })
      return
    }
    // Basic validation
    if (!fromAmount || Number(fromAmount) <= 0) {
      toast({ title: "Invalid amount", description: "Enter a positive amount." })
      return
    }
    try {
      setIsSwapping(true)
      setCanClaim(false)

      // Convert to base units (18 decimals)
      const amountWei = (() => {
        const parts = (fromAmount || "0").split(".")
        const whole = BigInt(parts[0] || "0")
        const frac = (parts[1] || "").padEnd(18, "0").slice(0, 18)
        return whole * 10n ** 18n + BigInt(frac || "0")
      })()

      if (fromToken === "CELO" && toToken === "BAZ") {
        // Native -> BAZ: try estimating, but don't block on failures
        if (publicClient) {
          try {
            await publicClient.estimateContractGas({
              abi: swapAbi as any,
              functionName: "swapNativeForBaz",
              address: SWAP_ADDRESS,
              args: [],
              value: amountWei,
              account: address as `0x${string}`,
            })
          } catch (_) {
            // ignore estimation errors and proceed to submit tx
          }
        }
        const hash = await writeContractAsync({
          abi: swapAbi as any,
          functionName: "swapNativeForBaz",
          address: SWAP_ADDRESS,
          args: [],
          value: amountWei,
        })
        if (publicClient) await publicClient.waitForTransactionReceipt({ hash })
      } else if (fromToken === "BAZ" && toToken === "CELO") {
        // BAZ -> Native: estimate approve + swap (non-blocking)
        if (publicClient) {
          try {
            await publicClient.estimateContractGas({
              abi: tokenAbi as any,
              functionName: "approve",
              address: TOKEN_ADDRESS,
              args: [SWAP_ADDRESS, amountWei],
              account: address as `0x${string}`,
            })
          } catch (_) {
            // ignore
          }
        }
        const approveHash = await writeContractAsync({
          abi: tokenAbi as any,
          functionName: "approve",
          address: TOKEN_ADDRESS,
          args: [SWAP_ADDRESS, amountWei],
        })
        if (publicClient) await publicClient.waitForTransactionReceipt({ hash: approveHash })

        if (publicClient) {
          try {
            await publicClient.estimateContractGas({
              abi: swapAbi as any,
              functionName: "swapBazForNative",
              address: SWAP_ADDRESS,
              args: [amountWei],
              account: address as `0x${string}`,
            })
          } catch (_) {
            // ignore
          }
        }
        const swapHash = await writeContractAsync({
          abi: swapAbi as any,
          functionName: "swapBazForNative",
          address: SWAP_ADDRESS,
          args: [amountWei],
        })
        if (publicClient) await publicClient.waitForTransactionReceipt({ hash: swapHash })
      } else {
        toast({ title: "Unsupported pair", description: "Choose CELO ↔ BAZ" })
        return
      }

      toast({
        title: "Swap successful",
        description: `${fromAmount} ${fromToken} → ${toAmount || fromAmount} ${toToken} completed.`,
      })
      setReward(Math.floor(Math.random() * 10) + 1)
      setOpenCongrats(true)
    } catch (err: any) {
      toast({ title: "Swap failed", description: err?.shortMessage || err?.message || "Transaction failed" })
    } finally {
      setIsSwapping(false)
    }
  }

  async function handleClaim() {
    if (!isConnected || !address) {
      toast({ title: "Wallet not connected", description: "Connect your wallet to claim." })
      return
    }
    try {
      const hash = await writeContractAsync({
        abi: tokenAbi as any,
        functionName: "mint",
        address: TOKEN_ADDRESS,
        args: [address as `0x${string}`, String(reward)],
      })
      if (publicClient) await publicClient.waitForTransactionReceipt({ hash })
      toast({ title: "Cashback claimed", description: `Minted ${reward} BAZ to your wallet.` })
      setOpenCongrats(false)
    } catch (err: any) {
      toast({ title: "Claim failed", description: err?.shortMessage || err?.message || "Transaction failed" })
    }
  }

  return (
    <div className="w-full">
      <div className="mx-auto w-full max-w-xl">
        <div className={cn("rounded-xl border border-border/60 bg-card/20 backdrop-blur-md shadow-lg", "p-4")}>
          {/* Top panel - Sell */}
          <div className="rounded-xl border border-border/50 bg-card/20 p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="text-sm text-muted-foreground">Sell</div>
                <input
                  type="number"
                  inputMode="decimal"
                  value={fromAmount}
                  onChange={(e) => {
                    const v = parseCleanNumber(e.target.value)
                    setFromAmount(v)
                    setToAmount(computeTo(v))
                  }}
                  className={cn("bg-transparent outline-none", "text-4xl font-medium leading-none", "w-full")}
                  aria-label="Sell amount"
                />
                <div className="mt-1 text-xs text-muted-foreground">$0</div>
              </div>
              <TokenSelect value={fromToken} onChange={setFromToken} className="shrink-0" />
            </div>
          </div>

          {/* Arrow between panels */}
          <div className="flex justify-center">
            <div className="relative -mt-4 mb-2">
              <div className="rounded-full border border-border/50 bg-card/40 backdrop-blur-md p-2 shadow-md">
                <ArrowDown className="size-4" />
              </div>
            </div>
          </div>

          {/* Bottom panel - Buy */}
          <div className="rounded-xl border border-border/50 bg-card/20 p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="text-sm text-muted-foreground">Buy</div>
                <input
                  type="number"
                  inputMode="decimal"
                  value={toAmount}
                  onChange={(e) => {
                    const v = parseCleanNumber(e.target.value)
                    setToAmount(v)
                    setFromAmount(computeFrom(v))
                  }}
                  className={cn("bg-transparent outline-none", "text-4xl font-medium leading-none", "w-full")}
                  aria-label="Buy amount"
                />
              </div>
              <TokenSelect value={toToken} onChange={setToToken} className="shrink-0" />
            </div>
          </div>

          {/* CTA - Swap */}
          <Button className="mt-4 h-12 w-full text-base" onClick={handleSwapClick} disabled={isSwapping}>
            {isSwapping ? "Swapping..." : "Swap"}
          </Button>
        </div>
      </div>

      <Dialog open={openCongrats} onOpenChange={setOpenCongrats}>
        <DialogContent className="bg-card/20 backdrop-blur-xl border border-border/60 max-w-lg text-foreground">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">Congratulations!</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4">
            <div className="text-sm text-muted-foreground">Scratch to reveal your bonus</div>
            <ScratchCard
              rewardText={`${reward} BAZ`}
              width={360}
              height={200}
              onRevealComplete={() => setCanClaim(true)}
            />
            <Button
              className={cn(
                "mt-2 w-full",
                canClaim
                  ? "bg-pink-600 hover:bg-pink-500 text-white"
                  : "bg-muted text-muted-foreground cursor-not-allowed",
              )}
              disabled={!canClaim}
              onClick={handleClaim}
            >
              Claim
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default SwapBox
