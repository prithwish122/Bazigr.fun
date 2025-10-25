"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ArrowLeftRight,
  Repeat,
  Badge as Bridge,
  Droplets,
  Trophy,
  Gift,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { name: "Transfer", href: "/dashboard/transfer", icon: ArrowLeftRight },
  { name: "Swap", href: "/dashboard/swap", icon: Repeat },
  { name: "Bridge", href: "/dashboard/bridge", icon: Bridge },
  { name: "Pools", href: "/dashboard/pools", icon: Droplets },
  { name: "Leaderboard", href: "/dashboard/leaderboard", icon: Trophy },
  { name: "Rewards", href: "/dashboard/rewards", icon: Gift },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        "flex flex-col backdrop-blur-xl bg-black/30 border-r border-white/10 transition-all duration-300 relative z-10",
        collapsed ? "w-16" : "w-56",
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 p-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <span className="font-bold text-base tracking-tight">BAZIGR</span>
            <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-[#C71585] text-white">01</span>
          </div>
          {!collapsed && (
            <span className="px-2 py-0.5 text-[10px] rounded-full border border-white/20 text-white/70">Personal</span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-all",
                isActive ? "bg-white/20 text-white" : "text-white/60 hover:bg-white/10 hover:text-white",
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span className="text-sm">{item.name}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-white/10 p-3 space-y-2">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-[#C71585] flex items-center justify-center text-sm font-semibold">
            U
          </div>
          {!collapsed && (
            <div className="flex-1">
              <p className="text-sm font-medium text-white">User</p>
              <p className="text-xs text-white/50">Profile</p>
            </div>
          )}
        </div>

        {!collapsed && (
          <button className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-white/60 hover:bg-white/10 hover:text-white transition-all text-sm">
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        )}

        {/* Collapse Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-white/60 hover:bg-white/10 hover:text-white transition-all"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span className="text-sm">Collapse sidebar</span>
            </>
          )}
        </button>
      </div>
    </aside>
  )
}
