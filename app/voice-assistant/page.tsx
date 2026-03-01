"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  TrendingUp, 
  DollarSign,
  AlertCircle,
  Lightbulb,
  Play,
  Pause,
  MessageSquare,
  BarChart3
} from "lucide-react"
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  CartesianGrid,
} from "recharts"
import { getVoiceService } from "@/lib/voice-assistant-service"
import { getVoiceService as getSimpleVoice, getTTSProvider } from "@/lib/simple-voice-service"
import { useAuth } from "@/lib/auth-context"
import { CFOMascot, MascotState } from "@/components/cfo-mascot"
// Agent actions returned by the API (must match backend / aura-agent)
type AgentAction =
  | { type: "navigate"; path: string }
  | { type: "open_bookkeeping" }
  | { type: "open_runway" }
  | { type: "open_dashboard" }
  | { type: "open_sales" }
  | { type: "open_data" }
  | { type: "open_ai_assistant" }
  | { type: "open_settings" }
  | { type: "open_scenarios" }
  | { type: "open_market_intelligence" }
  | { type: "add_expense"; description?: string; amount?: number; category?: string }
  | { type: "add_revenue"; description?: string; amount?: number; category?: string }
  | { type: "create_transaction"; kind: "expense" | "revenue"; amount: number; description?: string; category?: string }
  | { type: "run_report"; report?: "runway" | "burn" | "revenue" | "week" }
  | { type: "summarize"; period?: "week" | "month" }
  | { type: "run_market_intel"; task: string }

interface Message {
  id: string
  type: 'user' | 'assistant'
  text: string
  timestamp: Date
  insights?: string[]
  recommendations?: string[]
  data?: any
  actions?: AgentAction[]
}

interface FinancialData {
  isUsingRealData?: boolean
  hasCompanyData?: boolean
  hasTransactionData?: boolean
  companyName?: string
  [key: string]: any
}

const NAV_PATHS: Record<string, string> = {
  open_dashboard: "/dashboard",
  open_runway: "/runway",
  open_bookkeeping: "/bookkeeping",
  open_sales: "/sales",
  open_data: "/data-management",
  open_ai_assistant: "/ai-assistant",
  open_settings: "/settings",
  open_scenarios: "/dashboard/scenarios",
  open_market_intelligence: "/dashboard/market-intelligence",
}

// Sample trend data for visuals (matches dashboard context; replace with API when available)
const VOICE_CASH_TREND = [
  { month: "Jan", cash: 450 },
  { month: "Feb", cash: 375 },
  { month: "Mar", cash: 297 },
  { month: "Apr", cash: 225 },
  { month: "May", cash: 150 },
  { month: "Jun", cash: 70 },
]
const VOICE_REVENUE_TREND = [
  { month: "Jan", revenue: 12 },
  { month: "Feb", revenue: 15 },
  { month: "Mar", revenue: 18 },
  { month: "Apr", revenue: 22 },
  { month: "May", revenue: 28 },
  { month: "Jun", revenue: 35 },
]

const COMPETITOR_STORAGE_KEY = "aura_competitor_domains"

export type ChartRequest = "cash" | "revenue"

/** Infer which trend chart(s) to show from user query and/or agent actions */
function chartsToShowFromRequest(query: string, actions?: AgentAction[]): ChartRequest[] {
  const q = query.trim().toLowerCase()
  const out: Set<ChartRequest> = new Set()
  // From query: "show me cash balance", "cash balance", "show revenue", etc.
  if (/\b(show\s+me\s+)?(my\s+)?(cash\s+balance|cash|runway|burn\s+rate)\b/i.test(q) || /\bcash\s+(balance|position)\b/i.test(q)) out.add("cash")
  if (/\b(show\s+me\s+)?(my\s+)?(revenue|revenues?)\b/i.test(q) || /\brevenue\s+(trend|chart|graph)\b/i.test(q)) out.add("revenue")
  // From actions: run_report revenue → revenue chart; runway/burn → cash chart
  for (const a of actions ?? []) {
    if (a.type === "run_report") {
      if (a.report === "revenue") out.add("revenue")
      if (a.report === "runway" || a.report === "burn") out.add("cash")
    }
  }
  return Array.from(out)
}

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

export default function VoiceAssistantPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [isSupported, setIsSupported] = useState(false)
  const [currentTranscript, setCurrentTranscript] = useState("")
  const [interimTranscript, setInterimTranscript] = useState("")
  const [showChat, setShowChat] = useState(false)
  const [continuousMode, setContinuousMode] = useState(false)
  const [autoModeEnabled, setAutoModeEnabled] = useState(true) // Auto-detect conversation intent
  const [financialDataStatus, setFinancialDataStatus] = useState<FinancialData | null>(null) // Track data source
  const [demoMode, setDemoMode] = useState(false) // True when no API key — show hint to enable real AI
  const [clickToHearHint, setClickToHearHint] = useState(false) // Show when auto-play was blocked
  const [requestedCharts, setRequestedCharts] = useState<ChartRequest[]>([]) // Charts to show on request (e.g. "show me cash balance")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const shouldContinueListeningRef = useRef(false)
  const conversationCountRef = useRef(0)
  const lastInteractionTimeRef = useRef(Date.now())
  const welcomePlayedRef = useRef(false)
  const welcomePendingGestureRef = useRef(false) // true when load was blocked; play on first click

  // Get mascot state based on current activity
  const getMascotState = (): MascotState => {
    if (isListening) return 'listening'
    if (isProcessing) return 'thinking'
    if (isSpeaking) return 'speaking'
    return 'idle'
  }

  const WELCOME_VOICE_TEXT = "I'm Aura, your Strategic Financial Growth Manager. We can have a real-time conversation — I have full context of your business. Ask about runway, burn, revenue, investor summaries, capital efficiency, or say open dashboard, scenarios, market intelligence. Just talk when you're ready."

  const playWelcomeVoice = (onDone?: () => void) => {
    welcomePlayedRef.current = true
    welcomePendingGestureRef.current = false
    setClickToHearHint(false)
    setIsSpeaking(true)
    getSimpleVoice().speak(
      WELCOME_VOICE_TEXT,
      () => {
        setIsSpeaking(false)
        onDone?.()
      },
      () => {
        setIsSpeaking(false)
        onDone?.()
      }
    )
  }

  useEffect(() => {
    const voiceService = getVoiceService()
    setIsSupported(voiceService.isSupported())

    setMessages([{
      id: '1',
      type: 'assistant',
      text: "I'm Aura, your Strategic Financial Growth Manager. I combine internal finance with market intelligence. Ask me anything: runway, burn, revenue, investor summaries, growth scenarios, capital efficiency, or say \"open dashboard\", \"scenarios\", \"market intelligence\". You can follow up with \"why?\", \"explain that\", or \"what about marketing?\". Click the mic and talk.",
      timestamp: new Date(),
    }])

    // Welcome with voice on load; if browser blocks (no user gesture), play on first click/key
    if (!voiceService.isSupported()) return
    const tryWelcomeOnLoad = () => {
      setIsSpeaking(true)
      getSimpleVoice().speak(
        WELCOME_VOICE_TEXT,
        () => {
          setIsSpeaking(false)
          welcomePlayedRef.current = true
        },
        (err) => {
          setIsSpeaking(false)
          const needsGesture = err?.message?.toLowerCase().includes("interact") ?? false
          if (needsGesture) {
            welcomePendingGestureRef.current = true
            setClickToHearHint(true)
            const onFirstInteraction = () => {
              if (!welcomePendingGestureRef.current) return
              document.removeEventListener("click", onFirstInteraction)
              document.removeEventListener("keydown", onFirstKey)
              playWelcomeVoice()
            }
            const onFirstKey = (e: KeyboardEvent) => {
              if (!welcomePendingGestureRef.current) return
              if (e.key === "Tab" || e.key === "Shift") return
              document.removeEventListener("click", onFirstInteraction)
              document.removeEventListener("keydown", onFirstKey)
              playWelcomeVoice()
            }
            document.addEventListener("click", onFirstInteraction, { once: true })
            document.addEventListener("keydown", onFirstKey, { once: true })
          }
        }
      )
    }
    const t = setTimeout(tryWelcomeOnLoad, 400)
    return () => clearTimeout(t)
  }, [])

  // Effect to handle continuous listening mode
  useEffect(() => {
    if (continuousMode && !isListening && !isSpeaking && !isProcessing && shouldContinueListeningRef.current) {
      // Automatically start listening again after a brief pause
      const timer = setTimeout(() => {
        if (continuousMode && !isListening && !isSpeaking && !isProcessing) {
          handleStartListening()
        }
      }, 1000) // 1 second pause between exchanges

      return () => clearTimeout(timer)
    }
  }, [continuousMode, isListening, isSpeaking, isProcessing])

  // Auto-detect conversation intent and manage continuous mode
  useEffect(() => {
    if (!autoModeEnabled) return

    const timeSinceLastInteraction = Date.now() - lastInteractionTimeRef.current

    // Auto-enable continuous mode after 2 questions in a row
    if (!continuousMode && conversationCountRef.current >= 2 && timeSinceLastInteraction < 30000) {
      console.log('[Auto] Enabling continuous mode - conversation detected')
      setContinuousMode(true)
      shouldContinueListeningRef.current = true
      
      // Announce it briefly with browser voice
      const simpleVoice = getSimpleVoice()
      if (voiceEnabled && !isSpeaking) {
        // Stop any previous speech first
        simpleVoice.stopSpeaking()
        
        setIsSpeaking(true)
        simpleVoice.speak("Alright, I'll keep listening. Just talk when you're ready.", () => {
          setIsSpeaking(false)
        })
      }
    }

    // Auto-disable continuous mode after 45 seconds of inactivity
    if (continuousMode && timeSinceLastInteraction > 45000) {
      console.log('[Auto] Disabling continuous mode - conversation ended')
      setContinuousMode(false)
      shouldContinueListeningRef.current = false
      handleStopListening()
    }
  }, [messages, autoModeEnabled, continuousMode, voiceEnabled, isSpeaking])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleStartListening = () => {
    // Unlock audio on first user gesture so TTS is allowed when the response comes back
    getSimpleVoice().unlockAudio()
    // Stop-before-listen: stop any ongoing TTS first (barge-in / interruption)
    const simpleVoice = getSimpleVoice()
    simpleVoice.stopSpeaking()
    setIsSpeaking(false)

    const voiceService = getVoiceService()
    
    setIsListening(true)
    setCurrentTranscript("Listening...")
    shouldContinueListeningRef.current = true

    voiceService.startListening(
      (transcript) => {
        setInterimTranscript("")
        setCurrentTranscript(transcript)
        setIsListening(false)

        const trimmed = transcript.trim().toLowerCase()
        const stopPhrases = [
          "stop", "wait", "cancel", "never mind", "nevermind", "hold on",
          "stop listening", "stop speaking", "that's it", "that is it", "enough", "pause",
        ]
        const isStopCommand = stopPhrases.some((p) => trimmed === p || trimmed.startsWith(p + " ") || trimmed.endsWith(" " + p))

        if (isStopCommand) {
          handleStopListening()
          if (voiceEnabled) {
            const simpleVoice = getSimpleVoice()
            simpleVoice.speak("Stopped.", () => {}, () => {})
          }
          setCurrentTranscript("")
          return
        }
        
        // Only process if there's actual content (minimum 2 words for better detection)
        const wordCount = trimmed.split(/\s+/).filter(Boolean).length
        if (transcript.trim().length > 0 && wordCount >= 2) {
          handleVoiceQuery(transcript)
        } else if (transcript.trim().length > 0 && wordCount === 1) {
          console.warn('[Voice] Single word detected, might be noise - ignoring')
          if (continuousMode) {
            setTimeout(() => {
              if (continuousMode) {
                handleStartListening()
              }
            }, 500)
          }
        } else if (continuousMode) {
          // If continuous mode and no speech detected, try again
          setTimeout(() => {
            if (continuousMode) {
              handleStartListening()
            }
          }, 500)
        }
      },
      (error) => {
        console.warn("Voice recognition issue:", error)
        setIsListening(false)
        setCurrentTranscript("")
        setInterimTranscript("")
        
        // In continuous mode, retry after error (except for critical errors)
        if (continuousMode && error !== 'no-speech' && error !== 'not-allowed' && error !== 'low-confidence') {
          setTimeout(() => {
            if (continuousMode && shouldContinueListeningRef.current) {
              handleStartListening()
            }
          }, 2000)
        } else if (continuousMode && (error === 'no-speech' || error === 'low-confidence')) {
          // Quickly retry for no-speech or low-confidence errors
          setTimeout(() => {
            if (continuousMode && shouldContinueListeningRef.current) {
              handleStartListening()
            }
          }, 500)
        }
      },
      (interim) => {
        setInterimTranscript(interim || "")
      }
    )
  }

  const handleStopListening = () => {
    const voiceService = getVoiceService()
    voiceService.stopListening()
    setIsListening(false)
    setCurrentTranscript("")
    setInterimTranscript("")
    shouldContinueListeningRef.current = false
  }

  // Execute agent actions (navigate, run report, open bookkeeping for add expense/revenue, etc.)
  const executeAgentActions = (actions: AgentAction[] | undefined) => {
    if (!actions?.length) return
    for (const action of actions) {
      if (action.type === "navigate") {
        router.push(action.path)
        continue
      }
      if (action.type === "run_report") {
        const path = action.report === "runway" ? "/runway" : "/dashboard"
        router.push(path)
        continue
      }
      const path = NAV_PATHS[action.type as keyof typeof NAV_PATHS]
      if (path) {
        router.push(path)
        continue
      }
      if (action.type === "add_expense") {
        router.push("/bookkeeping?add=expense" + (action.amount != null ? `&amount=${action.amount}` : ""))
        continue
      }
      if (action.type === "add_revenue") {
        router.push("/bookkeeping?add=revenue" + (action.amount != null ? `&amount=${action.amount}` : ""))
        continue
      }
      if (action.type === "run_market_intel") {
        router.push("/dashboard/market-intelligence")
      }
      // create_transaction is handled server-side; no client nav needed
    }
  }

  const toggleContinuousMode = () => {
    const newMode = !continuousMode
    setContinuousMode(newMode)
    shouldContinueListeningRef.current = newMode
    
    // Disable auto mode when manually toggling
    if (!newMode) {
      conversationCountRef.current = 0
    }
    
    if (newMode) {
      // Start continuous listening
      handleStartListening()
      
      // Announce continuous mode activated with browser voice
      const simpleVoice = getSimpleVoice()
      if (voiceEnabled) {
        // Stop any previous speech first
        simpleVoice.stopSpeaking()
        
        setIsSpeaking(true)
        simpleVoice.speak("Got it, I'll keep listening.", () => {
          setIsSpeaking(false)
        })
      }
    } else {
      // Stop continuous listening
      handleStopListening()
      
      // Announce continuous mode deactivated with browser voice
      const simpleVoice = getSimpleVoice()
      if (voiceEnabled) {
        // Stop any previous speech first
        simpleVoice.stopSpeaking()
        
        setIsSpeaking(true)
        simpleVoice.speak("Paused. Click the mic when you're ready.", () => {
          setIsSpeaking(false)
        })
      }
    }
  }

  const toggleAutoMode = () => {
    const newMode = !autoModeEnabled
    setAutoModeEnabled(newMode)
    
    const simpleVoice = getSimpleVoice()
    if (voiceEnabled && !isSpeaking) {
      // Stop any previous speech first
      simpleVoice.stopSpeaking()
      
      setIsSpeaking(true)
      if (newMode) {
        simpleVoice.speak("Auto mode on. I'll figure out when to keep listening.", () => {
          setIsSpeaking(false)
        })
      } else {
        simpleVoice.speak("Auto mode off. You're in control.", () => {
          setIsSpeaking(false)
        })
      }
    }
  }

  const handleVoiceQuery = async (query: string) => {
    if (!query.trim()) return

    // Track conversation
    conversationCountRef.current += 1
    lastInteractionTimeRef.current = Date.now()

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      text: query,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMessage])
    setIsProcessing(true)

    let slowResponseTimeout: ReturnType<typeof setTimeout> | null = null
    if (voiceEnabled) {
      slowResponseTimeout = setTimeout(() => {
        getSimpleVoice().speak("One moment.", () => {}, () => {})
      }, 1800)
    }

    try {
      // Call API (server uses last 10 turns; sending 10 reduces payload)
      const response = await fetch('/api/voice-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          userId: user?.id,
          recentMessages: messages.slice(0, -1).slice(-6).map((m) => ({
            role: m.type === "user" ? "user" : "assistant",
            text: m.text,
          })),
          competitors: getStoredCompetitors(),
        }),
      })

      const data = await response.json()

      if (data.success) {
        if (data.data) {
          setFinancialDataStatus(data.data)
        }
        if (typeof data.demoMode === "boolean") {
          setDemoMode(data.demoMode)
        }
        
        // Add assistant message (include actions for UI if needed)
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          text: data.response,
          timestamp: new Date(),
          insights: data.insights,
          recommendations: data.recommendations,
          data: data.data,
          actions: data.actions,
        }
        setMessages(prev => [...prev, assistantMessage])

        // Show trend chart(s) only when user asked for them (e.g. "show me cash balance", "show me revenue")
        setRequestedCharts(chartsToShowFromRequest(query, data.actions))

        // Execute agentic actions (navigate, open bookkeeping, etc.) after a short delay so user hears the reply first
        if (data.actions?.length) {
          setTimeout(() => executeAgentActions(data.actions), 800)
        }

        // Speak response with browser voice
        if (voiceEnabled) {
          const simpleVoice = getSimpleVoice()
          
          // Stop any previous speech first (important!)
          simpleVoice.stopSpeaking()
          
          setIsSpeaking(true)
          simpleVoice.speak(
            data.response,
            () => {
              setIsSpeaking(false)
              if (continuousMode) shouldContinueListeningRef.current = true
            },
            (err) => {
              setIsSpeaking(false)
              if (continuousMode) shouldContinueListeningRef.current = true
              console.warn("[Voice] Playback failed (e.g. click the mic first to enable sound):", err?.message)
            }
          )
        } else if (continuousMode) {
          // If voice is disabled but continuous mode is on, still auto-listen
          shouldContinueListeningRef.current = true
        }
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      if (slowResponseTimeout) clearTimeout(slowResponseTimeout)
      console.error("Error processing query:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        text: "I'm sorry, I encountered an error processing your request. Please try again.",
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMessage])
      
      // In continuous mode, still try to continue listening after error
      if (continuousMode) {
        shouldContinueListeningRef.current = true
      }
    } finally {
      if (slowResponseTimeout) clearTimeout(slowResponseTimeout)
      setIsProcessing(false)
      setCurrentTranscript("")
      setInterimTranscript("")
    }
  }

  /** Stop both listening and speaking for a clear "Stop" experience. */
  const handleStopAll = () => {
    const simpleVoice = getSimpleVoice()
    simpleVoice.stopSpeaking()
    const voiceService = getVoiceService()
    voiceService.stopListening()
    voiceService.stopSpeaking()
    setIsSpeaking(false)
    setIsListening(false)
    setCurrentTranscript("")
    setInterimTranscript("")
    shouldContinueListeningRef.current = false
  }

  const toggleVoice = () => {
    if (isSpeaking) {
      const simpleVoice = getSimpleVoice()
      simpleVoice.stopSpeaking()
      setIsSpeaking(false)
    }
    // Unlock audio when user enables voice so TTS is allowed
    if (!voiceEnabled) getSimpleVoice().unlockAudio()
    setVoiceEnabled(!voiceEnabled)
  }

  return (
    <div className="min-h-full bg-gradient-to-br from-background via-background to-primary/5 relative overflow-x-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse animation-delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-3xl animate-pulse animation-delay-2000" />
      </div>

      {/* Page Header */}
      <div className="relative border-b border-border/40 bg-background/60 backdrop-blur-xl">
        <div className="container py-4 sm:py-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold gradient-text flex items-center gap-2">
                <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
                Voice-Native Financial OS
              </h1>
              <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                Aura — real-time voice conversation with full knowledge of your business. Finance and market intelligence, dynamically.
                {getTTSProvider() === "minimax" && (
                  <span className="ml-2 text-primary font-medium">· Voice: MiniMax</span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {!isSupported && (
                <Badge variant="destructive" className="gap-1.5 text-xs">
                  <AlertCircle className="h-3.5 w-3.5" />
                  Voice not supported
                </Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowChat(!showChat)}
                className="gap-1.5"
              >
                <MessageSquare className="h-4 w-4" />
                {showChat ? 'Hide' : 'Show'} Chat
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative container py-6 sm:py-8 px-4 sm:px-6 max-w-5xl mx-auto">
        {clickToHearHint && (
          <div className="mb-4 rounded-lg border border-primary/30 bg-primary/10 px-4 py-2.5 text-center text-sm text-foreground animate-fade-in">
            Tap or click anywhere to hear Aura&apos;s welcome.
          </div>
        )}
        
        {/* Mascot Center Stage */}
        <div className="flex flex-col items-center justify-center mb-6 sm:mb-8">
          {/* Mascot Container with Glow Effect */}
          <div className="relative">
            {/* Glow rings when listening/speaking */}
            {(isListening || isSpeaking) && (
              <>
                <div className="absolute inset-0 -m-8 rounded-full bg-primary/20 animate-ping" />
                <div className="absolute inset-0 -m-12 rounded-full bg-primary/10 animate-pulse" />
                <div className="absolute inset-0 -m-16 rounded-full bg-primary/5 animate-pulse animation-delay-500" />
              </>
            )}
            
            {/* Main Mascot */}
            <div className="relative z-10 transform transition-transform duration-300 hover:scale-105">
              <CFOMascot 
                state={getMascotState()} 
                size="large"
                className="drop-shadow-2xl"
              />
            </div>

            {/* Status Badge */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap">
              <Badge 
                variant={isListening ? "default" : isSpeaking ? "secondary" : continuousMode ? "default" : "outline"} 
                className={`px-3 sm:px-4 py-1 text-xs sm:text-sm font-semibold shadow-lg animate-fade-in ${continuousMode && !isListening && !isSpeaking && !isProcessing ? 'animate-pulse' : ''}`}
              >
                {isListening && "👂 Listening..."}
                {isProcessing && "🤔 Thinking..."}
                {isSpeaking && "💬 Speaking..."}
                {!isListening && !isProcessing && !isSpeaking && continuousMode && "🎤 Continuous"}
                {!isListening && !isProcessing && !isSpeaking && !continuousMode && "✨ Ready"}
              </Badge>
            </div>
          </div>

          {/* Assistant Name & Description */}
          <div className="text-center mt-10 sm:mt-12 space-y-1">
            <h2 className="text-3xl sm:text-4xl font-bold gradient-text">Aura</h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-md mx-auto">
              Finance × Growth × Market Intelligence · Navigate, scenarios, investor summary, reports — by voice
            </p>
          </div>

          {/* Live transcript: final + interim (real-time) */}
          {(currentTranscript || interimTranscript || (isListening && !currentTranscript && !interimTranscript)) && (
            <Card className="mt-6 w-full max-w-2xl mx-auto animate-slide-up border border-border bg-card/95 backdrop-blur-sm">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0 animate-pulse" />
                  <div className="flex-1 min-w-0 space-y-1">
                    {currentTranscript && (
                      <p className="text-base sm:text-lg">{currentTranscript}</p>
                    )}
                    {interimTranscript && (
                      <p className="text-base sm:text-lg text-muted-foreground italic">{interimTranscript}</p>
                    )}
                    {isListening && !currentTranscript && !interimTranscript && (
                      <p className="text-base sm:text-lg text-muted-foreground">Listening...</p>
                    )}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Say &quot;Stop&quot; or &quot;Wait&quot; anytime to cancel.</p>
              </CardContent>
            </Card>
          )}

          {/* Latest Response / Welcome (if not showing chat) */}
          {!showChat && messages.length >= 1 && (
            <Card className="mt-6 w-full max-w-3xl mx-auto animate-slide-up border border-border bg-card/95 backdrop-blur-sm">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-muted-foreground mb-2">
                      {messages.length === 1 ? "Welcome" : "Aura's Response"}:
                    </p>
                    <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words">
                      {messages[messages.length - 1].text}
                    </p>
                    
                    {messages[messages.length - 1].insights && messages[messages.length - 1].insights!.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                          <TrendingUp className="h-3 w-3 flex-shrink-0" />
                          Key Insights
                        </div>
                        {messages[messages.length - 1].insights!.map((insight, idx) => (
                          <p key={idx} className="text-sm opacity-90">{insight}</p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Trends & graphs — show only when user asks (e.g. "show me cash balance", "show me revenue") */}
          <div className="mt-6 w-full max-w-3xl mx-auto">
            {requestedCharts.length > 0 ? (
              <>
                <p className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  Trends at a glance
                </p>
                <div className={`grid gap-4 ${requestedCharts.length === 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"}`}>
                  {requestedCharts.includes("cash") && (
                    <Card className="border border-border/60 bg-card/80 overflow-hidden">
                      <CardContent className="p-3">
                        <p className="text-xs font-medium text-muted-foreground mb-2">Cash balance ($k)</p>
                        <ResponsiveContainer width="100%" height={140}>
                          <AreaChart data={VOICE_CASH_TREND}>
                            <defs>
                              <linearGradient id="voiceCashGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.6} />
                                <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0.12} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="2 2" stroke="var(--muted-foreground)" strokeOpacity={0.4} />
                            <XAxis dataKey="month" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} stroke="var(--muted-foreground)" />
                            <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickFormatter={(v) => `${v}`} width={28} stroke="var(--muted-foreground)" />
                            <Tooltip formatter={(v: number) => [`$${v}k`, ""]} contentStyle={{ fontSize: "12px", background: "var(--card)", border: "1px solid var(--border)" }} />
                            <Area type="monotone" dataKey="cash" stroke="var(--chart-1)" strokeWidth={2} fill="url(#voiceCashGrad)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  )}
                  {requestedCharts.includes("revenue") && (
                    <Card className="border border-border/60 bg-card/80 overflow-hidden">
                      <CardContent className="p-3">
                        <p className="text-xs font-medium text-muted-foreground mb-2">Revenue ($k)</p>
                        <ResponsiveContainer width="100%" height={140}>
                          <BarChart data={VOICE_REVENUE_TREND}>
                            <CartesianGrid strokeDasharray="2 2" stroke="var(--muted-foreground)" strokeOpacity={0.4} />
                            <XAxis dataKey="month" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} stroke="var(--muted-foreground)" />
                            <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} width={28} stroke="var(--muted-foreground)" />
                            <Tooltip formatter={(v: number) => [`$${v}k`, ""]} contentStyle={{ fontSize: "12px", background: "var(--card)", border: "1px solid var(--border)" }} />
                            <Bar dataKey="revenue" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Say &quot;open dashboard&quot; for full charts and export.
                </p>
              </>
            ) : (
              <p className="text-xs text-muted-foreground text-center">
                Say &quot;show me cash balance&quot; or &quot;show me revenue&quot; for a quick chart.
              </p>
            )}
          </div>

          {/* Voice Controls - Prominent */}
          <div className="mt-6 sm:mt-8 flex flex-col items-center gap-4 w-full max-w-md">
            {/* Main Control Row - wraps on small screens */}
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              <Button
                size="lg"
                variant={isListening ? "destructive" : continuousMode ? "secondary" : "default"}
                className={`h-16 w-16 sm:h-20 sm:w-20 rounded-full shadow-2xl transition-all duration-300 flex-shrink-0 ${
                  isListening 
                    ? 'animate-pulse scale-110' 
                    : continuousMode 
                    ? 'animate-pulse' 
                    : 'hover:scale-110'
                }`}
                onClick={
                  isListening
                    ? handleStopAll
                    : () => {
                        if (isSpeaking) {
                          getSimpleVoice().stopSpeaking()
                          setIsSpeaking(false)
                        }
                        // If welcome was blocked on load, first mic click plays it then starts listening
                        if (voiceEnabled && welcomePendingGestureRef.current && isSupported) {
                          playWelcomeVoice(handleStartListening)
                        } else {
                          handleStartListening()
                        }
                      }
                }
                disabled={!isSupported || isProcessing || (continuousMode && !isListening && !isSpeaking)}
              >
                {isListening ? (
                  <MicOff className="h-7 w-7 sm:h-8 sm:w-8" />
                ) : (
                  <Mic className="h-7 w-7 sm:h-8 sm:w-8" />
                )}
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="h-12 sm:h-14 px-4 sm:px-6 shadow-lg hover:scale-105 transition-transform flex-shrink-0"
                onClick={toggleVoice}
              >
                {voiceEnabled ? (
                  <>
                    <Volume2 className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" />
                    <span className="text-sm sm:text-base">Voice On</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" />
                    <span className="text-sm sm:text-base">Voice Off</span>
                  </>
                )}
              </Button>

              {!isListening && !isProcessing && (
                <Button
                  size="lg"
                  variant="secondary"
                  className="h-12 sm:h-14 px-4 sm:px-6 shadow-lg hover:scale-105 transition-transform flex-shrink-0 border-primary/30 hover:bg-primary/10"
                  onClick={() => {
                    if (isSpeaking) {
                      getSimpleVoice().stopSpeaking()
                      setIsSpeaking(false)
                    }
                    if (voiceEnabled && welcomePendingGestureRef.current && isSupported) {
                      playWelcomeVoice(handleStartListening)
                    } else {
                      handleStartListening()
                    }
                  }}
                  disabled={!isSupported}
                >
                  <Mic className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" />
                  <span className="text-sm sm:text-base">Listen again</span>
                </Button>
              )}

              {(isListening || isSpeaking) && (
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 sm:h-14 px-4 sm:px-6 shadow-lg animate-fade-in flex-shrink-0 border-amber-500/50 hover:bg-amber-500/10 hover:border-amber-500"
                  onClick={handleStopAll}
                >
                  <Pause className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" />
                  <span className="text-sm sm:text-base">Stop</span>
                </Button>
              )}
            </div>

            {/* Mode Toggles */}
            <div className="flex flex-col items-center gap-3 w-full">
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                <Button
                  size="default"
                  variant={autoModeEnabled ? "default" : "outline"}
                  className={`px-4 sm:px-6 shadow-lg transition-all duration-300 text-sm sm:text-base ${
                    autoModeEnabled ? 'border-2 border-primary' : ''
                  }`}
                  onClick={toggleAutoMode}
                  disabled={!isSupported}
                >
                  <Sparkles className={`h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 flex-shrink-0 ${autoModeEnabled ? 'animate-pulse' : ''}`} />
                  {autoModeEnabled ? 'Auto: ON' : 'Auto: OFF'}
                </Button>

                <Button
                  size="default"
                  variant={continuousMode ? "default" : "outline"}
                  className={`px-4 sm:px-6 shadow-lg transition-all duration-300 text-sm sm:text-base ${
                    continuousMode ? 'bg-gradient-to-r from-primary to-secondary' : ''
                  }`}
                  onClick={toggleContinuousMode}
                  disabled={!isSupported}
                >
                  {continuousMode ? (
                    <>
                      <MicOff className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 flex-shrink-0" />
                      Stop Listening
                    </>
                  ) : (
                    <>
                      <Mic className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 flex-shrink-0" />
                      Keep Listening
                    </>
                  )}
                </Button>
              </div>
              
              {autoModeEnabled && !continuousMode && (
                <p className="text-xs text-muted-foreground animate-fade-in text-center max-w-sm px-2">
                  💡 Auto: continuous listening after 2 questions
                </p>
              )}
              {continuousMode && (
                <p className="text-xs text-muted-foreground animate-fade-in text-center max-w-sm px-2">
                  🎤 Speak whenever you're ready
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Chat Section (Collapsible) */}
        {showChat && (
          <div className="grid gap-4 sm:gap-6 lg:grid-cols-3 mt-6 sm:mt-8 animate-slide-up">
            {/* Chat Area */}
            <div className="lg:col-span-2 min-w-0">
              <Card className="h-[420px] sm:h-[500px] flex flex-col border border-border bg-card/95 backdrop-blur-sm">
                <CardHeader className="border-b shrink-0">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Sparkles className="h-5 w-5 text-primary flex-shrink-0" />
                    Full Conversation
                  </CardTitle>
                  <CardDescription>
                    Your chat history with Aura
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 min-h-0">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-[80%] rounded-lg p-3 sm:p-4 min-w-0 ${
                        message.type === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
                      
                      {/* Show insights if available */}
                      {message.insights && message.insights.length > 0 && (
                        <div className="mt-4 space-y-2">
                          <div className="flex items-center gap-2 text-xs font-semibold">
                            <TrendingUp className="h-3 w-3" />
                            Key Insights
                          </div>
                          {message.insights.map((insight, idx) => (
                            <p key={idx} className="text-xs opacity-90">{insight}</p>
                          ))}
                        </div>
                      )}
                      
                      {/* Show recommendations if available */}
                      {message.recommendations && message.recommendations.length > 0 && (
                        <div className="mt-4 space-y-2">
                          <div className="flex items-center gap-2 text-xs font-semibold">
                            <Lightbulb className="h-3 w-3" />
                            Recommendations
                          </div>
                          {message.recommendations.map((rec, idx) => (
                            <p key={idx} className="text-xs opacity-90">{rec}</p>
                          ))}
                        </div>
                      )}
                      
                      <p className="text-xs opacity-60 mt-2">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                
                {isProcessing && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <div className="animate-pulse">●</div>
                        <div className="animate-pulse animation-delay-200">●</div>
                        <div className="animate-pulse animation-delay-400">●</div>
                        <span className="text-sm ml-2">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                
                  <div ref={messagesEndRef} />
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions & Tips */}
            <div className="space-y-4 sm:space-y-6 min-w-0">
              {/* Status Card */}
              <Card className="border border-border bg-card/95 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Auto Mode</span>
                    <Badge variant={autoModeEnabled ? "default" : "secondary"} className={autoModeEnabled ? 'animate-pulse' : ''}>
                      {autoModeEnabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Listening</span>
                    <Badge variant={continuousMode ? "default" : "secondary"} className={continuousMode ? 'animate-pulse' : ''}>
                      {continuousMode ? 'Continuous' : 'Manual'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Voice Input</span>
                    <Badge variant={isListening ? "default" : "secondary"}>
                      {isListening ? 'Listening' : 'Ready'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Voice Output</span>
                    <Badge variant={isSpeaking ? "default" : "secondary"}>
                      {isSpeaking ? 'Speaking' : voiceEnabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Voice Agent (TTS)</span>
                    <Badge variant={getTTSProvider() === "minimax" ? "default" : "secondary"} className="capitalize">
                      {getTTSProvider() === "minimax" ? "MiniMax" : getTTSProvider() === "elevenlabs" ? "ElevenLabs" : "Not configured"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">AI Status</span>
                    <Badge variant="default">Online</Badge>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-sm text-muted-foreground">Data Source</span>
                    <Badge 
                      variant={financialDataStatus?.isUsingRealData ? "default" : "secondary"}
                      className="font-semibold"
                    >
                      {financialDataStatus?.isUsingRealData ? (
                        <>✅ Real Data</>
                      ) : (
                        <>⚠️ Demo Data</>
                      )}
                    </Badge>
                  </div>
                  {demoMode && (
                    <p className="text-xs text-muted-foreground bg-amber-50 dark:bg-amber-950/20 p-2 rounded border border-amber-200 dark:border-amber-900">
                      🔑 Set OPENAI_API_KEY in env for real-time AI (not template) responses.
                    </p>
                  )}
                  {financialDataStatus && !financialDataStatus.isUsingRealData && (
                    <p className="text-xs text-muted-foreground bg-yellow-50 dark:bg-yellow-950/20 p-2 rounded border border-yellow-200 dark:border-yellow-900">
                      💡 Load real data from Dashboard to see your actual metrics!
                    </p>
                  )}
                  {financialDataStatus?.isUsingRealData && (
                    <p className="text-xs text-muted-foreground bg-green-50 dark:bg-green-950/20 p-2 rounded border border-green-200 dark:border-green-900">
                      ✨ Using {financialDataStatus.companyName || 'your company'} data
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Example Questions */}
              <Card className="border border-border bg-card/95 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-primary" />
                    Try Asking
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                {[
                  "What's my runway situation?",
                  "I'm worried about our cash — are we okay?",
                  "How's my revenue growth looking?",
                  "Why is burn so high?",
                  "This is so frustrating. What can I do?",
                  "What should I focus on right now?",
                  "We hit our target! What's next?",
                  "Open dashboard",
                  "Take me to runway",
                  "Log an expense of 500 for marketing",
                  "Run a runway report",
                  "Summarize my week",
                  "Just tell me if we're okay",
                  "Am I on track?",
                  "What if we cut marketing by 20%?",
                  "Can you explain that again?",
                  "Open scenarios",
                  "Run competitor research",
                  "Open market intelligence",
                ].map((question, idx) => (
                  <Button
                    key={idx}
                    variant="ghost"
                    className="w-full justify-start text-left h-auto py-2 px-3"
                    onClick={() => handleVoiceQuery(question)}
                    disabled={isProcessing}
                  >
                    <Play className="h-3 w-3 mr-2 flex-shrink-0" />
                      <span className="text-xs">{question}</span>
                    </Button>
                  ))}
                </CardContent>
              </Card>

              {/* Tips */}
              <Card className="border border-border bg-card/95 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  {getTTSProvider() === "minimax" && (
                    <p>• <strong>Voice agent:</strong> Aura speaks with MiniMax (set in .env.local)</p>
                  )}
                  <p>• <strong>Listen again:</strong> Click the &quot;Listen again&quot; button to start the agent listening to you anytime.</p>
                  <p>• <strong>Emotion-aware:</strong> Aura picks up on worry, frustration, excitement, or urgency and responds with the right tone.</p>
                  <p>• <strong>Real-time conversation:</strong> Aura remembers the last 16 turns. Say &quot;why?&quot;, &quot;explain that&quot;, &quot;what about X?&quot;</p>
                  <p>• <strong>Navigate:</strong> &quot;open dashboard&quot;, &quot;take me to runway&quot;, &quot;scenarios&quot;, &quot;market intelligence&quot;</p>
                  <p>• <strong>Log transactions:</strong> &quot;log expense 500 for marketing&quot;, &quot;record 2k revenue&quot;</p>
                  <p>• <strong>Reports:</strong> &quot;run runway report&quot;, &quot;summarize my week&quot;</p>
                  <p>• <strong>Auto Mode:</strong> Keeps listening after 2 questions; 45s silence stops it</p>
                  <p>• <strong>Stop:</strong> Say &quot;Stop&quot;, &quot;Wait&quot;, or &quot;Cancel&quot; — or click Stop to end listening and speaking</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
