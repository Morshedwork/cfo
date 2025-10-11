"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
import { TrendingUp, Mic, BarChart3, Download, Play } from "lucide-react"
import { cn } from "@/lib/utils"

interface LivePreviewModalProps {
  isOpen: boolean
  onClose: () => void
  featureId: string
}

export function LivePreviewModal({ isOpen, onClose, featureId }: LivePreviewModalProps) {
  const [runwayMonths, setRunwayMonths] = useState(12)
  const [monthlyBurn, setMonthlyBurn] = useState(50000)
  const [voiceInput, setVoiceInput] = useState("")
  const [isListening, setIsListening] = useState(false)

  // Generate runway forecast data
  const generateRunwayData = () => {
    const data = []
    const cash = 600000
    for (let i = 0; i <= runwayMonths; i++) {
      data.push({
        month: `Month ${i}`,
        cash: Math.max(0, cash - monthlyBurn * i),
        forecast: Math.max(0, cash - monthlyBurn * i * 0.95),
      })
    }
    return data
  }

  // Sample analytics data
  const analyticsData = [
    { name: "Jan", revenue: 45000, expenses: 38000 },
    { name: "Feb", revenue: 52000, expenses: 41000 },
    { name: "Mar", revenue: 61000, expenses: 43000 },
    { name: "Apr", revenue: 58000, expenses: 45000 },
    { name: "May", revenue: 67000, expenses: 47000 },
    { name: "Jun", revenue: 74000, expenses: 49000 },
  ]

  const handleVoiceInput = () => {
    setIsListening(true)
    setTimeout(() => {
      setVoiceInput("Add $500 marketing expense for Google Ads campaign")
      setIsListening(false)
    }, 2000)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            {featureId === "ai-forecasting" && (
              <>
                <TrendingUp className="h-6 w-6 text-primary" />
                AI-Powered Runway Forecasting
              </>
            )}
            {featureId === "voice-data" && (
              <>
                <Mic className="h-6 w-6 text-accent" />
                Voice-Activated Data Entry
              </>
            )}
            {featureId === "smart-analytics" && (
              <>
                <BarChart3 className="h-6 w-6 text-secondary" />
                Smart Analytics Dashboard
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {featureId === "ai-forecasting" && "Adjust your assumptions and watch the forecast update in real-time"}
            {featureId === "voice-data" && "Try speaking naturally to add financial data"}
            {featureId === "smart-analytics" && "Explore interactive charts with export capabilities"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* AI Forecasting Preview */}
          {featureId === "ai-forecasting" && (
            <>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Monthly Burn Rate</Label>
                  <Input
                    type="number"
                    value={monthlyBurn}
                    onChange={(e) => setMonthlyBurn(Number.parseInt(e.target.value))}
                    className="text-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Forecast Period (Months)</Label>
                  <Input
                    type="number"
                    value={runwayMonths}
                    onChange={(e) => setRunwayMonths(Number.parseInt(e.target.value))}
                    className="text-lg"
                  />
                </div>
              </div>

              <Card className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5">
                <h3 className="font-semibold mb-4">Cash Runway Forecast</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={generateRunwayData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="cash" stroke="hsl(var(--primary))" strokeWidth={2} />
                    <Line
                      type="monotone"
                      dataKey="forecast"
                      stroke="hsl(var(--accent))"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                    />
                  </LineChart>
                </ResponsiveContainer>
                <div className="mt-4 p-4 bg-accent/10 rounded-lg border border-accent/50">
                  <p className="text-sm font-medium text-accent">
                    AI Insight: At your current burn rate of ${monthlyBurn.toLocaleString()}/month, you have{" "}
                    {(600000 / monthlyBurn).toFixed(1)} months of runway remaining.
                  </p>
                </div>
              </Card>
            </>
          )}

          {/* Voice Data Entry Preview */}
          {featureId === "voice-data" && (
            <>
              <div className="flex flex-col items-center gap-4 p-8 bg-gradient-to-br from-accent/5 to-secondary/5 rounded-lg border-2 border-accent/20">
                <Button
                  size="lg"
                  onClick={handleVoiceInput}
                  disabled={isListening}
                  className={cn("h-24 w-24 rounded-full", isListening && "animate-pulse bg-accent")}
                >
                  {isListening ? <Play className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
                </Button>
                <p className="text-sm text-muted-foreground">{isListening ? "Listening..." : "Click to speak"}</p>
              </div>

              {voiceInput && (
                <Card className="p-6 animate-slide-up">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">You said:</Label>
                      <p className="text-lg font-medium">{voiceInput}</p>
                    </div>
                    <div className="border-t pt-4">
                      <Label className="text-xs text-muted-foreground">AI Processed:</Label>
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <div>
                          <p className="text-sm text-muted-foreground">Amount</p>
                          <p className="text-lg font-semibold">$500.00</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Category</p>
                          <p className="text-lg font-semibold">Marketing</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Type</p>
                          <p className="text-lg font-semibold">Expense</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Vendor</p>
                          <p className="text-lg font-semibold">Google Ads</p>
                        </div>
                      </div>
                    </div>
                    <Button className="w-full">Add Transaction</Button>
                  </div>
                </Card>
              )}
            </>
          )}

          {/* Smart Analytics Preview */}
          {featureId === "smart-analytics" && (
            <>
              <Card className="p-6 bg-gradient-to-br from-secondary/5 to-accent/5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Revenue vs Expenses</h3>
                  <Button size="sm" variant="outline" className="gap-2 bg-transparent">
                    <Download className="h-4 w-4" />
                    Export JPG
                  </Button>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="revenue" fill="hsl(var(--primary))" />
                    <Bar dataKey="expenses" fill="hsl(var(--destructive))" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { label: "Total Revenue", value: "$357K", change: "+23%" },
                  { label: "Total Expenses", value: "$263K", change: "+12%" },
                  { label: "Net Profit", value: "$94K", change: "+45%" },
                ].map((metric, i) => (
                  <Card key={i} className="p-4 hover-lift">
                    <p className="text-sm text-muted-foreground mb-1">{metric.label}</p>
                    <p className="text-2xl font-bold mb-1">{metric.value}</p>
                    <p className="text-sm text-accent">{metric.change} vs last period</p>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
