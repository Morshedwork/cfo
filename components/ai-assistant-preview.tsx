"use client"

import { useState, useEffect } from "react"
import { CFOMascot } from "@/components/cfo-mascot"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  TrendingUp,
  DollarSign,
  AlertTriangle,
  Lightbulb,
  Zap,
  ArrowRight,
  Sparkles,
  Brain,
  BarChart3,
  Mic,
  Volume2,
  Send,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  type?: "text" | "insight" | "warning" | "recommendation"
}

const demoMessages: ChatMessage[] = [
  {
    id: "1",
    role: "assistant",
    content: "👋 Hi! I'm Aura, your AI CFO. I analyze financial data in real-time and provide strategic insights for cash flow, runway forecasting, expense optimization, and growth planning.",
    type: "text",
  },
  {
    id: "2",
    role: "user",
    content: "What's our current runway?",
  },
  {
    id: "3",
    role: "assistant",
    content: "⚠️ Critical Alert\n\nRunway: 0.9 months\nCash: $70K | Burn: $82K/month\n\nThis is below the 3-month safety threshold. Immediate action required to extend runway or secure funding.",
    type: "warning",
  },
  {
    id: "4",
    role: "user",
    content: "What should I do?",
  },
  {
    id: "5",
    role: "assistant",
    content: "💡 Strategic Action Plan\n\nImmediate (Week 1)\n→ Reduce non-essential expenses by 30%\n→ Extends runway to 1.3 months\n\nShort-term (Month 1-2)\n→ Accelerate sales pipeline\n→ Potential +15% MRR increase\n\nMedium-term (Month 2-4)\n→ Begin Series A fundraising prep\n→ Typical process: 3-4 months\n\nWould you like me to model these scenarios with detailed projections?",
    type: "recommendation",
  },
]

interface AIAssistantPreviewProps {
  autoPlay?: boolean
}

export function AIAssistantPreview({ autoPlay = false }: AIAssistantPreviewProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(autoPlay)
  const [mascotState, setMascotState] = useState<"idle" | "listening" | "thinking" | "speaking" | "success" | "alert">(autoPlay ? "listening" : "idle")

  useEffect(() => {
    if (isPlaying && currentMessageIndex < demoMessages.length) {
      const message = demoMessages[currentMessageIndex]
      
      const timer = setTimeout(() => {
        // Update mascot state based on message
        if (message.role === "user") {
          setMascotState("listening")
        } else if (message.type === "warning") {
          setMascotState("alert")
        } else if (message.type === "recommendation") {
          setMascotState("success")
        } else {
          setMascotState("speaking")
        }

        setCurrentMessageIndex((prev) => prev + 1)
      }, message.role === "user" ? 1500 : 3000)

      return () => clearTimeout(timer)
    } else if (currentMessageIndex >= demoMessages.length) {
      setIsPlaying(false)
      setMascotState("idle")
    }
  }, [isPlaying, currentMessageIndex])

  const handleStartDemo = () => {
    setCurrentMessageIndex(0)
    setIsPlaying(true)
    setMascotState("listening")
  }

  const handleReset = () => {
    setCurrentMessageIndex(0)
    setIsPlaying(false)
    setMascotState("idle")
  }

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 gradient-bg-1" />
      <div className="container relative z-10">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/50 gap-2">
            <Sparkles className="h-3 w-3" />
            Live AI Assistant Demo
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Experience AI-Powered Financial Intelligence
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See how Aura provides CFO-level insights in real-time. Click "Start Demo" to watch the AI assistant in action.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            {/* Left: Interactive Chat Preview */}
            <Card className="border-2 border-primary/10 bg-background/95 backdrop-blur-sm overflow-hidden hover-lift">
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-4 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <CFOMascot size="small" state={mascotState} />
                      <div className="absolute -top-1 -right-1">
                        <div className={cn(
                          "h-3 w-3 rounded-full border-2 border-background",
                          mascotState === "listening" && "bg-cyan-500 animate-pulse",
                          mascotState === "thinking" && "bg-yellow-500 animate-pulse",
                          mascotState === "speaking" && "bg-purple-500 animate-pulse",
                          mascotState === "alert" && "bg-red-500 animate-pulse",
                          mascotState === "success" && "bg-green-500 animate-pulse",
                          mascotState === "idle" && "bg-green-500"
                        )} />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-sm">AI CFO Assistant</h3>
                      <p className="text-xs text-muted-foreground">Online • Ready to help</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="gap-1">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    Live
                  </Badge>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="p-6 space-y-4 min-h-[400px] max-h-[500px] overflow-y-auto">
                {demoMessages.slice(0, currentMessageIndex).map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-3 animate-slide-up",
                      message.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    {message.role === "assistant" && (
                      <div className="flex-shrink-0">
                        <CFOMascot 
                          size="small" 
                          state={
                            message.type === "warning" ? "alert" :
                            message.type === "recommendation" ? "success" :
                            "idle"
                          }
                        />
                      </div>
                    )}
                    <div
                      className={cn(
                        "max-w-[85%] rounded-2xl p-4 shadow-md",
                        message.role === "user"
                          ? "bg-gradient-to-br from-primary to-primary/80 text-white"
                          : message.type === "warning"
                            ? "bg-destructive/10 text-foreground border-2 border-destructive/50"
                            : message.type === "insight"
                              ? "bg-blue-500/10 text-foreground border-2 border-blue-500/50"
                              : message.type === "recommendation"
                                ? "bg-green-500/10 text-foreground border-2 border-green-500/50"
                                : "bg-muted text-foreground"
                      )}
                    >
                      {message.type === "warning" && (
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="h-4 w-4 text-destructive" />
                          <span className="font-bold text-destructive text-xs">Critical Alert</span>
                        </div>
                      )}
                      {message.type === "recommendation" && (
                        <div className="flex items-center gap-2 mb-2">
                          <Lightbulb className="h-4 w-4 text-green-600" />
                          <span className="font-bold text-green-600 text-xs">Recommendation</span>
                        </div>
                      )}
                      <p className="text-sm leading-relaxed whitespace-pre-line">{message.content}</p>
                    </div>
                    {message.role === "user" && (
                      <div className="flex-shrink-0 h-8 w-8 rounded-xl bg-gradient-to-br from-secondary to-accent flex items-center justify-center shadow-lg">
                        <span className="text-white text-xs font-bold">U</span>
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Loading indicator */}
                {isPlaying && currentMessageIndex < demoMessages.length && (
                  <div className="flex gap-3 animate-slide-up">
                    <div className="flex-shrink-0">
                      <CFOMascot size="small" state="thinking" />
                    </div>
                    <div className="bg-muted rounded-2xl p-4 shadow-md">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: "0s" }} />
                          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: "0.2s" }} />
                          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: "0.4s" }} />
                        </div>
                        <span className="text-xs text-muted-foreground">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="border-t bg-muted/30 p-4">
                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    className="flex-shrink-0 h-10 w-10"
                  >
                    <Mic className="h-4 w-4" />
                  </Button>
                  <div className="flex-1 bg-background rounded-lg px-4 py-2 text-sm text-muted-foreground">
                    Ask about burn rate, runway, expenses...
                  </div>
                  <Button
                    size="icon"
                    className="flex-shrink-0 h-10 w-10 bg-gradient-to-r from-primary to-secondary"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>

            {/* Right: Features & Controls */}
            <div className="space-y-6">
              {/* Demo Controls */}
              <Card className="border-2 border-primary/10 bg-background/95 backdrop-blur-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    Interactive Demo
                  </h3>
                  <Badge variant="outline" className="text-xs">
                    {currentMessageIndex}/{demoMessages.length} messages
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Watch the AI assistant analyze financial data and provide strategic recommendations in real-time.
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={handleStartDemo}
                    disabled={isPlaying}
                    className="flex-1 bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                  >
                    {currentMessageIndex === 0 ? (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Start Demo
                      </>
                    ) : (
                      <>
                        <Brain className="h-4 w-4 mr-2" />
                        Playing...
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    disabled={currentMessageIndex === 0}
                  >
                    Reset
                  </Button>
                </div>
              </Card>

              {/* Quick Features */}
              <Card className="border-2 border-primary/10 bg-background/95 backdrop-blur-sm p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  AI Capabilities
                </h3>
                <div className="space-y-3">
                  {[
                    { icon: TrendingUp, label: "Runway Forecasting", desc: "Predict cash flow with ML" },
                    { icon: DollarSign, label: "Expense Analysis", desc: "Identify cost savings" },
                    { icon: AlertTriangle, label: "Risk Alerts", desc: "Early warning system" },
                    { icon: Lightbulb, label: "Strategic Insights", desc: "CFO-level recommendations" },
                  ].map((feature, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group cursor-pointer"
                    >
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                        <feature.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm">{feature.label}</h4>
                        <p className="text-xs text-muted-foreground">{feature.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* CTA */}
              <Card className="border-2 border-accent/50 bg-gradient-to-br from-primary/5 to-accent/5 p-6">
                <div className="text-center">
                  <h3 className="font-bold text-lg mb-2">Ready to Experience It Yourself?</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Get instant access to your AI CFO assistant
                  </p>
                  <Link href="/ai-assistant">
                    <Button className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90">
                      Try AI Assistant
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </Card>
            </div>
          </div>

          {/* Bottom Stats */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            {[
              { icon: Brain, value: "95%", label: "AI Accuracy" },
              { icon: Zap, value: "< 2s", label: "Response Time" },
              { icon: BarChart3, value: "24/7", label: "Available" },
            ].map((stat, i) => (
              <Card
                key={i}
                className="p-6 text-center border-2 border-primary/10 bg-background/95 backdrop-blur-sm hover-lift"
              >
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 mb-3">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="text-3xl font-bold mb-1 animate-text-shimmer">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

