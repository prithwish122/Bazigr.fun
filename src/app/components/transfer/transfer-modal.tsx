"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/app/components/ui/dialog"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"
import { Button } from "@/app/components/ui/button"
import { toast } from "../../toasts/use-toast"
import { ScratchCardDialog } from "@/app/components/transfer/scratch-card-play"
import { cn } from "@/app/lib/utils"

export function TransferCTA() {
  const [open, setOpen] = React.useState(false)
  const [scratchOpen, setScratchOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const formRef = React.useRef<HTMLFormElement | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const from = String(form.get("from") || "")
    const to = String(form.get("to") || "")
    const amount = Number(form.get("amount") || 0)

    if (!from || !to || !amount || amount <= 0) {
      toast({
        title: "Invalid transfer",
        description: "Please fill all fields with valid values.",
        className: "glass-toast",
      })
      return
    }

    setLoading(true)
    // simulate transfer
    setTimeout(() => {
      setLoading(false)
      setOpen(false)
      toast({
        title: "Transfer successful",
        description: `${amount} U2U sent from ${from.slice(0, 5)}… to ${to.slice(0, 5)}…`,
        className: "glass-toast",
      })
      setScratchOpen(true)
      formRef.current?.reset()
    }, 900)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="glass-button">Transfer</Button>
        </DialogTrigger>
        <DialogContent className="glass-panel sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-balance">New Transfer</DialogTitle>
            <DialogDescription>Send U2U with a sleek glass interface.</DialogDescription>
          </DialogHeader>

          <form ref={formRef} onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="from">From address</Label>
              <Input id="from" name="from" placeholder="0xFrom..." className="glass-field" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="to">To address</Label>
              <Input id="to" name="to" placeholder="0xTo..." className="glass-field" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount (U2U)</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                min={0}
                step="0.0001"
                placeholder="0.00"
                className="glass-field"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className={cn("glass-button", loading && "opacity-70")} disabled={loading}>
                {loading ? "Transferring…" : "Transfer"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ScratchCardDialog open={scratchOpen} onOpenChange={setScratchOpen} />
    </>
  )
}
