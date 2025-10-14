"use client"

import { useState, useEffect, useRef } from "react"
import { LoadingScreen } from "@/components/loading-screen"
import { AuthNavbar } from "@/components/auth-navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Mic,
  MicOff,
  Sparkles,
  Volume2,
  Send,
  TrendingUp,
  DollarSign,
  Calendar,
  BarChart3,
  Lightbulb,
  AlertTriangle,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  type?: "text" | "insight" | "warning" | "recommendation"
}

export default function AIChat() {
  const [loading, setLoading] = useState(true)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content:
            "Hello! I'm your AI financial advisor powered by Gemini. I can help you understand your finances, forecast scenarios, and make strategic decisions. What would you like to know?",
          timestamp: new Date(),
          type: "text",
        },
      ])
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const quickActions = [
    { icon: TrendingUp, label: "Analyze burn rate", query: "What's my current burn rate and how can I optimize it?" },
    { icon: Calendar, label: "Runway forecast", query: "How many months of runway do I have left?" },
    { icon: DollarSign, label: "Revenue insights", query: "Show me my revenue trends and growth opportunities" },
    { icon: BarChart3, label: "Expense breakdown", query: "What are my biggest expenses and where can I cut costs?" },
    {
      icon: Lightbulb,
      label: "Fundraising advice",
      query: "When should I start fundraising and how much should I raise?",
    },
  ]

  const handleVoiceInput = () => {
    if (isListening) {
      setIsListening(false)
      setTimeout(() => {
        handleSendMessage("What's my current burn rate?")
      }, 500)
    } else {
      setIsListening(true)
    }
  }

  const handleTextToSpeech = (text: string) => {
    setIsSpeaking(true)
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.onend = () => setIsSpeaking(false)
      window.speechSynthesis.speak(utterance)
    } else {
      setTimeout(() => setIsSpeaking(false), 3000)
    }
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

    try {
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
      })

      const data = await response.json()

      // Determine message type based on content
      let messageType: "text" | "insight" | "warning" | "recommendation" = "text"
      if (data.message.toLowerCase().includes("critical") || data.message.toLowerCase().includes("warning")) {
        messageType = "warning"
      } else if (data.insights && data.insights.length > 0) {
        messageType = "insight"
      } else if (data.recommendations && data.recommendations.length > 0) {
        messageType = "recommendation"
      }

      const assistantMessage: Message = {
        id: Math.random().toString(36).substr(2, 9),
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
        type: messageType,
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("[v0] Chat error:", error)
      const errorMessage: Message = {
        id: Math.random().toString(36).substr(2, 9),
        role: "assistant",
        content: "I apologize, but I'm having trouble processing your request. Please try again.",
        timestamp: new Date(),
        type: "text",
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsProcessing(false)
    }
  }

  const handleKeyPress = (e: any) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (loading) {
    return <LoadingScreen />
  }

  return (
    <div className="min-h-screen bg-background">
      <AuthNavbar />

      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 animate-text-shimmer">AI Financial Advisor</h1>
          <p className="text-muted-foreground">Get intelligent insights powered by Gemini AI</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Chat Interface */}
          <div className="lg:col-span-2">
            <Card className="h-[700px] flex flex-col hover-glow">
              <CardHeader className="border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center animate-pulse-glow">
                      <Sparkles className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div>
                      <CardTitle>Aura AI Advisor</CardTitle>
                      <CardDescription>Powered by Gemini AI</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="gap-1 bg-accent text-accent-foreground">
                      <div className="h-2 w-2 rounded-full bg-accent-foreground animate-pulse" />
                      Online
                    </Badge>
                    {isSpeaking && (
                      <Badge variant="secondary" className="gap-1 animate-pulse">
                        <Volume2 className="h-3 w-3" />
                        Speaking
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex-1 overflow-y-auto p-6">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex gap-3 animate-slide-up",
                        message.role === "user" ? "justify-end" : "justify-start",
                      )}
                    >
                      {message.role === "assistant" && (
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                          <Sparkles className="h-4 w-4 text-primary-foreground" />
                        </div>
                      )}
                      <div
                        className={cn(
                          "max-w-[85%] rounded-lg p-4",
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : message.type === "warning"
                              ? "bg-destructive/10 text-foreground border-2 border-destructive/50"
                              : message.type === "insight"
                                ? "bg-accent/10 text-foreground border-2 border-accent/50"
                                : message.type === "recommendation"
                                  ? "bg-success/10 text-foreground border-2 border-success/50"
                                  : "bg-muted text-foreground",
                        )}
                      >
                        {message.type === "warning" && (
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="h-4 w-4 text-destructive" />
                            <span className="font-semibold text-destructive">Critical Alert</span>
                          </div>
                        )}
                        {message.type === "insight" && (
                          <div className="flex items-center gap-2 mb-2">
                            <BarChart3 className="h-4 w-4 text-accent" />
                            <span className="font-semibold text-accent">Financial Insight</span>
                          </div>
                        )}
                        {message.type === "recommendation" && (
                          <div className="flex items-center gap-2 mb-2">
                            <Lightbulb className="h-4 w-4 text-success" />
                            <span className="font-semibold text-success">Recommendation</span>
                          </div>
                        )}
                        <p className="text-sm leading-relaxed whitespace-pre-line">{message.content}</p>
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                          <p className="text-xs opacity-70">
                            {message.timestamp.toLocaleTimeString("en-US", {
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </p>
                          {message.role === "assistant" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-xs"
                              onClick={() => handleTextToSpeech(message.content)}
                            >
                              <Volume2 className="h-3 w-3 mr-1" />
                              Listen
                            </Button>
                          )}
                        </div>
                      </div>
                      {message.role === "user" && (
                        <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-semibold text-secondary-foreground">You</span>
                        </div>
                      )}
                    </div>
                  ))}
                  {isProcessing && (
                    <div className="flex gap-3 animate-slide-up">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                        <Sparkles className="h-4 w-4 text-primary-foreground animate-pulse" />
                      </div>
                      <div className="bg-muted rounded-lg p-4">
                        <div className="flex gap-1">
                          <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" />
                          <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:0.2s]" />
                          <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:0.4s]" />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </CardContent>

              <div className="border-t border-border p-4">
                <div className="flex items-end gap-3">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={handleVoiceInput}
                    className={cn(
                      "flex-shrink-0 transition-all",
                      isListening && "bg-destructive text-destructive-foreground animate-pulse-glow",
                    )}
                  >
                    {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </Button>
                  <Textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything about your finances..."
                    className="min-h-[60px] max-h-[120px] resize-none"
                  />
                  <Button
                    size="icon"
                    onClick={() => handleSendMessage()}
                    disabled={!inputValue.trim() || isProcessing}
                    className="flex-shrink-0 bg-gradient-to-r from-primary to-secondary animate-gradient-shift"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {isListening ? "Listening... Click mic to stop" : "Press Enter to send, Shift+Enter for new line"}
                </p>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="hover-glow">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
                <CardDescription>Common financial questions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {quickActions.map((action, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    className="w-full justify-start text-left h-auto py-3 px-4 bg-transparent hover:bg-muted hover:border-primary/50 transition-all hover-lift"
                    onClick={() => handleSendMessage(action.query)}
                  >
                    <action.icon className="h-4 w-4 mr-3 flex-shrink-0 text-primary" />
                    <span className="text-sm">{action.label}</span>
                  </Button>
                ))}
              </CardContent>
            </Card>

            <Card className="border-2 border-accent/50 bg-gradient-to-br from-accent/10 to-transparent hover-glow">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-5 w-5 text-accent" />
                  <CardTitle className="text-lg">AI Capabilities</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <Volume2 className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                  <p className="text-muted-foreground">Voice input and text-to-speech responses</p>
                </div>
                <div className="flex items-start gap-2">
                  <Sparkles className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                  <p className="text-muted-foreground">Real-time financial data analysis with Gemini</p>
                </div>
                <div className="flex items-start gap-2">
                  <TrendingUp className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                  <p className="text-muted-foreground">Predictive insights and recommendations</p>
                </div>
              </CardContent>
            </Card>

            <Card className="hover-glow">
              <CardHeader>
                <CardTitle className="text-lg">Current Context</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                  <span className="text-muted-foreground">Cash Balance</span>
                  <span className="font-semibold">$70,000</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                  <span className="text-muted-foreground">Monthly Burn</span>
                  <span className="font-semibold">$82,000</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                  <span className="text-muted-foreground">Runway</span>
                  <span className="font-semibold text-destructive">0.9 months</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                  <span className="text-muted-foreground">MRR</span>
                  <span className="font-semibold text-success">$35,000</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
