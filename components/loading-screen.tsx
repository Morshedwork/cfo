"use client"

import { useEffect, useState } from "react"
import { Sparkles } from "lucide-react"

export function LoadingScreen() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer)
          return 100
        }
        return prev + 2
      })
    }, 30)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-8">
        <div className="relative">
          <div className="absolute inset-0 animate-pulse-glow rounded-full bg-primary/30 blur-3xl" />
          <div className="absolute inset-0 animate-pulse-glow rounded-full bg-secondary/20 blur-2xl [animation-delay:0.5s]" />
          <Sparkles className="relative h-16 w-16 text-primary animate-float" />
        </div>
        <div className="flex flex-col items-center gap-4">
          <h2 className="text-2xl font-semibold gradient-text">Aura</h2>
          <div className="w-64 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary via-secondary to-accent transition-all duration-300 ease-out relative overflow-hidden"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 animate-shimmer" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground animate-fade-in">Initializing your financial intelligence...</p>
        </div>
      </div>
    </div>
  )
}
