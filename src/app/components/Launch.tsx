"use client"

import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import { cn } from "../lib/utils"

export function LaunchAppButton({ className }: { className?: string }) {
  return (
    <button
      aria-label="Launch App"
      className={cn(
        "gap-1 rounded-lg shadow-none bg-black px-3 py-1.5 text-xs text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 transition-colors duration-200",
        className
      )}
    //   onClick={() => window.open("https://v0.dev/community/minimalist-card-G74jCSN5LYl", "_blank")}
    >
      Launch App
      
    </button>
  )
}