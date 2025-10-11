"use client"

import { useState, useEffect } from "react"
import { LoadingScreen } from "@/components/loading-screen"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, Sparkles, TrendingUp, TrendingDown, Users, Megaphone } from "lucide-react"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, LineChart, Legend } from "recharts"

interface Scenario {
  id: string
  name: string
  type: "hire" | "marketing" | "revenue" | "custom"
  amount: number
  startMonth: number
}

export default function ScenariosPage() {
  const [loading, setLoading] = useState(true)
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [newScenarioType, setNewScenarioType] = useState<Scenario["type"]>("hire")
  const [newScenarioAmount, setNewScenarioAmount] = useState(0)
  const [newScenarioMonth, setNewScenarioMonth] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  const baseData = {
    cashBalance: 70000,
    monthlyBurn: 82000,
    monthlyRevenue: 35000,
  }

  const generateBaselineForecast = () => {
    const months = []
    let currentCash = baseData.cashBalance
    for (let i = 0; i <= 12; i++) {
      const netBurn = baseData.monthlyBurn - baseData.monthlyRevenue
      months.push({
        month: i,
        baseline: Math.max(0, currentCash),
      })
      currentCash -= netBurn
      if (currentCash <= 0) break
    }
    return months
  }

  const generateScenarioForecast = () => {
    const months = []
    let currentCash = baseData.cashBalance
    let currentBurn = baseData.monthlyBurn
    let currentRevenue = baseData.monthlyRevenue

    for (let i = 0; i <= 12; i++) {
      // Apply scenarios that start this month
      scenarios.forEach((scenario) => {
        if (scenario.startMonth === i) {
          if (scenario.type === "hire" || scenario.type === "marketing") {
            currentBurn += scenario.amount
          } else if (scenario.type === "revenue") {
            currentRevenue += scenario.amount
          } else if (scenario.type === "custom") {
            currentBurn += scenario.amount
          }
        }
      })

      const netBurn = currentBurn - currentRevenue
      months.push({
        month: i,
        scenario: Math.max(0, currentCash),
      })
      currentCash -= netBurn
      if (currentCash <= 0) break
    }
    return months
  }

  const baselineForecast = generateBaselineForecast()
  const scenarioForecast = generateScenarioForecast()

  // Merge forecasts
  const combinedForecast = baselineForecast.map((base, i) => ({
    ...base,
    scenario: scenarioForecast[i]?.scenario || 0,
  }))

  const baselineRunway = baselineForecast.findIndex((d) => d.baseline === 0) || 12
  const scenarioRunway = scenarioForecast.findIndex((d) => d.scenario === 0) || 12
  const runwayDiff = scenarioRunway - baselineRunway

  const addScenario = () => {
    if (newScenarioAmount === 0) return
    const newScenario: Scenario = {
      id: Math.random().toString(36).substr(2, 9),
      name: `${newScenarioType.charAt(0).toUpperCase() + newScenarioType.slice(1)} Scenario`,
      type: newScenarioType,
      amount: newScenarioAmount,
      startMonth: newScenarioMonth,
    }
    setScenarios([...scenarios, newScenario])
    setNewScenarioAmount(0)
  }

  const removeScenario = (id: string) => {
    setScenarios(scenarios.filter((s) => s.id !== id))
  }

  const getScenarioIcon = (type: Scenario["type"]) => {
    switch (type) {
      case "hire":
        return <Users className="h-4 w-4" />
      case "marketing":
        return <Megaphone className="h-4 w-4" />
      case "revenue":
        return <TrendingUp className="h-4 w-4" />
      default:
        return <Sparkles className="h-4 w-4" />
    }
  }

  if (loading) {
    return <LoadingScreen />
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Scenario Modeling</h1>
          <p className="text-muted-foreground">Model the impact of business decisions on your runway</p>
        </div>

        {/* Impact Summary */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card className="border-2 border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Baseline Runway</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{baselineRunway.toFixed(1)} months</div>
              <p className="text-sm text-muted-foreground mt-1">Current trajectory</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-secondary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Scenario Runway</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{scenarioRunway.toFixed(1)} months</div>
              <p className="text-sm text-muted-foreground mt-1">With applied scenarios</p>
            </CardContent>
          </Card>

          <Card
            className={`border-2 ${runwayDiff >= 0 ? "border-accent/50 bg-gradient-to-br from-accent/10 to-transparent" : "border-destructive/50 bg-gradient-to-br from-destructive/10 to-transparent"}`}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Impact</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${runwayDiff >= 0 ? "text-accent" : "text-destructive"}`}>
                {runwayDiff >= 0 ? "+" : ""}
                {runwayDiff.toFixed(1)} months
              </div>
              <div className="flex items-center gap-1 text-sm mt-1">
                {runwayDiff >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-accent" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-destructive" />
                )}
                <span className={runwayDiff >= 0 ? "text-accent" : "text-destructive"}>
                  {runwayDiff >= 0 ? "Extends" : "Reduces"} runway
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Insights */}
        {scenarios.length > 0 && (
          <Card className="mb-8 border-2 border-accent/50 bg-gradient-to-r from-accent/10 to-secondary/10">
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 animate-pulse-glow">
                  <Sparkles className="h-5 w-5 text-accent" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2">AI Scenario Analysis</CardTitle>
                  <CardDescription className="text-base">
                    {runwayDiff < 0 ? (
                      <span className="text-foreground">
                        <strong className="text-destructive">Warning:</strong> Your scenarios reduce runway by{" "}
                        {Math.abs(runwayDiff).toFixed(1)} months. Consider delaying new hires or increasing revenue
                        targets to maintain financial stability.
                      </span>
                    ) : (
                      <span className="text-foreground">
                        <strong className="text-accent">Positive Impact:</strong> Your scenarios extend runway by{" "}
                        {runwayDiff.toFixed(1)} months. This gives you more breathing room for product development and
                        fundraising.
                      </span>
                    )}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        )}

        {/* Comparison Chart */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Runway Comparison</CardTitle>
            <CardDescription>Baseline vs. scenario forecast</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={combinedForecast}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="month"
                  stroke="hsl(var(--muted-foreground))"
                  label={{ value: "Months from now", position: "insideBottom", offset: -5 }}
                />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number) => `$${value.toLocaleString()}`}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="baseline"
                  stroke="hsl(var(--muted-foreground))"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Baseline"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="scenario"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  name="With Scenarios"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Add Scenario */}
          <Card>
            <CardHeader>
              <CardTitle>Add New Scenario</CardTitle>
              <CardDescription>Model a potential business decision</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="type">Scenario Type</Label>
                <Select value={newScenarioType} onValueChange={(v) => setNewScenarioType(v as Scenario["type"])}>
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hire">New Hire (Increases Burn)</SelectItem>
                    <SelectItem value="marketing">Marketing Campaign (Increases Burn)</SelectItem>
                    <SelectItem value="revenue">Revenue Increase</SelectItem>
                    <SelectItem value="custom">Custom Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Monthly Amount ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={newScenarioAmount}
                  onChange={(e) => setNewScenarioAmount(Number(e.target.value))}
                  placeholder="e.g., 10000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="startMonth">Start Month</Label>
                <Select value={newScenarioMonth.toString()} onValueChange={(v) => setNewScenarioMonth(Number(v))}>
                  <SelectTrigger id="startMonth">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => (
                      <SelectItem key={i} value={i.toString()}>
                        Month {i} {i === 0 && "(Now)"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={addScenario} className="w-full bg-gradient-to-r from-primary to-secondary">
                <Plus className="mr-2 h-4 w-4" />
                Add Scenario
              </Button>
            </CardContent>
          </Card>

          {/* Active Scenarios */}
          <Card>
            <CardHeader>
              <CardTitle>Active Scenarios</CardTitle>
              <CardDescription>
                {scenarios.length === 0 ? "No scenarios added yet" : `${scenarios.length} scenario(s) applied`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {scenarios.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Add scenarios to see their impact on your runway</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {scenarios.map((scenario) => (
                    <div
                      key={scenario.id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          {getScenarioIcon(scenario.type)}
                        </div>
                        <div>
                          <p className="font-medium">{scenario.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {scenario.type === "revenue" ? "+" : "-"}${scenario.amount.toLocaleString()}/mo starting
                            month {scenario.startMonth}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => removeScenario(scenario.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
