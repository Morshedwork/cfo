"use client"

import { useState, useRef, useEffect } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Mic, MicOff, Volume2, VolumeX, Sparkles, ArrowRight } from "lucide-react"
import { getVoiceService } from "@/lib/voice-assistant-service"
import { getVoiceService as getSimpleVoice } from "@/lib/simple-voice-service"
import { useAuth } from "@/lib/auth-context"
import { CFOMascot, type MascotState } from "@/components/cfo-mascot"
import { cn } from "@/lib/utils"

const SECTION_LABELS: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/runway": "Runway",
  "/bookkeeping": "Bookkeeping",
  "/sales": "Sales",
  "/data-management": "Data",
  "/ai-assistant": "AI Assistant",
  "/dashboard/scenarios": "Growth Scenarios",
  "/dashboard/market-intelligence": "Market Intelligence",
  "/settings": "Settings",
}

function getSectionLabel(pathname: string): string {
  if (!pathname) return "Dashboard"
  for (const [path, label] of Object.entries(SECTION_LABELS)) {
    if (pathname === path || (path !== "/dashboard" && pathname.startsWith(path))) return label
  }
  if (pathname.startsWith("/dashboard")) return "Dashboard"
  return "Dashboard"
}

interface ChatMessage {
  id: string
  type: "user" | "assistant"
  text: string
  timestamp: Date
}

const COMPETITOR_STORAGE_KEY = "aura_competitor_domains"

function getStoredCompetitors(): string[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(COMPETITOR_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function VoiceChatbotWidget() {
  const pathname = usePathname()
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [isSupported, setIsSupported] = useState(false)
  const [transcript, setTranscript] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const sectionLabel = getSectionLabel(pathname ?? "")

  const getMascotState = (): MascotState => {
    if (isListening) return "listening"
    if (isProcessing) return "thinking"
    if (isSpeaking) return "speaking"
    return "idle"
  }

  useEffect(() => {
    const voiceService = getVoiceService()
    setIsSupported(voiceService.isSupported())
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleStartListening = () => {
    getSimpleVoice().unlockAudio()
    getSimpleVoice().stopSpeaking()
    setIsSpeaking(false)

    const voiceService = getVoiceService()
    setIsListening(true)
    setTranscript("Listening...")

    voiceService.startListening(
      (finalTranscript) => {
        setIsListening(false)
        setTranscript("")
        const trimmed = finalTranscript.trim()
        const wordCount = trimmed.split(/\s+/).filter(Boolean).length
        if (trimmed.length > 0 && wordCount >= 1) {
          handleSendQuery(trimmed)
        }
      },
      (error) => {
        console.warn("Voice recognition issue:", error)
        setIsListening(false)
        setTranscript("")
      },
      (interim) => setTranscript(interim || "")
    )
  }

  const handleStopListening = () => {
    getVoiceService().stopListening()
    setIsListening(false)
    setTranscript("")
  }

  const handleStopAll = () => {
    getSimpleVoice().stopSpeaking()
    getVoiceService().stopListening()
    getVoiceService().stopSpeaking()
    setIsSpeaking(false)
    setIsListening(false)
    setTranscript("")
  }

  const handleSendQuery = async (query: string) => {
    if (!query.trim()) return

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      text: query,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMsg])
    setIsProcessing(true)
    getVoiceService().stopListening()

    try {
      const res = await fetch("/api/voice-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          userId: user?.id,
          currentSection: sectionLabel,
          recentMessages: messages.slice(-12).map((m) => ({
            role: m.type === "user" ? "user" : "assistant",
            text: m.text,
          })),
          competitors: getStoredCompetitors(),
          stream: true,
        }),
      })
      const contentType = res.headers.get("content-type") || ""
      const isStream = res.ok && contentType.includes("application/x-ndjson")

      if (isStream && res.body) {
        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ""
        let streamedText = ""
        const assistantId = (Date.now() + 1).toString()
        setMessages((prev) => [...prev, { id: assistantId, type: "assistant", text: "", timestamp: new Date() }])
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split("\n")
          buffer = lines.pop() ?? ""
          for (const line of lines) {
            if (!line.trim()) continue
            try {
              const payload = JSON.parse(line)
              if (payload.t === "chunk" && typeof payload.d === "string") {
                streamedText += payload.d
                setMessages((prev) => {
                  const next = [...prev]
                  const idx = next.findIndex((m) => m.id === assistantId)
                  if (idx !== -1) next[idx] = { ...next[idx], text: streamedText }
                  return next
                })
              } else if (payload.t === "done" && payload.success) {
                setMessages((prev) => {
                  const next = [...prev]
                  const idx = next.findIndex((m) => m.id === assistantId)
                  if (idx !== -1) next[idx] = { ...next[idx], text: payload.response ?? streamedText }
                  return next
                })
                if (payload.actions?.length) {
                  const navAction = payload.actions.find((a: { type: string }) => a.type === "navigate")
                  if (navAction?.path) setTimeout(() => { window.location.href = navAction.path }, 600)
                }
                if (voiceEnabled) {
                  getSimpleVoice().stopSpeaking()
                  setIsSpeaking(true)
                  getSimpleVoice().speak(payload.response ?? streamedText, () => setIsSpeaking(false), () => setIsSpeaking(false))
                }
              } else if (payload.t === "done" && !payload.success) {
                setMessages((prev) => {
                  const next = [...prev]
                  const idx = next.findIndex((m) => m.id === assistantId)
                  if (idx !== -1) next[idx] = { ...next[idx], text: payload.error || "Something went wrong." }
                  return next
                })
              }
            } catch { /* skip */ }
          }
        }
      } else {
        if (!contentType.includes("application/json")) {
          const text = await res.text()
          const errMsg = res.ok ? "Invalid response." : (text.slice(0, 150) || `Request failed (${res.status}).`)
          setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), type: "assistant", text: errMsg, timestamp: new Date() }])
          return
        }
        const data = await res.json()
        if (data.success) {
          setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), type: "assistant", text: data.response, timestamp: new Date() }])
          if (data.actions?.length) {
            const navAction = data.actions.find((a: { type: string }) => a.type === "navigate")
            if (navAction?.path) setTimeout(() => { window.location.href = navAction.path }, 600)
          }
          if (voiceEnabled) {
            getSimpleVoice().stopSpeaking()
            setIsSpeaking(true)
            getSimpleVoice().speak(data.response, () => setIsSpeaking(false), () => setIsSpeaking(false))
          }
        } else {
          throw new Error(data.error || "Request failed")
        }
      }
    } catch (err) {
      console.error("Voice chatbot error:", err)
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          type: "assistant",
          text: "I couldn't process that right now. Try again or open Voice AI for the full experience.",
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsProcessing(false)
      setTranscript("")
    }
  }

  return (
    <div className="fixed bottom-6 left-6 z-40">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            size="lg"
            className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all relative bg-gradient-to-br from-primary to-primary/80 hover:opacity-90"
            aria-label="Open voice chatbot"
          >
            <Mic className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-full sm:max-w-md flex flex-col p-0">
          <SheetHeader className="border-b px-4 py-3">
            <div className="flex items-center gap-3">
              <CFOMascot size="small" state={getMascotState()} />
              <div>
                <SheetTitle className="text-base flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Aura Voice
                </SheetTitle>
                <p className="text-xs text-muted-foreground">
                  Talk here in <strong>{sectionLabel}</strong>
                </p>
              </div>
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto min-h-0 flex flex-col">
            <div className="p-4 space-y-3 flex-1">
              {messages.length === 0 && (
                <div className="text-center py-6 text-sm text-muted-foreground">
                  <p className="font-medium text-foreground mb-1">Ask anything</p>
                  <p>e.g. &quot;What&apos;s my runway?&quot;, &quot;Show my top expenses&quot;, &quot;Export my data&quot;, &quot;Open bookkeeping&quot;</p>
                </div>
              )}
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex",
                    msg.type === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[85%] rounded-lg px-3 py-2 text-sm",
                      msg.type === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                  </div>
                </div>
              ))}
              {(transcript || isProcessing) && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg px-3 py-2 text-sm text-muted-foreground">
                    {isProcessing ? "Thinking…" : transcript || "Listening…"}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Button
                  size="icon"
                  variant={isListening ? "destructive" : "default"}
                  className="h-12 w-12 rounded-full flex-shrink-0"
                  onClick={
                    isListening
                      ? handleStopAll
                      : () => {
                          if (isSpeaking) {
                            getSimpleVoice().stopSpeaking()
                            setIsSpeaking(false)
                          }
                          handleStartListening()
                        }
                  }
                  disabled={!isSupported || isProcessing}
                >
                  {isListening ? (
                    <MicOff className="h-5 w-5" />
                  ) : (
                    <Mic className="h-5 w-5" />
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    if (isSpeaking) getSimpleVoice().stopSpeaking()
                    setVoiceEnabled((v) => !v)
                  }}
                >
                  {voiceEnabled ? (
                    <><Volume2 className="h-4 w-4 mr-1" /> Voice on</>
                  ) : (
                    <><VolumeX className="h-4 w-4 mr-1" /> Voice off</>
                  )}
                </Button>
              </div>
              <Link href="/voice-assistant" onClick={() => setOpen(false)}>
                <Button variant="ghost" size="sm" className="w-full gap-2 text-muted-foreground">
                  Full Voice AI experience
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
