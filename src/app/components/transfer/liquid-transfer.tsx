"use client"

import * as React from "react"
import { cn } from "@/app/lib/utils"

type TokenSymbol = "U2U" | "BAZ"

export type LiquidTransferProps = {
  className?: string
  // initial values
  defaultFromAccount?: string
  defaultToAccount?: string
  defaultToken?: TokenSymbol
  defaultAmount?: string | number
  // actions
  onSubmit?: (payload: {
    fromAccount: string
    toAccount: string
    token: TokenSymbol
    amount: string
  }) => void
  onCancel?: () => void
}

/**
 * Reusable LiquidTransfer component with a "liquid glass" look.
 * - From account: textbox
 * - Tokens: U2U and BAZ only
 * - No fiat ($) references
 * - To mirrors token + amount from From
 */
export function LiquidTransfer({
  className,
  defaultFromAccount = "",
  defaultToAccount = "",
  defaultToken = "U2U",
  defaultAmount = "",
  onSubmit,
  onCancel,
}: LiquidTransferProps) {
  const [fromAccount, setFromAccount] = React.useState(defaultFromAccount)
  const [toAccount, setToAccount] = React.useState(defaultToAccount)
  const [token, setToken] = React.useState<TokenSymbol>(defaultToken)
  const [amount, setAmount] = React.useState(String(defaultAmount ?? ""))

  const disabled = !fromAccount || !toAccount || !amount || Number(amount) <= 0

  const handleContinue = () => {
    if (disabled) return
    onSubmit?.({
      fromAccount: fromAccount.trim(),
      toAccount: toAccount.trim(),
      token,
      amount: String(amount),
    })
  }

  return (
    <div
      className={cn(
        "relative rounded-xl border border-border/60 bg-background/40 backdrop-blur-xl",
        "shadow-[0_0_1px_1px_rgba(255,255,255,0.03)]",
        "before:absolute before:inset-0 before:rounded-xl before:pointer-events-none",
        "before:bg-[radial-gradient(1200px_600px_at_-10%_-20%,hsl(var(--color-primary)/0.09),transparent_60%),radial-gradient(1000px_600px_at_110%_120%,hsl(var(--color-chart-3)/0.08),transparent_60%)]",
        className,
      )}
      aria-label="Liquid Glass Transfer"
      role="region"
    >
      <div className="p-4 md:p-5">
        <section aria-labelledby="from-heading" className="space-y-3">
          <h2 id="from-heading" className="text-sm font-medium text-foreground/90">
            From
          </h2>

          {/* From Account - Textbox */}
          <div className={cn("rounded-lg border border-border/60 bg-background/50", "px-3 py-3")}>
            <label htmlFor="fromAccount" className="sr-only">
              From account
            </label>
            <input
              id="fromAccount"
              type="text"
              inputMode="text"
              autoComplete="off"
              spellCheck={false}
              placeholder="From account (e.g., 0x...)"
              className={cn("w-full bg-transparent text-sm outline-none", "placeholder:text-muted-foreground/60")}
              value={fromAccount}
              onChange={(e) => setFromAccount(e.target.value)}
            />
          </div>

          {/* From Token + Amount */}
          <div className={cn("rounded-lg border border-border/60 bg-background/50", "px-3 py-3")}>
            <div className="flex items-center justify-between gap-3">
              {/* Token selector limited to U2U / BAZ */}
              <div className="flex items-center gap-2">
                <TokenBadge symbol={token} />
                <div className="relative">
                  <label htmlFor="token" className="sr-only">
                    Token
                  </label>
                  <select
                    id="token"
                    className={cn(
                      "appearance-none bg-transparent pr-6 text-sm font-medium outline-none",
                      "hover:cursor-pointer",
                    )}
                    value={token}
                    onChange={(e) => setToken(e.target.value as TokenSymbol)}
                    aria-label="Select token"
                  >
                    <option value="U2U">U2U</option>
                    <option value="BAZ">BAZ</option>
                  </select>
                </div>
              </div>

              {/* Amount input (no $ reference) */}
              <div className="text-right">
                <label htmlFor="amount" className="sr-only">
                  Amount
                </label>
                <input
                  id="amount"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.000001"
                  placeholder="0"
                  className={cn("w-[120px] bg-transparent text-right text-sm font-medium outline-none md:w-[160px]")}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            </div>
          </div>
        </section>

        <div className="my-4 h-px w-full bg-border/60" />

        <section aria-labelledby="to-heading" className="space-y-3">
          <h2 id="to-heading" className="text-sm font-medium text-foreground/90">
            To
          </h2>

          {/* To Account - empty textbox */}
          <div className={cn("rounded-lg border border-border/60 bg-background/50", "px-3 py-3")}>
            <label htmlFor="toAccount" className="sr-only">
              To account
            </label>
            <input
              id="toAccount"
              type="text"
              inputMode="text"
              autoComplete="off"
              spellCheck={false}
              placeholder="To account (e.g., 0x...)"
              className={cn("w-full bg-transparent text-sm outline-none", "placeholder:text-muted-foreground/60")}
              value={toAccount}
              onChange={(e) => setToAccount(e.target.value)}
            />
          </div>

          {/* To Token + mirrored Amount (read-only) */}
          <div className={cn("rounded-lg border border-border/60 bg-background/50", "px-3 py-3")}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <TokenBadge symbol={token} />
                <div className="text-sm font-medium" aria-live="polite">
                  {token}
                </div>
              </div>

              <div
                className={cn("w-[120px] text-right text-sm font-medium md:w-[160px]", "text-foreground")}
                aria-live="polite"
              >
                {amount ? amount : "0"}
              </div>
            </div>
          </div>
        </section>

        <div className="mt-5 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => onCancel?.()}
            className={cn(
              "inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-medium",
              "bg-secondary text-secondary-foreground hover:bg-secondary/80",
              "transition-colors",
            )}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={handleContinue}
            className={cn(
              "inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-medium",
              "bg-primary text-primary-foreground transition-colors",
              disabled ? "opacity-50" : "hover:bg-primary/90",
            )}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  )
}

function TokenBadge({ symbol }: { symbol: TokenSymbol }) {
  return (
    <div
      className={cn(
        "flex h-7 w-7 items-center justify-center rounded-full",
        symbol === "U2U" ? "bg-chart-2/20 text-chart-2" : "bg-chart-5/20 text-chart-5",
        "border border-border/60",
      )}
      aria-hidden="true"
      title={symbol}
    >
      <span className="text-[10px] font-bold">{symbol}</span>
    </div>
  )
}
