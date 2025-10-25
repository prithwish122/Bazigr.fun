import { Calendar } from "lucide-react"

export function UpcomingEvents() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-white/80">
        <Calendar className="w-5 h-5" />
        <h2 className="text-base font-semibold">Daily Tasks</h2>
      </div>

      <div className="border-2 border-dashed border-white/20 rounded-lg p-4 flex flex-col items-stretch justify-start space-y-3 min-h-[200px]">
        <div className="flex items-center gap-2 text-white/70">
          <Calendar className="w-4 h-4" />
          <span className="text-sm font-medium">Daily Tasks</span>
        </div>

        {[
          { name: "Perform a Swap", baz: 10 },
          { name: "Perform 3 Transactions", baz: 9 },
          { name: "Play 3 Mini Games", baz: 8 },
          { name: "Bridge a Token", baz: 7 },
        ].map((task, i) => (
          <div
            key={i}
            className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10 flex items-center justify-between"
          >
            <span className="text-sm text-white/90">{task.name}</span>
            <span className="text-xs px-2 py-1 rounded-md border border-white/15 bg-white/5 text-white/80">
              {task.baz} Baz
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
