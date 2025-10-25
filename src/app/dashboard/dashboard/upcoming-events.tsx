import { Button } from "@/components/ui/button"
import { Calendar, Plus } from "lucide-react"

export function UpcomingEvents() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-white/80">
        <Calendar className="w-5 h-5" />
        <h2 className="text-base font-semibold">Upcoming events</h2>
      </div>

      <div className="border-2 border-dashed border-white/20 rounded-lg p-8 flex flex-col items-center justify-center space-y-4 min-h-[200px]">
        <div className="w-16 h-16 rounded-lg bg-white/10 flex items-center justify-center">
          <Calendar className="w-8 h-8 text-white/40" />
        </div>
        <Button
          size="sm"
          className="bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs rounded-lg"
        >
          <Plus className="w-3 h-3 mr-1" />
          Schedule new Event
        </Button>
      </div>
    </div>
  )
}
