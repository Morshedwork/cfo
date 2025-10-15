"use client"

import { useState, useEffect } from "react"
import { LoadingScreen } from "@/components/loading-screen"
import { AuthNavbar } from "@/components/auth-navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Mic,
  MicOff,
  Upload,
  Sparkles,
  Database,
  FileSpreadsheet,
  TrendingUp,
  DollarSign,
  Calendar,
  Trash2,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface DataEntry {
  id: string
  type: "transaction" | "revenue" | "expense" | "forecast"
  description: string
  amount: number
  date: string
  category: string
  source: "voice" | "manual" | "excel"
  confidence?: number
}

export default function DataVoiceManagement() {
  const [loading, setLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [voiceCommand, setVoiceCommand] = useState("")
  const [entries, setEntries] = useState<DataEntry[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      // Redirect to data management page
      window.location.href = '/data-management'
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  const handleVoiceInput = async () => {
    if (isListening) {
      setIsListening(false)
      setIsProcessing(true)

      try {
        const response = await fetch("/api/voice-process", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            command: "Add marketing expense of $2,500 for Google Ads campaign",
            currentData: { entries },
          }),
        })

        const result = await response.json()

        if (result.action === "add_expense" || result.action === "add_revenue") {
          // Categorize with AI
          const catResponse = await fetch("/api/categorize-transaction", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              description: result.data.description,
              amount: result.data.amount,
            }),
          })

          const categorization = await catResponse.json()

          const newEntry: DataEntry = {
            id: Math.random().toString(36).substr(2, 9),
            type: categorization.type === "expense" ? "expense" : "revenue",
            description: result.data.description,
            amount: result.data.amount,
            date: result.data.date || new Date().toISOString().split("T")[0],
            category: categorization.category,
            source: "voice",
            confidence: categorization.confidence,
          }

          setEntries((prev) => [newEntry, ...prev])
          setVoiceCommand(result.message)
        }
      } catch (error) {
        console.error("[v0] Voice processing error:", error)
        setVoiceCommand("Error processing voice command. Please try again.")
      } finally {
        setIsProcessing(false)
        setTimeout(() => setVoiceCommand(""), 3000)
      }
    } else {
      setIsListening(true)
      setVoiceCommand("Listening... Say something like 'Add expense of $500 for office supplies'")
    }
  }

  const handleDelete = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id))
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "revenue":
        return <TrendingUp className="h-4 w-4 text-success" />
      case "expense":
        return <DollarSign className="h-4 w-4 text-destructive" />
      case "forecast":
        return <Calendar className="h-4 w-4 text-accent" />
      default:
        return <Database className="h-4 w-4" />
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
          <h1 className="text-3xl font-bold mb-2 animate-text-shimmer">Automated Data Management</h1>
          <p className="text-muted-foreground">
            Add, edit, and manage your financial data with AI-powered voice commands
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Voice Input Section */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-2 border-primary/50 hover-glow">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <CardTitle>Voice Input</CardTitle>
                </div>
                <CardDescription>Speak naturally to add data with Gemini AI</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col items-center gap-4 py-8">
                  <Button
                    size="lg"
                    onClick={handleVoiceInput}
                    disabled={isProcessing}
                    className={cn(
                      "h-24 w-24 rounded-full transition-all",
                      isListening
                        ? "bg-destructive hover:bg-destructive/90 animate-glow-pulse"
                        : "bg-gradient-to-br from-primary via-secondary to-accent animate-gradient-shift",
                    )}
                  >
                    {isListening ? <MicOff className="h-10 w-10" /> : <Mic className="h-10 w-10" />}
                  </Button>
                  <div className="text-center">
                    <p className="font-semibold mb-1">
                      {isListening ? "Listening..." : isProcessing ? "Processing with AI..." : "Tap to speak"}
                    </p>
                    {voiceCommand && <p className="text-sm text-muted-foreground animate-slide-up">{voiceCommand}</p>}
                  </div>
                </div>

                <div className="space-y-2 text-sm text-muted-foreground">
                  <p className="font-semibold text-foreground">Try saying:</p>
                  <ul className="space-y-1 pl-4">
                    <li>"Add expense of $500 for office supplies"</li>
                    <li>"Record revenue of $10,000 from client"</li>
                    <li>"Add marketing expense $2,000"</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="hover-glow">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start hover-lift bg-transparent">
                  <Upload className="h-4 w-4 mr-2" />
                  Import Excel
                </Button>
                <Button variant="outline" className="w-full justify-start hover-lift bg-transparent">
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
                <Button variant="outline" className="w-full justify-start hover-lift bg-transparent">
                  <Database className="h-4 w-4 mr-2" />
                  Sync Integrations
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Data Entries List */}
          <div className="lg:col-span-2">
            <Card className="hover-glow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recent Entries</CardTitle>
                    <CardDescription>All your financial data in one place</CardDescription>
                  </div>
                  <Badge variant="secondary" className="gap-1">
                    <Database className="h-3 w-3" />
                    {entries.length} entries
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {entries.map((entry) => (
                    <Card
                      key={entry.id}
                      className={cn(
                        "p-4 hover-lift transition-all",
                        entry.source === "voice" && "border-primary/50 hover-glow",
                      )}
                    >
                      <div className="flex items-start gap-4">
                        <div className="p-2 rounded-lg bg-muted">{getTypeIcon(entry.type)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <p className="font-semibold text-sm">{entry.description}</p>
                            <p
                              className={cn(
                                "font-bold text-sm whitespace-nowrap",
                                entry.type === "revenue" ? "text-success" : "text-destructive",
                              )}
                            >
                              {entry.type === "revenue" ? "+" : "-"}${entry.amount.toLocaleString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className="text-xs">
                              {entry.category}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {entry.date}
                            </Badge>
                            {entry.source === "voice" && (
                              <Badge className="text-xs bg-primary/10 text-primary border-primary/50">
                                <Mic className="h-3 w-3 mr-1" />
                                AI {entry.confidence}%
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" onClick={() => handleDelete(entry.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
