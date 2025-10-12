"use client"

import { useState, useEffect, useRef } from "react"
import { LoadingScreen } from "@/components/loading-screen"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Mic,
  MicOff,
  Sparkles,
  Volume2,
  VolumeX,
  Send,
  TrendingUp,
  DollarSign,
  Calendar,
  BarChart3,
  Lightbulb,
  AlertTriangle,
  Zap,
  StopCircle,
  Loader2,
  Bot,
  User,
  RefreshCw,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { CFOMascot } from "@/components/cfo-mascot"
import {
  ScenarioComparisonCard,
  KPIDashboardCard,
  RiskAlertCard,
  CapTableComparisonCard,
  StrategicInsightCard,
} from "@/components/ai-message-types"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  type?: "text" | "insight" | "warning" | "recommendation" | "scenario_analysis" | "kpi_dashboard" | "alert" | "cap_table" | "strategic_insight" | "forecast"
  data?: any
  chart?: any
  actions?: Array<{
    label: string
    action: string
    variant?: 'default' | 'outline' | 'destructive' | 'secondary'
  }>
}

export default function AIAssistantPage() {
  const [loading, setLoading] = useState(true)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const [autoSpeak, setAutoSpeak] = useState(false)
  const [recognition, setRecognition] = useState<any>(null)
  const [abortController, setAbortController] = useState<AbortController | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
      // Start with empty messages to show thought bubbles
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    // Initialize Web Speech API
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition
      const recognitionInstance = new SpeechRecognition()
      recognitionInstance.continuous = false
      recognitionInstance.interimResults = false
      recognitionInstance.lang = "en-US"

      recognitionInstance.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setInputValue(transcript)
        setIsListening(false)
        // Auto-submit after voice input
        setTimeout(() => {
          handleSendMessage(transcript)
        }, 500)
      }

      recognitionInstance.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error)
        setIsListening(false)
      }

      recognitionInstance.onend = () => {
        setIsListening(false)
      }

      setRecognition(recognitionInstance)
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const quickActions = [
    { icon: BarChart3, label: "Model Hiring Scenario", query: "Model hiring 2 engineers at $180k each starting next month" },
    { icon: TrendingUp, label: "Cash Flow Forecast", query: "Project our cash runway for the next 12 months" },
    { icon: DollarSign, label: "Investor KPIs", query: "Generate investor KPI dashboard with benchmarks" },
    { icon: Calendar, label: "Funding Round Impact", query: "Model a $10M Series B at $100M pre-money valuation with 10% option pool" },
    { icon: Lightbulb, label: "Cost Optimization", query: "What are my biggest expenses and where can I reduce costs?" },
    { icon: Zap, label: "Revenue Growth Ideas", query: "Analyze growth opportunities and revenue optimization strategies" },
  ]

  const startVoiceInput = () => {
    if (!recognition) {
      alert("Voice recognition requires Chrome or Edge browser.\n\nTip: You can type your message instead!")
      return
    }

    try {
      recognition.start()
      setIsListening(true)
    } catch (error: any) {
      console.error("Voice recognition error:", error)
      if (!error.message?.includes("already")) {
        alert("Could not start voice recognition. Please try again.")
      }
      setIsListening(false)
    }
  }

  const stopVoiceInput = () => {
    if (recognition) {
      try {
        recognition.stop()
      } catch (error) {
        console.error("Error stopping recognition:", error)
      }
    }
    setIsListening(false)
  }

  const handleTextToSpeech = (text: string) => {
    if (isSpeaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      return
    }

    setIsSpeaking(true)
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.95
      utterance.pitch = 1
      utterance.volume = 1
      
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)
      
      window.speechSynthesis.speak(utterance)
    } else {
      setTimeout(() => setIsSpeaking(false), 3000)
    }
  }

  const stopProcessing = () => {
    if (abortController) {
      abortController.abort()
      setAbortController(null)
    }
    setIsProcessing(false)
  }

  const clearChat = () => {
    setMessages([{
      id: "welcome",
      role: "assistant",
      content:
        "👋 Hello! I'm **Aura**, your AI Chief Financial Officer.\n\nI'm here to help you with:\n• Cash flow & runway analysis\n• Expense optimization strategies\n• Revenue growth planning\n• Fundraising recommendations\n• Strategic financial decisions\n\n**Ask me anything** about your finances!",
      timestamp: new Date(),
      type: "text",
    }])
  }

  const handleSendMessage = async (content?: string) => {
    const messageContent = content || inputValue.trim()
    if (!messageContent || isProcessing) return

    const userMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      role: "user",
      content: messageContent,
      timestamp: new Date(),
      type: "text",
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsProcessing(true)

    // Create abort controller for this request
    const controller = new AbortController()
    setAbortController(controller)

    try {
      console.log("[AI Assistant] Sending message:", messageContent)
      
      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageContent,
          context: {
            cashBalance: 70000,
            monthlyBurn: 82000,
            runway: 0.9,
            mrr: 35000,
            growth: 25,
          },
        }),
        signal: controller.signal,
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log("[AI Assistant] Received response:", data)

      // Use the type from the enhanced API response
      const messageType = data.type || "text"

      const assistantMessage: Message = {
        id: Math.random().toString(36).substr(2, 9),
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
        type: messageType,
        data: data.data,
        chart: data.chart,
        actions: data.actions,
      }

      setMessages((prev) => [...prev, assistantMessage])

      // Auto-speak if enabled
      if (autoSpeak && !controller.signal.aborted) {
        setTimeout(() => handleTextToSpeech(data.message), 500)
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log("[AI Assistant] Request cancelled by user")
        return
      }
      
      console.error("[AI Assistant] Error:", error)
      const errorMessage: Message = {
        id: Math.random().toString(36).substr(2, 9),
        role: "assistant",
        content: "I apologize, but I'm having trouble connecting. Please check your API key or try again in a moment.",
        timestamp: new Date(),
        type: "text",
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsProcessing(false)
      setAbortController(null)
      setTimeout(() => textareaRef.current?.focus(), 100)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (loading) {
    return <LoadingScreen />
  }

  return (
    <div className="min-h-screen bg-background w-full">
      <Navbar />

      <div className="container max-w-7xl py-6 w-full">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <CFOMascot 
                size="medium" 
                state={
                  isListening ? 'listening' : 
                  isProcessing ? 'thinking' : 
                  isSpeaking ? 'speaking' : 
                  'idle'
                }
                className="animate-pulse-glow"
              />
              <div>
                <h1 className="text-2xl font-bold gradient-text">AI Chief Financial Officer</h1>
                <p className="text-sm text-muted-foreground">Your expert financial advisor powered by Gemini AI</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="gap-1">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                Online
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAutoSpeak(!autoSpeak)}
                className={cn(autoSpeak && "bg-accent text-accent-foreground")}
              >
                {autoSpeak ? <Volume2 className="h-4 w-4 mr-1" /> : <VolumeX className="h-4 w-4 mr-1" />}
                Voice {autoSpeak ? "ON" : "OFF"}
              </Button>
              <Button variant="outline" size="sm" onClick={clearChat}>
                <RefreshCw className="h-4 w-4 mr-1" />
                Clear
              </Button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Chat Interface - 3 columns */}
          <div className="lg:col-span-3">
            <Card className="flex flex-col border-2 border-primary/10" style={{ height: 'calc(100vh - 220px)' }}>
              {/* Messages */}
              <CardContent className="flex-1 overflow-y-auto p-6 space-y-4 relative">
                {/* Empty State with Interactive Thought Bubbles */}
                {messages.length === 0 && (
                  <div className="flex items-center justify-center h-full animate-fade-in relative">
                    {/* Central Mascot */}
                    <div className="relative z-10">
                      <CFOMascot 
                        size="large" 
                        state={
                          isListening ? 'listening' : 
                          isProcessing ? 'thinking' : 
                          'idle'
                        }
                        className="animate-float"
                      />
                      <div className="text-center mt-4">
                        <h2 className="text-2xl font-bold gradient-text">Hi! I'm Aura</h2>
                        <p className="text-sm text-muted-foreground">Click a bubble to get started</p>
                      </div>
                    </div>

                    {/* Thought Bubbles - Positioned around mascot */}
                    {/* Top Left - FP&A */}
                    <div 
                      className="absolute top-8 left-12 animate-fade-in cursor-pointer group"
                      style={{ animationDelay: '0.1s' }}
                      onClick={() => {
                        setInputValue("Show me our current runway forecast and cash flow analysis");
                        setTimeout(() => textareaRef.current?.focus(), 100);
                      }}
                    >
                      <div className="relative">
                        {/* Bubble tail */}
                        <div className="absolute -bottom-2 left-8 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[10px] border-t-primary/20 group-hover:border-t-primary/40 transition-colors" />
                        {/* Bubble */}
                        <div className="bg-gradient-to-br from-primary/10 to-primary/5 backdrop-blur-sm border-2 border-primary/20 rounded-2xl p-3 w-44 hover:border-primary/40 hover:scale-105 transition-all hover:shadow-lg hover:shadow-primary/20">
                          <div className="flex items-start gap-2">
                            <TrendingUp className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                            <div className="min-w-0 flex-1">
                              <h3 className="font-semibold text-xs text-foreground mb-0.5 leading-tight">FP&A</h3>
                              <p className="text-[10px] text-muted-foreground leading-tight">Forecast runway</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Top Right - Scenarios */}
                    <div 
                      className="absolute top-8 right-12 animate-fade-in cursor-pointer group"
                      style={{ animationDelay: '0.2s' }}
                      onClick={() => {
                        setInputValue("Model hiring 2 engineers at $180k each and show impact on runway");
                        setTimeout(() => textareaRef.current?.focus(), 100);
                      }}
                    >
                      <div className="relative">
                        <div className="absolute -bottom-2 right-8 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[10px] border-t-cyan-500/20 group-hover:border-t-cyan-500/40 transition-colors" />
                        <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 backdrop-blur-sm border-2 border-cyan-500/20 rounded-2xl p-3 w-44 hover:border-cyan-500/40 hover:scale-105 transition-all hover:shadow-lg hover:shadow-cyan-500/20">
                          <div className="flex items-start gap-2">
                            <Zap className="h-4 w-4 text-cyan-500 flex-shrink-0 mt-0.5" />
                            <div className="min-w-0 flex-1">
                              <h3 className="font-semibold text-xs text-foreground mb-0.5 leading-tight">Scenarios</h3>
                              <p className="text-[10px] text-muted-foreground leading-tight">Model what-if</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Middle Left - Fundraising */}
                    <div 
                      className="absolute top-1/2 -translate-y-1/2 left-4 animate-fade-in cursor-pointer group"
                      style={{ animationDelay: '0.3s' }}
                      onClick={() => {
                        setInputValue("Show me investor KPIs and prepare a dashboard for due diligence");
                        setTimeout(() => textareaRef.current?.focus(), 100);
                      }}
                    >
                      <div className="relative">
                        <div className="absolute top-1/2 -translate-y-1/2 -right-2 w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-l-[10px] border-l-purple-500/20 group-hover:border-l-purple-500/40 transition-colors" />
                        <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 backdrop-blur-sm border-2 border-purple-500/20 rounded-2xl p-3 w-44 hover:border-purple-500/40 hover:scale-105 transition-all hover:shadow-lg hover:shadow-purple-500/20">
                          <div className="flex items-start gap-2">
                            <DollarSign className="h-4 w-4 text-purple-500 flex-shrink-0 mt-0.5" />
                            <div className="min-w-0 flex-1">
                              <h3 className="font-semibold text-xs text-foreground mb-0.5 leading-tight">Fundraising</h3>
                              <p className="text-[10px] text-muted-foreground leading-tight">Investor KPIs</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Middle Right - Cap Table */}
                    <div 
                      className="absolute top-1/2 -translate-y-1/2 right-4 animate-fade-in cursor-pointer group"
                      style={{ animationDelay: '0.4s' }}
                      onClick={() => {
                        setInputValue("Analyze cap table dilution for a Series A round");
                        setTimeout(() => textareaRef.current?.focus(), 100);
                      }}
                    >
                      <div className="relative">
                        <div className="absolute top-1/2 -translate-y-1/2 -left-2 w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-r-[10px] border-r-blue-500/20 group-hover:border-r-blue-500/40 transition-colors" />
                        <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 backdrop-blur-sm border-2 border-blue-500/20 rounded-2xl p-3 w-44 hover:border-blue-500/40 hover:scale-105 transition-all hover:shadow-lg hover:shadow-blue-500/20">
                          <div className="flex items-start gap-2">
                            <BarChart3 className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                            <div className="min-w-0 flex-1">
                              <h3 className="font-semibold text-xs text-foreground mb-0.5 leading-tight">Equity</h3>
                              <p className="text-[10px] text-muted-foreground leading-tight">Cap table</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Left - Risk Management */}
                    <div 
                      className="absolute bottom-8 left-12 animate-fade-in cursor-pointer group"
                      style={{ animationDelay: '0.5s' }}
                      onClick={() => {
                        setInputValue("Identify financial risks and provide early warnings");
                        setTimeout(() => textareaRef.current?.focus(), 100);
                      }}
                    >
                      <div className="relative">
                        <div className="absolute -top-2 left-8 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[10px] border-b-orange-500/20 group-hover:border-b-orange-500/40 transition-colors" />
                        <div className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 backdrop-blur-sm border-2 border-orange-500/20 rounded-2xl p-3 w-44 hover:border-orange-500/40 hover:scale-105 transition-all hover:shadow-lg hover:shadow-orange-500/20">
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 text-orange-500 flex-shrink-0 mt-0.5" />
                            <div className="min-w-0 flex-1">
                              <h3 className="font-semibold text-xs text-foreground mb-0.5 leading-tight">Risk</h3>
                              <p className="text-[10px] text-muted-foreground leading-tight">Monitor alerts</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Right - Strategic Insights */}
                    <div 
                      className="absolute bottom-8 right-12 animate-fade-in cursor-pointer group"
                      style={{ animationDelay: '0.6s' }}
                      onClick={() => {
                        setInputValue("Give me strategic insights to optimize spending and improve profitability");
                        setTimeout(() => textareaRef.current?.focus(), 100);
                      }}
                    >
                      <div className="relative">
                        <div className="absolute -top-2 right-8 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[10px] border-b-green-500/20 group-hover:border-b-green-500/40 transition-colors" />
                        <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 backdrop-blur-sm border-2 border-green-500/20 rounded-2xl p-3 w-44 hover:border-green-500/40 hover:scale-105 transition-all hover:shadow-lg hover:shadow-green-500/20">
                          <div className="flex items-start gap-2">
                            <Lightbulb className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                            <div className="min-w-0 flex-1">
                              <h3 className="font-semibold text-xs text-foreground mb-0.5 leading-tight">Strategy</h3>
                              <p className="text-[10px] text-muted-foreground leading-tight">Optimize & grow</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Messages with Mascot Integration */}
                {messages.map((message) => (
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
                            message.type === 'warning' ? 'alert' :
                            message.type === 'recommendation' ? 'success' :
                            'idle'
                          }
                        />
                      </div>
                    )}
                    <div
                      className={cn(
                        "max-w-[80%] rounded-2xl p-4 shadow-md",
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
                          <span className="font-bold text-destructive text-sm">Critical Alert</span>
                        </div>
                      )}
                      {message.type === "insight" && (
                        <div className="flex items-center gap-2 mb-2">
                          <BarChart3 className="h-4 w-4 text-blue-600" />
                          <span className="font-bold text-blue-600 text-sm">Financial Insight</span>
                        </div>
                      )}
                      {message.type === "recommendation" && (
                        <div className="flex items-center gap-2 mb-2">
                          <Lightbulb className="h-4 w-4 text-green-600" />
                          <span className="font-bold text-green-600 text-sm">CFO Recommendation</span>
                        </div>
                      )}
                      <p className="text-sm leading-relaxed whitespace-pre-line">{message.content}</p>
                      
                      {/* Rich Message Components */}
                      {message.role === "assistant" && message.type === "scenario_analysis" && message.data && (
                        <ScenarioComparisonCard
                          scenarioName={message.data.scenarioName}
                          before={message.data.before}
                          after={message.data.after}
                          changes={message.data.changes}
                          impact={message.data.impact}
                          severity={message.data.severity}
                          onViewDashboard={() => console.log("View dashboard")}
                          onSaveScenario={() => console.log("Save scenario")}
                          onModelAnother={() => setInputValue("Model another scenario")}
                        />
                      )}
                      
                      {message.role === "assistant" && message.type === "kpi_dashboard" && message.data && (
                        <KPIDashboardCard
                          kpis={message.data.kpis}
                          onViewFull={() => console.log("View full dashboard")}
                          onDownloadPDF={() => console.log("Download PDF")}
                          onShare={() => console.log("Share")}
                        />
                      )}
                      
                      {message.role === "assistant" && message.type === "cap_table" && message.data && (
                        <CapTableComparisonCard
                          scenarioName={message.data.scenarioName}
                          stakeholders={message.data.stakeholders}
                          summary={message.data.summary}
                          onViewFull={() => console.log("View full cap table")}
                          onExport={() => console.log("Export")}
                          onModelDifferent={() => setInputValue("Model different funding terms")}
                        />
                      )}
                      
                      {message.role === "assistant" && message.type === "alert" && message.data && (
                        <RiskAlertCard
                          severity={message.data.severity}
                          title={message.data.title}
                          message={message.data.message}
                          metrics={message.data.metrics}
                          actions={message.data.actions}
                        />
                      )}
                      
                      {message.role === "assistant" && message.type === "strategic_insight" && message.data && (
                        <StrategicInsightCard
                          title={message.data.title}
                          insight={message.data.insight}
                          dataPoints={message.data.dataPoints}
                          recommendations={message.data.recommendations}
                          impactScore={message.data.impactScore}
                          onImplement={() => console.log("Mark as implemented")}
                          onDismiss={() => console.log("Dismiss")}
                        />
                      )}
                      
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/30">
                        <span className="text-xs opacity-60">
                          {message.timestamp.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                        </span>
                        {message.role === "assistant" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onClick={() => handleTextToSpeech(message.content)}
                          >
                            {isSpeaking ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                          </Button>
                        )}
                      </div>
                    </div>
                    {message.role === "user" && (
                      <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-gradient-to-br from-secondary to-accent flex items-center justify-center shadow-lg">
                        <User className="h-5 w-5 text-white" />
                      </div>
                    )}
                  </div>
                ))}
                {isProcessing && (
                  <div className="flex gap-3 animate-slide-up">
                    <div className="flex-shrink-0">
                      <CFOMascot 
                        size="small" 
                        state="thinking"
                      />
                    </div>
                    <div className="bg-muted rounded-2xl p-4 shadow-md">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        <span className="text-sm text-muted-foreground">Analyzing your question...</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Floating Interactive Mascot - Always Visible During Chat */}
                {messages.length > 0 && (
                  <div className="fixed bottom-24 right-8 z-50 animate-float">
                    <div className="relative group">
                      {/* Mascot */}
                      <div className="transition-transform hover:scale-110 cursor-pointer">
                        <CFOMascot 
                          size="medium" 
                          state={
                            isListening ? 'listening' : 
                            isProcessing ? 'thinking' : 
                            isSpeaking ? 'speaking' :
                            messages[messages.length - 1]?.type === 'warning' ? 'alert' :
                            messages[messages.length - 1]?.type === 'recommendation' ? 'success' :
                            'idle'
                          }
                        />
                      </div>
                      
                      {/* Tooltip on Hover */}
                      <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <div className="bg-popover text-popover-foreground px-3 py-2 rounded-lg shadow-lg text-sm whitespace-nowrap border">
                          {isListening && "I'm listening..."}
                          {isProcessing && "Thinking..."}
                          {isSpeaking && "Speaking..."}
                          {!isListening && !isProcessing && !isSpeaking && "Ask me anything!"}
                        </div>
                      </div>
                      
                      {/* Status Indicator */}
                      <div className="absolute -top-1 -right-1">
                        <div className={cn(
                          "h-4 w-4 rounded-full border-2 border-background",
                          isListening && "bg-cyan-500 animate-pulse",
                          isProcessing && "bg-yellow-500 animate-pulse",
                          isSpeaking && "bg-purple-500 animate-pulse",
                          !isListening && !isProcessing && !isSpeaking && "bg-green-500"
                        )} />
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </CardContent>

              {/* Input Area */}
              <div className="border-t bg-muted/30 p-4">
                {isListening && (
                  <div className="mb-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2">
                    <Mic className="h-4 w-4 text-destructive animate-pulse" />
                    <span className="text-sm font-medium">Listening... Speak now</span>
                  </div>
                )}
                <div className="flex items-end gap-2">
                  <Button
                    size="icon"
                    variant={isListening ? "destructive" : "outline"}
                    onClick={isListening ? stopVoiceInput : startVoiceInput}
                    disabled={isProcessing}
                    className="flex-shrink-0 h-11 w-11"
                  >
                    {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                  </Button>

                  <Textarea
                    ref={textareaRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about burn rate, runway, expenses, or get financial advice..."
                    className="min-h-[44px] max-h-32 resize-none"
                    disabled={isProcessing || isListening}
                  />

                  {isProcessing ? (
                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={stopProcessing}
                      className="flex-shrink-0 h-11 w-11"
                    >
                      <StopCircle className="h-5 w-5" />
                    </Button>
                  ) : (
                    <Button
                      size="icon"
                      onClick={() => handleSendMessage()}
                      disabled={!inputValue.trim() || isListening}
                      className="flex-shrink-0 h-11 w-11 bg-gradient-to-r from-primary to-secondary"
                    >
                      <Send className="h-5 w-5" />
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  {isListening ? "Click mic to stop" : isProcessing ? "Click stop to cancel" : "Press Enter to send • Shift+Enter for new line"}
                </p>
              </div>
            </Card>
          </div>

          {/* Sidebar - 1 column */}
          <div className="space-y-4">
            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  Quick Questions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {quickActions.map((action, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start h-auto py-2 text-xs"
                    onClick={() => handleSendMessage(action.query)}
                    disabled={isProcessing || isListening}
                  >
                    <action.icon className="h-3 w-3 mr-2 flex-shrink-0" />
                    {action.label}
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Status */}
            <Card className="border-accent/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                  <span className="text-muted-foreground">Cash</span>
                  <span className="font-bold">$70,000</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                  <span className="text-muted-foreground">Burn</span>
                  <span className="font-bold">$82,000</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-destructive/10">
                  <span className="text-muted-foreground">Runway</span>
                  <span className="font-bold text-destructive">0.9 mo</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-green-500/10">
                  <span className="text-muted-foreground">Growth</span>
                  <span className="font-bold text-green-600">+25%</span>
                </div>
              </CardContent>
            </Card>

            {/* Features */}
            <Card className="bg-gradient-to-br from-primary/5 to-accent/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  AI Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div className="flex items-start gap-2">
                  <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-3 w-3 text-primary" />
                  </div>
                  <p className="text-muted-foreground">CFO-level financial analysis</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="h-5 w-5 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Mic className="h-3 w-3 text-accent" />
                  </div>
                  <p className="text-muted-foreground">Voice input & responses</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="h-5 w-5 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="h-3 w-3 text-secondary" />
                  </div>
                  <p className="text-muted-foreground">Real-time insights</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
