"use client"

import { useState, useEffect, useRef } from "react"
import { LoadingScreen } from "@/components/loading-screen"
import { AuthNavbar } from "@/components/auth-navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Mic, MicOff, Sparkles, Volume2, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export default function VoiceAssistantPage() {
  const [loading, setLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sampleQuestions = [
    "What's my current burn rate?",
    "How many months of runway do I have?",
    "What are my biggest expenses?",
    "When should I start fundraising?",
    "Show me my revenue growth",
    "What's my cash balance?",
  ]

  const handleVoiceInput = () => {
    if (isListening) {
      setIsListening(false)
      // Simulate processing
      setIsProcessing(true)
      setTimeout(() => {
        const userMessage: Message = {
          id: Math.random().toString(36).substr(2, 9),
          role: "user",
          content: "What's my current burn rate?",
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, userMessage])

        setTimeout(() => {
          const assistantMessage: Message = {
            id: Math.random().toString(36).substr(2, 9),
            role: "assistant",
            content:
              "Your current monthly burn rate is $82,000. This is 9% higher than last month. Your main expense categories are: Payroll ($45,000), Marketing ($18,000), and Infrastructure ($8,000). Would you like me to suggest ways to optimize your burn rate?",
            timestamp: new Date(),
          }
          setMessages((prev) => [...prev, assistantMessage])
          setIsProcessing(false)
        }, 1500)
      }, 1000)
    } else {
      setIsListening(true)
    }
  }

  const handleQuestionClick = (question: string) => {
    const userMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      role: "user",
      content: question,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])

    setIsProcessing(true)
    setTimeout(() => {
      let response = ""
      if (question.includes("burn rate")) {
        response =
          "Your current monthly burn rate is $82,000. This is 9% higher than last month. Your main expense categories are: Payroll ($45,000), Marketing ($18,000), and Infrastructure ($8,000)."
      } else if (question.includes("runway")) {
        response =
          "You have approximately 0.9 months of runway remaining based on your current cash balance of $70,000 and monthly burn rate of $82,000. This is critical - I recommend starting fundraising immediately."
      } else if (question.includes("expenses")) {
        response =
          "Your biggest expenses are: 1) Payroll at $45,000/month (55% of burn), 2) Marketing at $18,000/month (22% of burn), and 3) Infrastructure at $8,000/month (10% of burn)."
      } else if (question.includes("fundraising")) {
        response =
          "Based on your current runway of 0.9 months, you should start fundraising immediately. Most fundraising rounds take 3-6 months to close. I recommend targeting a raise of $1.5-2M to give you 18-24 months of runway."
      } else if (question.includes("revenue")) {
        response =
          "Your monthly revenue is currently $35,000, up 25% from last month. You're showing strong growth momentum. At this rate, you could reach $50,000 MRR in 2-3 months."
      } else if (question.includes("cash balance")) {
        response =
          "Your current cash balance is $70,000, down 53% from last month. This is critically low given your burn rate. Consider reducing expenses or accelerating fundraising."
      }

      const assistantMessage: Message = {
        id: Math.random().toString(36).substr(2, 9),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])
      setIsProcessing(false)
    }, 1500)
  }

  if (loading) {
    return <LoadingScreen />
  }

  return (
    <div className="min-h-screen bg-background">
      <AuthNavbar />

      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Voice Assistant</h1>
          <p className="text-muted-foreground">Ask questions about your finances naturally</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Chat Interface */}
          <div className="lg:col-span-2">
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                      <Sparkles className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div>
                      <CardTitle>Aura Financial Assistant</CardTitle>
                      <CardDescription>Powered by AI</CardDescription>
                    </div>
                  </div>
                  <Badge className="gap-1 bg-accent text-accent-foreground">
                    <div className="h-2 w-2 rounded-full bg-accent-foreground animate-pulse" />
                    Online
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="flex-1 overflow-y-auto p-6">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-6">
                      <MessageSquare className="h-10 w-10 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Start a Conversation</h3>
                    <p className="text-muted-foreground max-w-md mb-6">
                      Ask me anything about your finances. I can help you understand your burn rate, runway, expenses,
                      and more.
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mic className="h-4 w-4" />
                      <span>Click the microphone to start speaking</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={cn("flex gap-3", message.role === "user" ? "justify-end" : "justify-start")}
                      >
                        {message.role === "assistant" && (
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                            <Sparkles className="h-4 w-4 text-primary-foreground" />
                          </div>
                        )}
                        <div
                          className={cn(
                            "max-w-[80%] rounded-lg p-4",
                            message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
                          )}
                        >
                          <p className="text-sm leading-relaxed">{message.content}</p>
                          <p className="text-xs opacity-70 mt-2">
                            {message.timestamp.toLocaleTimeString("en-US", {
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                        {message.role === "user" && (
                          <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-semibold text-secondary-foreground">You</span>
                          </div>
                        )}
                      </div>
                    ))}
                    {isProcessing && (
                      <div className="flex gap-3">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                          <Sparkles className="h-4 w-4 text-primary-foreground" />
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
                )}
              </CardContent>

              <div className="border-t border-border p-4">
                <div className="flex items-center justify-center gap-4">
                  <Button
                    size="lg"
                    onClick={handleVoiceInput}
                    className={cn(
                      "h-16 w-16 rounded-full transition-all",
                      isListening
                        ? "bg-destructive hover:bg-destructive/90 animate-pulse-glow"
                        : "bg-gradient-to-r from-primary to-secondary hover:opacity-90",
                    )}
                  >
                    {isListening ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                  </Button>
                  <div className="text-sm text-muted-foreground">
                    {isListening ? "Listening... Click to stop" : "Click to speak"}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Questions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Questions</CardTitle>
                <CardDescription>Try asking these common questions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {sampleQuestions.map((question, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    className="w-full justify-start text-left h-auto py-3 px-4 bg-transparent hover:bg-muted"
                    onClick={() => handleQuestionClick(question)}
                  >
                    <MessageSquare className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="text-sm">{question}</span>
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Features */}
            <Card className="border-2 border-accent/50 bg-gradient-to-br from-accent/10 to-transparent">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-5 w-5 text-accent" />
                  <CardTitle className="text-lg">AI Capabilities</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <Volume2 className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                  <p className="text-muted-foreground">Natural voice recognition and text-to-speech</p>
                </div>
                <div className="flex items-start gap-2">
                  <Sparkles className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                  <p className="text-muted-foreground">Real-time financial data analysis</p>
                </div>
                <div className="flex items-start gap-2">
                  <MessageSquare className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                  <p className="text-muted-foreground">Contextual understanding of follow-up questions</p>
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>• Speak clearly and naturally</p>
                <p>• Ask specific questions about your finances</p>
                <p>• Request comparisons and trends</p>
                <p>• Ask for recommendations and insights</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
