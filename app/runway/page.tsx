"use client"

import { useState, useEffect } from "react"
import { LoadingScreen } from "@/components/loading-screen"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Calendar, TrendingDown, AlertTriangle, Sparkles, RefreshCw } from "lucide-react"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area, AreaChart } from "recharts"

export default function RunwayPage() {
  const [loading, setLoading] = useState(true)
  const [cashBalance, setCashBalance] = useState(70000)
  const [monthlyBurn, setMonthlyBurn] = useState(82000)
  const [monthlyRevenue, setMonthlyRevenue] = useState(35000)
  const [revenueGrowth, setRevenueGrowth] = useState([5])

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  // Calculate runway
  const netBurn = monthlyBurn - monthlyRevenue
  const runwayMonths = netBurn > 0 ? cashBalance / netBurn : 999

  // Generate forecast data
  const generateForecast = () => {
    const months = []
    let currentCash = cashBalance
    let currentRevenue = monthlyRevenue
    const growthRate = revenueGrowth[0] / 100

    for (let i = 0; i <= 12; i++) {
      const netBurnForMonth = monthlyBurn - currentRevenue
      months.push({
        month: i,
        cash: Math.max(0, currentCash),
        revenue: currentRevenue,
        burn: monthlyBurn,
      })
      currentCash -= netBurnForMonth
      currentRevenue *= 1 + growthRate
      if (currentCash <= 0) break
    }
    return months
  }

  const forecastData = generateForecast()
  const runoutMonth = forecastData.find((d) => d.cash === 0)?.month || 12

  if (loading) {
    return <LoadingScreen />
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Runway Forecasting</h1>
            <p className="text-muted-foreground">Real-time cash runway analysis and projections</p>
          </div>
          <Button variant="outline" className="gap-2 bg-transparent">
            <RefreshCw className="h-4 w-4" />
            Sync Accounts
          </Button>
        </div>

        {/* Key Runway Metrics */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card className="border-2 border-destructive/50 bg-gradient-to-br from-destructive/10 to-transparent">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Current Runway</CardTitle>
              <Calendar className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-foreground">{runwayMonths.toFixed(1)} months</div>
              <div className="flex items-center gap-1 text-sm text-destructive mt-2">
                <AlertTriangle className="h-4 w-4" />
                <span>Critical - Immediate action required</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Projected Runout Date</CardTitle>
              <Calendar className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {new Date(Date.now() + runwayMonths * 30 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </div>
              <p className="text-sm text-muted-foreground mt-2">Based on current burn rate</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-secondary/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Net Monthly Burn</CardTitle>
              <TrendingDown className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">${netBurn.toLocaleString()}</div>
              <p className="text-sm text-muted-foreground mt-2">Expenses minus revenue</p>
            </CardContent>
          </Card>
        </div>

        {/* AI Recommendations */}
        <Card className="mb-8 border-2 border-accent/50 bg-gradient-to-r from-accent/10 to-secondary/10">
          <CardHeader>
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 animate-pulse-glow">
                <Sparkles className="h-5 w-5 text-accent" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg mb-2">AI Runway Recommendations</CardTitle>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <Badge variant="destructive" className="mt-0.5">
                      Critical
                    </Badge>
                    <p className="text-foreground">
                      <strong>Start fundraising immediately.</strong> With less than 1 month of runway, you're in the
                      danger zone. Most fundraising rounds take 3-6 months to close.
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge variant="secondary" className="mt-0.5">
                      Action
                    </Badge>
                    <p className="text-foreground">
                      <strong>Reduce burn by 25%.</strong> Cutting $20K/month in expenses would extend your runway to
                      1.4 months, giving you more time to fundraise.
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge className="mt-0.5 bg-accent text-accent-foreground">Opportunity</Badge>
                    <p className="text-foreground">
                      <strong>Your revenue is growing at 25% MoM.</strong> If you can maintain this growth and reduce
                      burn slightly, you could reach profitability in 8-10 months.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Runway Forecast Chart */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>12-Month Cash Runway Forecast</CardTitle>
            <CardDescription>Projected cash balance based on current burn rate and revenue growth</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={forecastData}>
                <defs>
                  <linearGradient id="colorCashForecast" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
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
                <ReferenceLine y={0} stroke="hsl(var(--destructive))" strokeDasharray="3 3" />
                <ReferenceLine
                  x={runoutMonth}
                  stroke="hsl(var(--destructive))"
                  strokeDasharray="3 3"
                  label={{ value: "Runout", position: "top" }}
                />
                <Area
                  type="monotone"
                  dataKey="cash"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  fill="url(#colorCashForecast)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Interactive Adjustments */}
        <Card>
          <CardHeader>
            <CardTitle>Adjust Your Assumptions</CardTitle>
            <CardDescription>See how changes to your finances impact runway in real-time</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="cash">Current Cash Balance</Label>
                <Input
                  id="cash"
                  type="number"
                  value={cashBalance}
                  onChange={(e) => setCashBalance(Number(e.target.value))}
                  className="text-lg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="burn">Monthly Burn Rate</Label>
                <Input
                  id="burn"
                  type="number"
                  value={monthlyBurn}
                  onChange={(e) => setMonthlyBurn(Number(e.target.value))}
                  className="text-lg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="revenue">Monthly Revenue</Label>
                <Input
                  id="revenue"
                  type="number"
                  value={monthlyRevenue}
                  onChange={(e) => setMonthlyRevenue(Number(e.target.value))}
                  className="text-lg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="growth">Monthly Revenue Growth Rate: {revenueGrowth[0]}%</Label>
                <Slider
                  id="growth"
                  value={revenueGrowth}
                  onValueChange={setRevenueGrowth}
                  max={30}
                  step={1}
                  className="mt-2"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Updated Runway Projection</p>
                  <p className="text-3xl font-bold text-primary mt-1">{runwayMonths.toFixed(1)} months</p>
                </div>
                <Button className="bg-gradient-to-r from-primary to-secondary">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Save Scenario
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
