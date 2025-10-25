"use client"

import type React from "react"
import { RewardsProvider } from "../components/rewards/rewards-context"
import { Sidebar } from "../components/dashboard/sidebar"
import { Navbar } from "../components/dashboard/navbar"
import { RightSidebar } from "../components/dashboard/right-sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RewardsProvider>
      <div
        className="flex h-screen text-white overflow-hidden relative"
        style={{
          backgroundImage: "url(/images/background.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Navbar */}
          <Navbar />

          {/* Content Area */}
          <div className="flex-1 flex overflow-hidden">
            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
              <div className="p-6">{children}</div>
            </main>

            {/* Dotted Separator */}
            <div className="w-px border-l-2 border-dashed border-white/20 my-6" />

            {/* Right Sidebar */}
            <RightSidebar />
          </div>
        </div>
      </div>
    </RewardsProvider>
  )
}
