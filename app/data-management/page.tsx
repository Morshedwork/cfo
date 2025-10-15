"use client"

import { useState, useEffect } from "react"
import { LoadingScreen } from "@/components/loading-screen"
import { AuthNavbar } from "@/components/auth-navbar"
import { ExcelManager } from "@/components/excel-manager"
import { FinancialStatementsView } from "@/components/financial-statements-view"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Database, Sparkles, TrendingUp, FileText, Calendar, DollarSign, Tag, CheckCircle2, Upload, Mic, MicOff, Trash2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

interface DataEntry {
  id: string
  type: "transaction" | "revenue" | "expense"
  description: string
  amount: number
  date: string
  category: string
  source: "voice" | "manual" | "excel"
  confidence?: number
}

export default function DataManagementPage() {
  const [loading, setLoading] = useState(true)
  const [isExiting, setIsExiting] = useState(false)
  const [importedData, setImportedData] = useState<any>(null)
  const [isListening, setIsListening] = useState(false)
  const [voiceCommand, setVoiceCommand] = useState("")
  const [entries, setEntries] = useState<DataEntry[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    // Minimum display time for signature loading screen (2.5 seconds)
    const minLoadTime = setTimeout(() => {
      setIsExiting(true)
      setTimeout(() => setLoading(false), 500)
    }, 2500)
    return () => clearTimeout(minLoadTime)
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
        console.error("Voice processing error:", error)
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
      default:
        return <Database className="h-4 w-4" />
    }
  }

  const recentImports = [
    { name: "Q4_2024_Transactions.xlsx", date: "2024-01-15", rows: 450, status: "success" },
    { name: "December_Expenses.csv", date: "2024-01-10", rows: 180, status: "success" },
    { name: "Annual_Revenue_2024.xlsx", date: "2024-01-05", rows: 320, status: "success" },
  ]

  const dataStats = [
    { label: "Total Transactions", value: "2,450", icon: FileText, color: "primary" },
    { label: "Categories", value: "24", icon: Tag, color: "secondary" },
    { label: "Date Range", value: "12 months", icon: Calendar, color: "accent" },
    { label: "Total Value", value: "$1.2M", icon: DollarSign, color: "chart-4" },
  ]

  if (loading) {
    return <LoadingScreen isExiting={isExiting} />
  }

  return (
    <div className="min-h-screen bg-background page-transition">
      <AuthNavbar />

      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Data Management</h1>
          <p className="text-muted-foreground">Import, export, and manage your financial data with AI assistance</p>
        </div>

        {/* AI Insights */}
        {importedData && importedData.summary && (
          <Card className="mb-8 border-2 border-accent/50 bg-gradient-to-r from-accent/10 to-secondary/10 animate-slide-up">
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-5 w-5 text-accent" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2">Import Complete - Statements Generated</CardTitle>
                  <CardDescription className="text-base">
                    Successfully processed {importedData.summary.totalTransactions} transactions. 
                    Period: {importedData.summary.dateRange}. 
                    Identified {importedData.summary.categories.length} categories. 
                    Financial statements auto-generated below. 📊
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        )}
        
        {/* Auto-Generated Financial Statements */}
        {importedData && importedData.profitLoss && (
          <>
            <div className="flex justify-end mb-4">
              <Button 
                variant="outline" 
                onClick={() => setImportedData(null)}
                className="gap-2"
              >
                <Upload className="h-4 w-4" />
                Upload New File
              </Button>
            </div>
            <FinancialStatementsView
              profitLoss={importedData.profitLoss}
              cashFlow={importedData.cashFlow}
              insights={importedData.insights}
            />
          </>
        )}

        {/* Only show upload section if no data loaded */}
        {!importedData && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Data Input Tabs */}
              <Card>
                <CardHeader>
                  <CardTitle>Add Financial Data</CardTitle>
                  <CardDescription>Choose how you want to input your data</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="upload" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="upload">Upload File</TabsTrigger>
                      <TabsTrigger value="voice">Voice Input</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="upload" className="space-y-4">
                      <ExcelManager onDataImport={setImportedData} exportFilename="aura-financial-data" />
                    </TabsContent>
                    
                    <TabsContent value="voice" className="space-y-4">
                      <Card className="border-2 border-primary/50">
                        <CardContent className="pt-6">
                          <div className="flex flex-col items-center gap-4 py-4">
                            <Button
                              size="lg"
                              onClick={handleVoiceInput}
                              disabled={isProcessing}
                              className={cn(
                                "h-24 w-24 rounded-full transition-all",
                                isListening
                                  ? "bg-destructive hover:bg-destructive/90 animate-glow-pulse"
                                  : "bg-gradient-to-br from-primary via-secondary to-accent",
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

                          <div className="space-y-2 text-sm text-muted-foreground mt-4">
                            <p className="font-semibold text-foreground">Try saying:</p>
                            <ul className="space-y-1 pl-4">
                              <li>"Add expense of $500 for office supplies"</li>
                              <li>"Record revenue of $10,000 from client"</li>
                              <li>"Add marketing expense $2,000"</li>
                            </ul>
                          </div>

                          {/* Voice Entries List */}
                          {entries.length > 0 && (
                            <div className="mt-6 space-y-3">
                              <div className="flex items-center justify-between">
                                <p className="font-semibold text-sm">Recent Voice Entries</p>
                                <Badge variant="secondary">{entries.length} entries</Badge>
                              </div>
                              {entries.map((entry) => (
                                <Card
                                  key={entry.id}
                                  className="p-3 border-primary/50"
                                >
                                  <div className="flex items-start gap-3">
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
                                        <Badge className="text-xs bg-primary/10 text-primary border-primary/50">
                                          <Mic className="h-3 w-3 mr-1" />
                                          AI {entry.confidence}%
                                        </Badge>
                                      </div>
                                    </div>
                                    <Button size="icon" variant="ghost" onClick={() => handleDelete(entry.id)}>
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                  </div>
                                </Card>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

            {/* Recent Imports */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Imports</CardTitle>
                <CardDescription>Your recently uploaded files</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentImports.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.rows} rows • {item.date}
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-success">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Success
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Data Statistics */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-primary" />
                  <CardTitle>Data Overview</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {dataStats.map((stat, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-lg bg-${stat.color}/10 flex items-center justify-center`}>
                        <stat.icon className={`h-4 w-4 text-${stat.color}`} />
                      </div>
                      <span className="text-sm text-muted-foreground">{stat.label}</span>
                    </div>
                    <span className="font-semibold">{stat.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Tips */}
            <Card className="border-2 border-accent/50 bg-gradient-to-br from-accent/10 to-transparent">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-accent" />
                  <CardTitle className="text-lg">Pro Tips</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <TrendingUp className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                  <p className="text-muted-foreground">
                    Include date, amount, and description columns for best AI categorization
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <TrendingUp className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                  <p className="text-muted-foreground">Use consistent date formats (YYYY-MM-DD recommended)</p>
                </div>
                <div className="flex items-start gap-2">
                  <TrendingUp className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                  <p className="text-muted-foreground">Larger datasets (500+ rows) provide better AI insights</p>
                </div>
              </CardContent>
            </Card>

            {/* Supported Formats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Supported Formats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Excel (.xlsx, .xls)</span>
                  <CheckCircle2 className="h-4 w-4 text-success" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">CSV (.csv)</span>
                  <CheckCircle2 className="h-4 w-4 text-success" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Google Sheets</span>
                  <Badge variant="secondary" className="text-xs">
                    Coming Soon
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        )}
      </div>
    </div>
  )
}
