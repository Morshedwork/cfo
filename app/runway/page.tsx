"use client"

import { useState, useEffect } from "react"
import { LoadingScreen } from "@/components/loading-screen"
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
  const [isExiting, setIsExiting] = useState(false)
  const [cashBalance, setCashBalance] = useState(70000)
  const [monthlyBurn, setMonthlyBurn] = useState(82000)
  const [monthlyRevenue, setMonthlyRevenue] = useState(35000)
  const [revenueGrowth, setRevenueGrowth] = useState([5])

  useEffect(() => {
    // Minimum display time for signature loading screen (2.5 seconds)
    const minLoadTime = setTimeout(() => {
      setIsExiting(true)
      setTimeout(() => setLoading(false), 500)
    }, 2500)
    return () => clearTimeout(minLoadTime)
  }, [])

  // Calculate runway
  const netBurn = monthlyBurn - monthlyRevenue
  const runwayMonths = netBurn > 0 ? cashBalance / netBurn : 999

  // Runway status for UI (critical < 1 mo, warning < 3 mo, ok >= 3 mo)
  const runwayStatus =
    runwayMonths < 1 ? "critical" : runwayMonths < 3 ? "warning" : "ok"
  const runwayCut25 = netBurn > 0 ? cashBalance / (netBurn * 0.75) : 999
  const growthPct = revenueGrowth[0]
  const runwayDisplay = runwayMonths >= 999 ? "24+" : runwayMonths > 24 ? "24+" : runwayMonths.toFixed(1)

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
    return <LoadingScreen isExiting={isExiting} />
  }

  return (
    <div className="min-h-full bg-background page-transition">
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
          <Card
            className={
              runwayStatus === "critical"
                ? "border-2 border-destructive/50 bg-gradient-to-br from-destructive/10 to-transparent"
                : runwayStatus === "warning"
                  ? "border-2 border-warning/50 bg-gradient-to-br from-warning/10 to-transparent"
                  : "border-2 border-primary/20 bg-gradient-to-br from-primary/10 to-transparent"
            }
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Current Runway</CardTitle>
              <Calendar
                className={
                  runwayStatus === "critical"
                    ? "h-4 w-4 text-destructive"
                    : runwayStatus === "warning"
                      ? "h-4 w-4 text-warning"
                      : "h-4 w-4 text-primary"
                }
              />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-foreground">{runwayDisplay} months</div>
              <div
                className={`flex items-center gap-1 text-sm mt-2 ${
                  runwayStatus === "critical"
                    ? "text-destructive"
                    : runwayStatus === "warning"
                      ? "text-warning"
                      : "text-primary"
                }`}
              >
                {runwayStatus === "critical" && <AlertTriangle className="h-4 w-4" />}
                <span>
                  {runwayStatus === "critical"
                    ? "Critical — immediate action required"
                    : runwayStatus === "warning"
                      ? "Low runway — consider reducing burn or fundraising"
                      : "Healthy runway"}
                </span>
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
                {runwayMonths >= 24
                  ? "—"
                  : new Date(Date.now() + runwayMonths * 30 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {runwayMonths >= 24 ? "Runway beyond 2 years" : "Based on current burn rate"}
              </p>
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
                  {runwayMonths < 3 && (
                    <div className="flex items-start gap-2">
                      <Badge variant="destructive" className="mt-0.5">
                        Critical
                      </Badge>
                      <p className="text-foreground">
                        <strong>Start fundraising soon.</strong>{" "}
                        {runwayMonths < 1
                          ? "With less than 1 month of runway, you're in the danger zone."
                          : "With under 3 months of runway, you have limited time."}{" "}
                        Most rounds take 3–6 months to close.
                      </p>
                    </div>
                  )}
                  {netBurn > 0 && (
                    <div className="flex items-start gap-2">
                      <Badge variant="secondary" className="mt-0.5">
                        Action
                      </Badge>
                      <p className="text-foreground">
                        <strong>Reduce burn by 25%.</strong> Cutting ${Math.round(netBurn * 0.25).toLocaleString()}/mo
                        would extend runway to {runwayCut25 < 999 ? runwayCut25.toFixed(1) : "∞"} months, giving you
                        more time to fundraise.
                      </p>
                    </div>
                  )}
                  <div className="flex items-start gap-2">
                    <Badge className="mt-0.5 bg-accent text-accent-foreground">Opportunity</Badge>
                    <p className="text-foreground">
                      <strong>Revenue growth is {growthPct}% MoM.</strong>{" "}
                      {growthPct >= 10
                        ? "If you maintain this and reduce burn slightly, you can extend runway and move toward profitability."
                        : "Accelerating revenue growth while controlling burn will improve your runway and investor story."}
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
            <div className="w-full min-h-[400px]">
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={forecastData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                  <defs>
                    <linearGradient id="colorCashForecast" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                      <stop offset="50%" stopColor="#06b6d4" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.15} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted-foreground/30" />
                  <XAxis
                    dataKey="month"
                    className="text-muted-foreground"
                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                    stroke="hsl(var(--muted-foreground))"
                    label={{
                      value: "Months from now",
                      position: "insideBottom",
                      offset: -5,
                      style: { fill: "hsl(var(--muted-foreground))", fontWeight: 600 },
                    }}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                    tickFormatter={(v) => (v >= 1000 ? `$${v / 1000}k` : `$${v}`)}
                    width={52}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "2px solid #10b981",
                      borderRadius: "12px",
                      color: "#f9fafb",
                      fontWeight: 600,
                    }}
                    labelFormatter={(month) => `Month ${month}`}
                    formatter={(value: number) => [`$${Number(value).toLocaleString()}`, "Cash"]}
                    cursor={{ stroke: "#10b981", strokeWidth: 2 }}
                  />
                  <ReferenceLine
                    y={0}
                    stroke="#f97316"
                    strokeDasharray="5 5"
                    strokeWidth={2}
                    label={{
                      value: "Zero cash",
                      position: "right",
                      style: { fill: "#f97316", fontWeight: 600 },
                    }}
                  />
                  <ReferenceLine
                    x={runoutMonth}
                    stroke="#f97316"
                    strokeDasharray="5 5"
                    strokeWidth={2}
                    label={{
                      value: "Runout",
                      position: "top",
                      style: { fill: "#f97316", fontWeight: 700, fontSize: 13 },
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="cash"
                    stroke="#10b981"
                    strokeWidth={4}
                    fill="url(#colorCashForecast)"
                    animationDuration={1500}
                    dot={{ fill: "#10b981", r: 4 }}
                    activeDot={{ r: 7, fill: "#10b981" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
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
                  min={0}
                  step={1000}
                  value={cashBalance}
                  onChange={(e) => setCashBalance(Number(e.target.value) || 0)}
                  className="text-lg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="burn">Monthly Burn Rate</Label>
                <Input
                  id="burn"
                  type="number"
                  min={0}
                  step={1000}
                  value={monthlyBurn}
                  onChange={(e) => setMonthlyBurn(Number(e.target.value) || 0)}
                  className="text-lg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="revenue">Monthly Revenue</Label>
                <Input
                  id="revenue"
                  type="number"
                  min={0}
                  step={1000}
                  value={monthlyRevenue}
                  onChange={(e) => setMonthlyRevenue(Number(e.target.value) || 0)}
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
                  min={0}
                  step={1}
                  className="mt-2"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Updated Runway Projection</p>
                  <p className="text-3xl font-bold text-primary mt-1">{runwayDisplay} months</p>
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
