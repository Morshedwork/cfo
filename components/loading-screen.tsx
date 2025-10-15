"use client"

import { useEffect, useState } from "react"
import { DollarSign, TrendingUp, Wallet, CreditCard, LineChart, Activity, BarChart3, Zap } from "lucide-react"

// Keyframe for fade out animation
const fadeOutStyle = `
  @keyframes fadeOut {
    from {
      opacity: 1;
      transform: scale(1);
    }
    to {
      opacity: 0;
      transform: scale(0.95);
    }
  }
`

const loadingStages = [
  { text: "Securing connections...", progress: 20 },
  { text: "Analyzing cash flow...", progress: 40 },
  { text: "Calculating runway...", progress: 60 },
  { text: "Optimizing forecasts...", progress: 80 },
  { text: "Ready to launch...", progress: 100 },
]

const currencySymbols = ["$", "€", "¥", "£", "₹"]
const financeIcons = [
  { Icon: TrendingUp, color: '#10b981', delay: 0 },
  { Icon: BarChart3, color: '#3b82f6', delay: 0.5 },
  { Icon: Activity, color: '#06b6d4', delay: 1 },
  { Icon: Zap, color: '#a855f7', delay: 1.5 },
]

export function LoadingScreen({ isExiting = false }: { isExiting?: boolean }) {
  const [progress, setProgress] = useState(0)
  const [stageIndex, setStageIndex] = useState(0)
  const [counter, setCounter] = useState(0)
  const [floatingSymbols, setFloatingSymbols] = useState<{ id: number; symbol: string; x: number; delay: number }[]>([])

  useEffect(() => {
    // Initialize floating currency symbols
    const symbols = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      symbol: currencySymbols[Math.floor(Math.random() * currencySymbols.length)],
      x: Math.random() * 100,
      delay: Math.random() * 2,
    }))
    setFloatingSymbols(symbols)

    // Progress animation
    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressTimer)
          return 100
        }
        return prev + 1.5
      })
    }, 30)

    // Counter animation (simulating financial calculations)
    const counterTimer = setInterval(() => {
      setCounter((prev) => {
        if (prev >= 999999) return 999999
        return prev + Math.floor(Math.random() * 10000) + 1000
      })
    }, 50)

    return () => {
      clearInterval(progressTimer)
      clearInterval(counterTimer)
    }
  }, [])

  useEffect(() => {
    // Update stage based on progress
    const currentStage = loadingStages.findIndex((stage) => progress < stage.progress)
    if (currentStage !== -1 && currentStage !== stageIndex) {
      setStageIndex(currentStage)
    } else if (progress >= 100 && stageIndex !== loadingStages.length - 1) {
      setStageIndex(loadingStages.length - 1)
    }
  }, [progress, stageIndex])

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-background overflow-hidden w-full h-full transition-all duration-500 ${
        isExiting ? 'opacity-0 scale-95' : 'animate-fade-in'
      }`}
      style={isExiting ? { animation: 'fadeOut 0.5s ease-out forwards' } : {}}
    >
      <style>{fadeOutStyle}</style>
      {/* Animated Background Grid */}
      <div className="absolute inset-0 opacity-10 w-full">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#10b98120_1px,transparent_1px),linear-gradient(to_bottom,#10b98120_1px,transparent_1px)] bg-[size:4rem_4rem] animate-grid-flow" />
      </div>

      {/* Floating Currency Symbols */}
      {floatingSymbols.map((item) => (
        <div
          key={item.id}
          className="absolute text-4xl font-bold text-primary/20 animate-float-currency"
          style={{
            left: `${item.x}%`,
            top: "-10%",
            animationDelay: `${item.delay}s`,
            animationDuration: "8s",
          }}
        >
          {item.symbol}
        </div>
      ))}

      <div className="relative z-10 flex flex-col items-center gap-8 px-4">
        {/* Creative Financial Ledger Animation */}
        <div className="relative w-64 h-64">
          {/* Outer glow rings */}
          <div className="absolute inset-0 animate-pulse-glow rounded-full bg-primary/30 blur-3xl" />
          <div className="absolute inset-0 animate-pulse-glow rounded-full bg-accent/20 blur-2xl [animation-delay:0.3s]" />

          {/* Rotating Ledger Circles - Like a Balance Sheet */}
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Outer Circle - Assets */}
            <div className="absolute w-48 h-48 rounded-full border-2 border-primary/40 animate-spin-slow">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
              </div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
                <div className="w-3 h-3 rounded-full bg-primary animate-pulse [animation-delay:0.5s]" />
              </div>
            </div>

            {/* Middle Circle - Liabilities */}
            <div className="absolute w-36 h-36 rounded-full border-2 border-accent/40 animate-spin-slow [animation-delay:0.5s] [animation-direction:reverse]">
              <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2">
                <div className="w-3 h-3 rounded-full bg-accent animate-pulse" />
              </div>
              <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2">
                <div className="w-3 h-3 rounded-full bg-accent animate-pulse [animation-delay:0.5s]" />
              </div>
            </div>

            {/* Inner Circle - Equity */}
            <div className="absolute w-24 h-24 rounded-full border-2 border-secondary/40 animate-spin-slow [animation-delay:1s]">
              <div className="absolute top-2 left-1/2 -translate-x-1/2">
                <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              </div>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
                <div className="w-2 h-2 rounded-full bg-secondary animate-pulse [animation-delay:0.3s]" />
              </div>
            </div>

            {/* Center - Building Financial Statement */}
            <div className="relative z-10 w-20 h-24 bg-gradient-to-br from-primary/20 via-accent/20 to-secondary/20 rounded-lg border border-primary/30 backdrop-blur-sm flex flex-col p-2 gap-1">
              {/* Simulated Financial Report Lines */}
              {[...Array(8)].map((_, i) => {
                const width = [90, 75, 85, 95, 80, 70, 90, 85][i]
                const delay = i * 100
                return (
                  <div
                    key={i}
                    className="h-1 rounded-full bg-gradient-to-r from-primary via-accent to-secondary transition-all duration-500"
                    style={{
                      width: progress > delay / 10 ? `${width}%` : '0%',
                      opacity: progress > delay / 10 ? 1 : 0.2,
                    }}
                  />
                )
              })}
            </div>
          </div>

          {/* Money Flow Streams - Animated Particles */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 200">
            <defs>
              <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="50%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
            {/* Curved money flow paths */}
            <path
              d="M 20 100 Q 50 50, 100 50"
              fill="none"
              stroke="url(#flowGradient)"
              strokeWidth="2"
              opacity="0.6"
              strokeDasharray="5,5"
              className="animate-flow"
            />
            <path
              d="M 100 150 Q 150 150, 180 100"
              fill="none"
              stroke="url(#flowGradient)"
              strokeWidth="2"
              opacity="0.6"
              strokeDasharray="5,5"
              className="animate-flow [animation-delay:0.5s]"
            />
            <path
              d="M 100 20 Q 100 60, 100 100"
              fill="none"
              stroke="url(#flowGradient)"
              strokeWidth="2"
              opacity="0.6"
              strokeDasharray="5,5"
              className="animate-flow [animation-delay:1s]"
            />
          </svg>

          {/* Corner Financial Icons */}
          <div className="absolute -top-4 -left-4 p-2 rounded-lg bg-primary/20 backdrop-blur-sm border border-primary/30">
            <TrendingUp className="h-5 w-5 text-primary animate-pulse" />
          </div>
          <div className="absolute -top-4 -right-4 p-2 rounded-lg bg-accent/20 backdrop-blur-sm border border-accent/30">
            <BarChart3 className="h-5 w-5 text-accent animate-pulse [animation-delay:0.3s]" />
          </div>
          <div className="absolute -bottom-4 -left-4 p-2 rounded-lg bg-secondary/20 backdrop-blur-sm border border-secondary/30">
            <Activity className="h-5 w-5 text-secondary animate-pulse [animation-delay:0.6s]" />
          </div>
          <div className="absolute -bottom-4 -right-4 p-2 rounded-lg bg-purple-500/20 backdrop-blur-sm border border-purple-500/30">
            <Zap className="h-5 w-5 text-purple-500 animate-pulse [animation-delay:0.9s]" />
          </div>
        </div>

        {/* Brand name with gradient */}
        <div className="flex flex-col items-center gap-4">
          <h2 className="text-4xl font-bold gradient-text animate-text-shimmer">Aura</h2>

          {/* Financial counter */}
          <div className="flex items-center gap-2 font-mono text-2xl text-primary animate-fade-in">
            <DollarSign className="h-6 w-6" />
            <span className="tabular-nums">{counter.toLocaleString()}</span>
          </div>

          {/* Cash flow visualization */}
          <div className="w-80 h-3 bg-muted/50 rounded-full overflow-hidden border border-primary/30 relative">
            {/* Animated flowing gradient */}
            <div
              className="h-full bg-gradient-to-r from-accent via-primary to-secondary relative overflow-hidden transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer-fast" />
              {/* Money flow particles */}
              <div className="absolute inset-0 flex items-center">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute h-2 w-2 bg-white rounded-full animate-flow-particle"
                    style={{
                      left: `${i * 20}%`,
                      animationDelay: `${i * 0.2}s`,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Progress percentage indicator */}
            <div
              className="absolute top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-primary border-2 border-background shadow-lg transition-all duration-300"
              style={{ left: `calc(${progress}% - 10px)` }}
            >
              <div className="absolute inset-0 rounded-full bg-primary animate-ping opacity-50" />
            </div>
          </div>

          {/* Progress percentage */}
          <div className="text-3xl font-bold text-primary tabular-nums">{Math.floor(progress)}%</div>

          {/* Loading stage text */}
          <div className="h-8 flex items-center">
            <p className="text-sm text-muted-foreground animate-fade-in font-medium">
              {loadingStages[stageIndex]?.text}
            </p>
          </div>

          {/* Mini chart building animation */}
          <div className="flex items-end gap-1 h-16 mt-2">
            {[...Array(12)].map((_, i) => {
              const height = Math.random() * 60 + 20
              const isActive = progress > i * 8
              return (
                <div
                  key={i}
                  className={`w-4 bg-gradient-to-t from-primary to-accent rounded-t transition-all duration-500 ${
                    isActive ? "opacity-100" : "opacity-20"
                  }`}
                  style={{
                    height: isActive ? `${height}%` : "10%",
                    transitionDelay: `${i * 50}ms`,
                  }}
                />
              )
            })}
          </div>

          {/* Loading dots */}
          <div className="flex gap-2 mt-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-2 w-2 rounded-full bg-primary animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
