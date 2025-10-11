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

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  type?: "text" | "insight" | "warning" | "recommendation"
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
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content:
            "👋 Hello! I'm **Aura**, your AI Chief Financial Officer.\n\nI'm here to help you with:\n• Cash flow & runway analysis\n• Expense optimization strategies\n• Revenue growth planning\n• Fundraising recommendations\n• Strategic financial decisions\n\n**Ask me anything** about your finances!",
          timestamp: new Date(),
          type: "text",
        },
      ])
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
    { icon: TrendingUp, label: "Burn Rate", query: "What's my current burn rate and how can I optimize it?" },
    { icon: Calendar, label: "Runway", query: "How many months of runway do I have left?" },
    { icon: DollarSign, label: "Revenue", query: "Show me my revenue trends and growth opportunities" },
    { icon: BarChart3, label: "Expenses", query: "What are my biggest expenses and where can I cut costs?" },
    { icon: Lightbulb, label: "Fundraising", query: "When should I start fundraising and how much should I raise?" },
    { icon: Zap, label: "Quick Wins", query: "What are 3 quick wins to improve my financial position?" },
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

      // Determine message type based on content
      let messageType: "text" | "insight" | "warning" | "recommendation" = "text"
      const lowerContent = data.message.toLowerCase()
      
      if (lowerContent.includes("critical") || lowerContent.includes("warning") || lowerContent.includes("immediately") || lowerContent.includes("urgent")) {
        messageType = "warning"
      } else if (lowerContent.includes("recommend") || lowerContent.includes("suggest") || lowerContent.includes("should") || lowerContent.includes("consider")) {
        messageType = "recommendation"
      } else if (lowerContent.includes("insight") || lowerContent.includes("analysis") || lowerContent.includes("trend") || lowerContent.includes("based on")) {
        messageType = "insight"
      }

      const assistantMessage: Message = {
        id: Math.random().toString(36).substr(2, 9),
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
        type: messageType,
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
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary via-accent to-secondary flex items-center justify-center animate-pulse-glow">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
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
              <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-3 animate-slide-up",
                      message.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    {message.role === "assistant" && (
                      <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
                        <Bot className="h-5 w-5 text-white" />
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
                          <span className="font-bold text-destructive text-sm">⚠️ Critical Alert</span>
                        </div>
                      )}
                      {message.type === "insight" && (
                        <div className="flex items-center gap-2 mb-2">
                          <BarChart3 className="h-4 w-4 text-blue-600" />
                          <span className="font-bold text-blue-600 text-sm">📊 Financial Insight</span>
                        </div>
                      )}
                      {message.type === "recommendation" && (
                        <div className="flex items-center gap-2 mb-2">
                          <Lightbulb className="h-4 w-4 text-green-600" />
                          <span className="font-bold text-green-600 text-sm">💡 CFO Recommendation</span>
                        </div>
                      )}
                      <p className="text-sm leading-relaxed whitespace-pre-line">{message.content}</p>
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
                    <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
                      <Bot className="h-5 w-5 text-white animate-pulse" />
                    </div>
                    <div className="bg-muted rounded-2xl p-4 shadow-md">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        <span className="text-sm text-muted-foreground">Analyzing your question...</span>
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
                    <span className="text-sm font-medium">🎤 Listening... Speak now</span>
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
                  {isListening ? "🎤 Click mic to stop" : isProcessing ? "Click stop to cancel" : "Press Enter to send • Shift+Enter for new line"}
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
