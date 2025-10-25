import { Button } from "@/components/ui/button"
import { Coins, HelpCircle, Crown } from "lucide-react"

export function Navbar() {
  return (
    <header className="flex items-center justify-end px-6 py-4 relative z-10">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg backdrop-blur-md bg-black/40 border border-yellow-500/30">
          <Coins className="w-4 h-4 text-yellow-400" />
          <span className="text-sm font-bold text-yellow-400">752</span>
        </div>

        <Button
          size="sm"
          className="bg-[#C71585] hover:bg-[#B31373] text-white font-medium text-xs px-4 border-0 rounded-lg"
        >
          claim now
        </Button>

        <Button
          size="sm"
          variant="ghost"
          className="text-white/80 hover:text-white hover:bg-white/10 text-xs backdrop-blur-md bg-black/20 rounded-lg"
        >
          <HelpCircle className="w-4 h-4 mr-1" />
          Help
        </Button>

        <Button
          size="sm"
          variant="outline"
          className="border-white/20 text-white/80 hover:bg-white/10 bg-black/20 backdrop-blur-md text-xs rounded-lg"
        >
          <Crown className="w-4 h-4 mr-1" />
          Upgrade to Pro
        </Button>
      </div>
    </header>
  )
}
