"use client"

import { Button } from "@/app/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/ui/dialog"
import { BarChart3, Trophy } from "lucide-react"

export function ProgressModal() {
  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-white/20 rounded-lg p-8 flex flex-col items-center justify-center space-y-4 min-h-[200px]">
        <Dialog>
          <DialogTrigger asChild>
            <Button
              size="lg"
              className="bg-gradient-to-r from-[#C71585] to-[#B31373] hover:from-[#B31373] hover:to-[#C71585] text-white font-medium rounded-lg"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Your Progress
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-black/30 backdrop-blur-xl border border-white/20 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Your Progress</DialogTitle>
              <DialogDescription className="text-white/60">Track your achievements and milestones</DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              {/* Level Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/60">Level</span>
                  <span className="text-2xl font-bold text-[#C71585]">12</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-[#C71585] to-[#FF69B4] h-3 rounded-full transition-all"
                    style={{ width: "65%" }}
                  />
                </div>
                <p className="text-xs text-white/40">650 / 1000 XP to next level</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                  <p className="text-xs text-white/60 mb-1">Total Tasks</p>
                  <p className="text-2xl font-bold">48</p>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                  <p className="text-xs text-white/60 mb-1">Completed</p>
                  <p className="text-2xl font-bold text-[#C71585]">42</p>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                  <p className="text-xs text-white/60 mb-1">Streak</p>
                  <p className="text-2xl font-bold text-[#FF69B4]">7 days</p>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                  <p className="text-xs text-white/60 mb-1">Rewards</p>
                  <p className="text-2xl font-bold">1,240</p>
                </div>
              </div>

              {/* Recent Achievements */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-white/80">Recent Achievements</h3>
                <div className="space-y-2">
                  {[
                    { name: "First Transfer", date: "2 days ago" },
                    { name: "Pool Master", date: "5 days ago" },
                    { name: "Swap Expert", date: "1 week ago" },
                  ].map((achievement, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#C71585] to-[#FF69B4] flex items-center justify-center">
                          <Trophy className="w-4 h-4" />
                        </div>
                        <span className="text-sm">{achievement.name}</span>
                      </div>
                      <span className="text-xs text-white/40">{achievement.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
