import { UpcomingEvents } from "./upcoming-events"
import { ProgressModal } from "./progress-modal"

export function RightSidebar() {
  return (
    <aside className="w-80 overflow-y-auto p-6 space-y-6">
      <UpcomingEvents />
      <ProgressModal />
    </aside>
  )
}
