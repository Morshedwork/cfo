"use client"

import { useState, useEffect, useRef } from "react"
import { LoadingScreen } from "@/components/loading-screen"
import { AuthNavbar } from "@/components/auth-navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Mic, MicOff, Sparkles, Volume2, VolumeX, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"
import { getVoiceService } from "@/lib/voice-assistant-service"
import { getVoiceService as getSimpleVoice } from "@/lib/simple-voice-service"
import { useAuth } from "@/lib/auth-context"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  insights?: string[]
  recommendations?: string[]
}

const STORAGE_KEY = "aura_competitor_domains"

function getStoredCompetitors(): string[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export default function VoicePage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [isSupported, setIsSupported] = useState(false)
  const [demoMode, setDemoMode] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const voiceService = getVoiceService()
    setIsSupported(voiceService.isSupported())
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

  /** Send query to AI and optionally speak the response. */
  const sendQuery = async (query: string) => {
    if (!query.trim()) return

    const userMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      role: "user",
      content: query,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    setIsProcessing(true)

    try {
      const recentMessages = messages.map((m) => ({
        role: m.role,
        text: m.content,
      }))
      const response = await fetch("/api/voice-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: query.trim(),
          userId: user?.id,
          recentMessages: recentMessages.slice(-16),
          competitors: getStoredCompetitors(),
        }),
      })
      const data = await response.json()

      if (data.success && data.response) {
        if (typeof data.demoMode === "boolean") setDemoMode(data.demoMode)
        const assistantMessage: Message = {
          id: Math.random().toString(36).substr(2, 9),
          role: "assistant",
          content: data.response,
          timestamp: new Date(),
          insights: data.insights,
          recommendations: data.recommendations,
        }
        setMessages((prev) => [...prev, assistantMessage])

        if (voiceEnabled) {
          getSimpleVoice().unlockAudio()
          getSimpleVoice().stopSpeaking()
          setIsSpeaking(true)
          getSimpleVoice().speak(
            data.response,
            () => setIsSpeaking(false),
            () => setIsSpeaking(false)
          )
        }
      } else {
        const errMsg = data.error || "Something went wrong. Please try again."
        setMessages((prev) => [
          ...prev,
          {
            id: Math.random().toString(36).substr(2, 9),
            role: "assistant",
            content: errMsg,
            timestamp: new Date(),
          },
        ])
      }
    } catch (e) {
      console.error("Voice API error:", e)
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).substr(2, 9),
          role: "assistant",
          content: "I couldn't reach the AI right now. Please try again.",
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsProcessing(false)
    }
  }

  const handleVoiceInput = () => {
    if (isListening) {
      getVoiceService().stopListening()
      setIsListening(false)
      return
    }
    getSimpleVoice().unlockAudio()
    getSimpleVoice().stopSpeaking()
    setIsSpeaking(false)
    setIsListening(true)
    getVoiceService().startListening(
      (transcript) => {
        setIsListening(false)
        const t = transcript.trim()
        if (t.length >= 2) sendQuery(t)
      },
      () => setIsListening(false),
      () => {}
    )
  }

  const handleQuestionClick = (question: string) => {
    sendQuery(question)
  }

  const toggleVoice = () => {
    if (isSpeaking) {
      getSimpleVoice().stopSpeaking()
      setIsSpeaking(false)
    }
    if (!voiceEnabled) getSimpleVoice().unlockAudio()
    setVoiceEnabled(!voiceEnabled)
  }

  if (loading) {
    return <LoadingScreen />
  }

  return (
    <div className="min-h-screen bg-background">
      <AuthNavbar />

      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Voice Assistant</h1>
          <p className="text-muted-foreground">Real-time AI conversation — ask about runway, burn, revenue, and more.</p>
          {demoMode && (
            <p className="mt-2 text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-3 py-2 rounded-md border border-amber-200 dark:border-amber-800">
              Demo mode: set OPENAI_API_KEY for full AI responses.
            </p>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                      <Sparkles className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div>
                      <CardTitle>Aura Growth Manager</CardTitle>
                      <CardDescription>Strategic financial + market intelligence — real-time answers</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={toggleVoice} className="gap-1.5">
                      {voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                      {voiceEnabled ? "Voice On" : "Voice Off"}
                    </Button>
                    <Badge className="gap-1 bg-accent text-accent-foreground">
                      <div className="h-2 w-2 rounded-full bg-accent-foreground animate-pulse" />
                      AI Online
                    </Badge>
                  </div>
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
                      Ask anything about your finances. Answers are generated by AI from your real data and conversation — no fixed templates.
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mic className="h-4 w-4" />
                      <span>Click the mic to speak, or choose a question below</span>
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
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                          {message.insights && message.insights.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-border/50 space-y-1">
                              <p className="text-xs font-semibold opacity-80">Insights</p>
                              {message.insights.map((s, i) => (
                                <p key={i} className="text-xs opacity-90">{s}</p>
                              ))}
                            </div>
                          )}
                          <p className="text-xs opacity-70 mt-2">
                            {message.timestamp.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
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
                          <span className="text-xs text-muted-foreground ml-2">AI thinking…</span>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </CardContent>

              <div className="border-t border-border p-4">
                <div className="flex items-center justify-center gap-4 flex-wrap">
                  <Button
                    size="lg"
                    onClick={handleVoiceInput}
                    disabled={!isSupported || isProcessing}
                    className={cn(
                      "h-16 w-16 rounded-full transition-all",
                      isListening
                        ? "bg-destructive hover:bg-destructive/90 animate-pulse"
                        : "bg-gradient-to-r from-primary to-secondary hover:opacity-90",
                    )}
                  >
                    {isListening ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                  </Button>
                  <div className="text-sm text-muted-foreground">
                    {isListening ? "Listening… Click to stop" : "Click to speak (AI will answer)"}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Questions</CardTitle>
                <CardDescription>Each answer is generated by AI from your data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {sampleQuestions.map((question, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    className="w-full justify-start text-left h-auto py-3 px-4 bg-transparent hover:bg-muted"
                    onClick={() => handleQuestionClick(question)}
                    disabled={isProcessing}
                  >
                    <MessageSquare className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="text-sm">{question}</span>
                  </Button>
                ))}
              </CardContent>
            </Card>

            <Card className="border-2 border-accent/50 bg-gradient-to-br from-accent/10 to-transparent">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-5 w-5 text-accent" />
                  <CardTitle className="text-lg">AI Voice</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <Volume2 className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                  <p className="text-muted-foreground">Responses are generated by AI and spoken in real time — no templates.</p>
                </div>
                <div className="flex items-start gap-2">
                  <Sparkles className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                  <p className="text-muted-foreground">Uses your company and transaction data when available.</p>
                </div>
                <div className="flex items-start gap-2">
                  <MessageSquare className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                  <p className="text-muted-foreground">Remembers the last 16 turns for follow-ups like &quot;why?&quot; or &quot;explain that&quot;.</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>• Speak or click a question — AI answers from real-time context</p>
                <p>• Turn Voice On to hear the reply spoken</p>
                <p>• For full hands-free flow, use the Voice AI page from the sidebar</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
