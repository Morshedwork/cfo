"use client"

import { useState, useEffect, useRef } from "react"
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
  MessageSquare
} from "lucide-react"
import { getVoiceService } from "@/lib/voice-assistant-service"
import { getVoiceService as getSimpleVoice } from "@/lib/simple-voice-service"
import { useAuth } from "@/lib/auth-context"
import { CFOMascot, MascotState } from "@/components/cfo-mascot"

interface Message {
  id: string
  type: 'user' | 'assistant'
  text: string
  timestamp: Date
  insights?: string[]
  recommendations?: string[]
  data?: any
}

interface FinancialData {
  isUsingRealData?: boolean
  hasCompanyData?: boolean
  hasTransactionData?: boolean
  companyName?: string
  [key: string]: any
}

export default function VoiceAssistantPage() {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [isSupported, setIsSupported] = useState(false)
  const [currentTranscript, setCurrentTranscript] = useState("")
  const [showChat, setShowChat] = useState(false)
  const [continuousMode, setContinuousMode] = useState(false)
  const [autoModeEnabled, setAutoModeEnabled] = useState(true) // Auto-detect conversation intent
  const [financialDataStatus, setFinancialDataStatus] = useState<FinancialData | null>(null) // Track data source
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const shouldContinueListeningRef = useRef(false)
  const conversationCountRef = useRef(0)
  const lastInteractionTimeRef = useRef(Date.now())

  // Get mascot state based on current activity
  const getMascotState = (): MascotState => {
    if (isListening) return 'listening'
    if (isProcessing) return 'thinking'
    if (isSpeaking) return 'speaking'
    return 'idle'
  }

  useEffect(() => {
    const voiceService = getVoiceService()
    setIsSupported(voiceService.isSupported())

    // Add welcome message
    setMessages([{
      id: '1',
      type: 'assistant',
      text: "Hey! I'm Aura, your AI CFO.\n\nAsk me anything about your finances - runway, growth, expenses, whatever you need. After a couple questions, I'll start listening continuously so we can just talk.\n\nClick the mic to start!",
      timestamp: new Date(),
    }])

    // Play welcome message ONCE (only on first visit)
    const hasPlayedWelcome = sessionStorage.getItem('aura_voice_welcome_played')
    
    if (!hasPlayedWelcome && voiceService.isSupported()) {
      const simpleVoice = getSimpleVoice()
      
      // Minimal delay for page readiness, then play immediately
      setTimeout(() => {
        setIsSpeaking(true)
        simpleVoice.speak(
          "Hey! I'm Aura. Click the mic to start.", 
          () => {
            setIsSpeaking(false)
            // Mark as played so it doesn't play again this session
            sessionStorage.setItem('aura_voice_welcome_played', 'true')
          },
          (error) => {
            console.error('[Voice] Welcome error:', error)
            setIsSpeaking(false)
            // Still mark as played even on error
            sessionStorage.setItem('aura_voice_welcome_played', 'true')
          }
        )
      }, 200) // 200ms - instant feel
    }
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
    const voiceService = getVoiceService()
    
    setIsListening(true)
    setCurrentTranscript("Listening...")
    shouldContinueListeningRef.current = true

    voiceService.startListening(
      (transcript) => {
        setCurrentTranscript(transcript)
        setIsListening(false)
        
        // Only process if there's actual content (minimum 2 words for better detection)
        const wordCount = transcript.trim().split(/\s+/).length
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
      }
    )
  }

  const handleStopListening = () => {
    const voiceService = getVoiceService()
    voiceService.stopListening()
    setIsListening(false)
    setCurrentTranscript("")
    shouldContinueListeningRef.current = false
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

    try {
      // Call API
      const response = await fetch('/api/voice-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          userId: user?.id,
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Update financial data status
        if (data.data) {
          setFinancialDataStatus(data.data)
        }
        
        // Add assistant message
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          text: data.response,
          timestamp: new Date(),
          insights: data.insights,
          recommendations: data.recommendations,
          data: data.data,
        }
        setMessages(prev => [...prev, assistantMessage])

        // Speak response with browser voice
        if (voiceEnabled) {
          const simpleVoice = getSimpleVoice()
          
          // Stop any previous speech first (important!)
          simpleVoice.stopSpeaking()
          
          setIsSpeaking(true)
          simpleVoice.speak(data.response, () => {
            setIsSpeaking(false)
            
            // In continuous mode, automatically start listening again after speaking
            if (continuousMode) {
              shouldContinueListeningRef.current = true
            }
          })
        } else if (continuousMode) {
          // If voice is disabled but continuous mode is on, still auto-listen
          shouldContinueListeningRef.current = true
        }
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
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
      setIsProcessing(false)
      setCurrentTranscript("")
    }
  }

  const handleStopSpeaking = () => {
    // Stop voice services
    const simpleVoice = getSimpleVoice()
    simpleVoice.stopSpeaking()
    
    const voiceService = getVoiceService()
    voiceService.stopSpeaking()
    
    setIsSpeaking(false)
  }

  const toggleVoice = () => {
    if (isSpeaking) {
      handleStopSpeaking()
    }
    setVoiceEnabled(!voiceEnabled)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse animation-delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-3xl animate-pulse animation-delay-2000" />
      </div>

      {/* Header */}
      <div className="relative border-b border-border/40 bg-background/50 backdrop-blur-xl">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold gradient-text flex items-center gap-2">
                <Sparkles className="h-8 w-8 text-primary" />
                Voice AI Assistant
              </h1>
              <p className="text-muted-foreground mt-2">
                Talk to Aura, your intelligent AI CFO
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {!isSupported && (
                <Badge variant="destructive" className="gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Voice not supported
                </Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowChat(!showChat)}
                className="gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                {showChat ? 'Hide' : 'Show'} Chat
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative container py-8">
        
        {/* Mascot Center Stage */}
        <div className="flex flex-col items-center justify-center mb-8">
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
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 z-20">
              <Badge 
                variant={isListening ? "default" : isSpeaking ? "secondary" : continuousMode ? "default" : "outline"} 
                className={`px-4 py-1 text-sm font-semibold shadow-lg animate-fade-in ${continuousMode && !isListening && !isSpeaking && !isProcessing ? 'animate-pulse' : ''}`}
              >
                {isListening && "👂 Listening..."}
                {isProcessing && "🤔 Thinking..."}
                {isSpeaking && "💬 Speaking..."}
                {!isListening && !isProcessing && !isSpeaking && continuousMode && "🎤 Continuous Mode Active"}
                {!isListening && !isProcessing && !isSpeaking && !continuousMode && "✨ Ready to chat"}
              </Badge>
            </div>
          </div>

          {/* Assistant Name & Description */}
          <div className="text-center mt-12 space-y-2">
            <h2 className="text-4xl font-bold gradient-text">Aura</h2>
            <p className="text-lg text-muted-foreground max-w-md">
              Your AI Chief Financial Officer
            </p>
          </div>

          {/* Current Transcript Display */}
          {currentTranscript && (
            <Card className="mt-6 max-w-2xl w-full animate-slide-up glass">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 animate-pulse" />
                  <p className="text-lg flex-1">{currentTranscript}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Latest Response Display (if not showing chat) */}
          {!showChat && messages.length > 1 && (
            <Card className="mt-6 max-w-3xl w-full animate-slide-up glass">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-2">Aura's Response:</p>
                    <p className="text-base leading-relaxed whitespace-pre-wrap">
                      {messages[messages.length - 1].text}
                    </p>
                    
                    {messages[messages.length - 1].insights && messages[messages.length - 1].insights!.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                          <TrendingUp className="h-3 w-3" />
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

          {/* Voice Controls - Prominent */}
          <div className="mt-8 flex flex-col items-center gap-4">
            {/* Main Control Row */}
            <div className="flex items-center gap-4">
              <Button
                size="lg"
                variant={isListening ? "destructive" : continuousMode ? "secondary" : "default"}
                className={`h-20 w-20 rounded-full text-lg gap-2 shadow-2xl transition-all duration-300 ${
                  isListening 
                    ? 'animate-pulse scale-110' 
                    : continuousMode 
                    ? 'animate-pulse' 
                    : 'hover:scale-110'
                }`}
                onClick={isListening ? handleStopListening : handleStartListening}
                disabled={!isSupported || isProcessing || (continuousMode && !isListening)}
              >
                {isListening ? (
                  <MicOff className="h-8 w-8" />
                ) : (
                  <Mic className="h-8 w-8" />
                )}
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="h-14 px-6 shadow-lg hover:scale-105 transition-transform"
                onClick={toggleVoice}
              >
                {voiceEnabled ? (
                  <>
                    <Volume2 className="h-5 w-5 mr-2" />
                    Voice On
                  </>
                ) : (
                  <>
                    <VolumeX className="h-5 w-5 mr-2" />
                    Voice Off
                  </>
                )}
              </Button>

              {isSpeaking && (
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 px-6 shadow-lg animate-fade-in"
                  onClick={handleStopSpeaking}
                >
                  <Pause className="h-5 w-5 mr-2" />
                  Stop
                </Button>
              )}
            </div>

            {/* Mode Toggles */}
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-3">
                {/* Auto Mode Toggle */}
                <Button
                  size="default"
                  variant={autoModeEnabled ? "default" : "outline"}
                  className={`px-6 shadow-lg transition-all duration-300 ${
                    autoModeEnabled ? 'border-2 border-primary' : ''
                  }`}
                  onClick={toggleAutoMode}
                  disabled={!isSupported}
                >
                  <Sparkles className={`h-4 w-4 mr-2 ${autoModeEnabled ? 'animate-pulse' : ''}`} />
                  {autoModeEnabled ? 'Auto: ON' : 'Auto: OFF'}
                </Button>

                {/* Manual Continuous Mode Toggle */}
                <Button
                  size="default"
                  variant={continuousMode ? "default" : "outline"}
                  className={`px-6 shadow-lg transition-all duration-300 ${
                    continuousMode ? 'bg-gradient-to-r from-primary to-secondary' : ''
                  }`}
                  onClick={toggleContinuousMode}
                  disabled={!isSupported}
                >
                  {continuousMode ? (
                    <>
                      <MicOff className="h-4 w-4 mr-2" />
                      Stop Listening
                    </>
                  ) : (
                    <>
                      <Mic className="h-4 w-4 mr-2" />
                      Keep Listening
                    </>
                  )}
                </Button>
              </div>
              
              {/* Status Text */}
              {autoModeEnabled && !continuousMode && (
                <p className="text-xs text-muted-foreground animate-fade-in text-center max-w-md">
                  💡 Auto mode: Continuous listening starts after 2 questions
                </p>
              )}
              {continuousMode && (
                <p className="text-xs text-muted-foreground animate-fade-in text-center max-w-md">
                  🎤 Listening continuously - speak whenever you're ready
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Chat Section (Collapsible) */}
        {showChat && (
          <div className="grid gap-6 lg:grid-cols-3 mt-8 animate-slide-up">
            {/* Chat Area */}
            <div className="lg:col-span-2">
              <Card className="h-[500px] flex flex-col glass">
                <CardHeader className="border-b">
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Full Conversation
                  </CardTitle>
                  <CardDescription>
                    Your chat history with Aura
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-4 ${
                        message.type === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                      
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
            <div className="space-y-6">
              {/* Status Card */}
              <Card className="glass">
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
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-primary" />
                    Try Asking
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                {[
                  "What's my runway situation?",
                  "How's my revenue growth looking?",
                  "What should I focus on right now?",
                  "Where can I cut costs safely?",
                  "Should I start fundraising?",
                  "Break down my expenses for me",
                  "Am I on track?",
                  "What are my biggest risks?",
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
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="text-lg">Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <p>• <strong>Auto Mode:</strong> Automatically keeps conversation going</p>
                  <p>• Speak naturally - Aura adapts to you</p>
                  <p>• After 2 questions, continuous mode auto-activates</p>
                  <p>• 45 seconds of silence stops continuous mode</p>
                  <p>• Toggle voice output or auto mode anytime</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

