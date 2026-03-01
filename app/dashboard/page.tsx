"use client"

import { useState, useEffect } from "react"
import { LoadingScreen } from "@/components/loading-screen"
import { RealDataLoader } from "@/components/real-data-loader"
import { DashboardNotificationsWidget } from "@/components/dashboard-notifications-widget"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Download,
  Filter,
  RefreshCw,
} from "lucide-react"
import {
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  ComposedChart,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Cell,
} from "recharts"
import html2canvas from "html2canvas"

export default function DashboardPage() {
  const [loading, setLoading] = useState(true) // Show signature loading animation
  const [isExiting, setIsExiting] = useState(false) // For smooth fade-out
  const [selectedPeriod, setSelectedPeriod] = useState("6m")

  useEffect(() => {
    // Brief display for loading screen (1s) so dashboard content appears sooner
    const minLoadTime = setTimeout(() => {
      setIsExiting(true)
      setTimeout(() => setLoading(false), 500)
    }, 1000)

    return () => clearTimeout(minLoadTime)
  }, [])

  const cashFlowData = [
    { month: "Jan", cash: 450000, burn: 75000, revenue: 12000, netCashFlow: -63000 },
    { month: "Feb", cash: 375000, burn: 78000, revenue: 15000, netCashFlow: -63000 },
    { month: "Mar", cash: 297000, burn: 72000, revenue: 18000, netCashFlow: -54000 },
    { month: "Apr", cash: 225000, burn: 75000, revenue: 22000, netCashFlow: -53000 },
    { month: "May", cash: 150000, burn: 80000, revenue: 28000, netCashFlow: -52000 },
    { month: "Jun", cash: 70000, burn: 82000, revenue: 35000, netCashFlow: -47000 },
  ]

  const expenseBreakdown = [
    { category: "Payroll", amount: 45000, percentage: 55, trend: 2 },
    { category: "Marketing", amount: 18000, percentage: 22, trend: 15 },
    { category: "Infrastructure", amount: 8000, percentage: 10, trend: -5 },
    { category: "Office", amount: 5000, percentage: 6, trend: 0 },
    { category: "Other", amount: 6000, percentage: 7, trend: 8 },
  ]

  const revenueData = [
    { month: "Jan", revenue: 12000, target: 15000, growth: 0 },
    { month: "Feb", revenue: 15000, target: 18000, growth: 25 },
    { month: "Mar", revenue: 18000, target: 20000, growth: 20 },
    { month: "Apr", revenue: 22000, target: 25000, growth: 22 },
    { month: "May", revenue: 28000, target: 30000, growth: 27 },
    { month: "Jun", revenue: 35000, target: 35000, growth: 25 },
  ]

  const financialHealthData = [
    { metric: "Revenue Growth", value: 85, fullMark: 100 },
    { metric: "Cash Position", value: 25, fullMark: 100 },
    { metric: "Burn Efficiency", value: 60, fullMark: 100 },
    { metric: "Customer Retention", value: 90, fullMark: 100 },
    { metric: "Gross Margin", value: 75, fullMark: 100 },
    { metric: "Market Position", value: 70, fullMark: 100 },
  ]

  const cohortData = [
    { cohort: "Jan 2024", month1: 100, month2: 85, month3: 78, month4: 72, month5: 68, month6: 65 },
    { cohort: "Feb 2024", month1: 100, month2: 88, month3: 82, month4: 78, month5: 75 },
    { cohort: "Mar 2024", month1: 100, month2: 90, month3: 85, month4: 82 },
    { cohort: "Apr 2024", month1: 100, month2: 92, month3: 88 },
    { cohort: "May 2024", month1: 100, month2: 93 },
    { cohort: "Jun 2024", month1: 100 },
  ]

  const downloadChartAsImage = async (elementId: string, filename: string) => {
    const element = document.getElementById(elementId)
    if (element) {
      const canvas = await html2canvas(element, {
        backgroundColor: "#ffffff",
        scale: 2,
      })
      const link = document.createElement("a")
      link.download = `${filename}.jpg`
      link.href = canvas.toDataURL("image/jpeg", 0.95)
      link.click()
    }
  }

  if (loading) {
    return <LoadingScreen isExiting={isExiting} />
  }

  return (
    <div className="page-transition">
      <div className="container py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Strategic Financial Dashboard</h1>
            <p className="text-muted-foreground">Finance × Growth at a glance — runway, revenue, burn efficiency, and key metrics for data-driven scaling</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <RealDataLoader />
            <div className="flex items-center gap-2 border border-border rounded-lg p-1">
              {["1m", "3m", "6m", "1y"].map((period) => (
                <Button
                  key={period}
                  variant={selectedPeriod === period ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedPeriod(period)}
                  className={selectedPeriod === period ? "bg-primary" : ""}
                >
                  {period}
                </Button>
              ))}
            </div>
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </div>
        </div>

        {/* Notification Widget */}
        <div className="mb-8">
          <DashboardNotificationsWidget />
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="health">Health Score</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent hover-lift">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Cash Balance</CardTitle>
                  <DollarSign className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">$70,000</div>
                  <div className="flex items-center gap-1 text-sm text-destructive mt-2">
                    <ArrowDownRight className="h-4 w-4" />
                    <span>-53% from last month</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-destructive/20 bg-gradient-to-br from-destructive/5 to-transparent hover-lift">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Burn Rate</CardTitle>
                  <TrendingDown className="h-4 w-4 text-destructive" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">$82,000</div>
                  <div className="flex items-center gap-1 text-sm text-destructive mt-2">
                    <ArrowUpRight className="h-4 w-4" />
                    <span>+9% from last month</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-accent/20 bg-gradient-to-br from-accent/5 to-transparent hover-lift">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Runway Remaining</CardTitle>
                  <Calendar className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">0.9 months</div>
                  <div className="flex items-center gap-1 text-sm text-destructive mt-2">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Critical - Fundraise now</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-secondary/20 bg-gradient-to-br from-secondary/5 to-transparent hover-lift">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Revenue</CardTitle>
                  <TrendingUp className="h-4 w-4 text-secondary" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">$35,000</div>
                  <div className="flex items-center gap-1 text-sm text-success mt-2">
                    <ArrowUpRight className="h-4 w-4" />
                    <span>+25% from last month</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="animate-scale-in">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Cash Flow Trend</CardTitle>
                    <CardDescription>6-month cash balance history</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadChartAsImage("cash-flow-chart", "cash-flow-trend")}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    JPG
                  </Button>
                </CardHeader>
                <CardContent id="cash-flow-chart">
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={cashFlowData}>
                      <defs>
                        <linearGradient id="colorCash" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.7} />
                          <stop offset="50%" stopColor="#06b6d4" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                      <XAxis 
                        dataKey="month" 
                        stroke="#f9fafb"
                        style={{ fontSize: '12px', fontWeight: 500, fill: '#f9fafb' }}
                      />
                      <YAxis 
                        stroke="#f9fafb"
                        style={{ fontSize: '12px', fontWeight: 500, fill: '#f9fafb' }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1f2937",
                          border: "2px solid #10b981",
                          borderRadius: "12px",
                          color: "#f9fafb",
                          fontWeight: 600,
                        }}
                        cursor={{stroke: '#10b981', strokeWidth: 2}}
                      />
                      <Area
                        type="monotone"
                        dataKey="cash"
                        stroke="#10b981"
                        strokeWidth={3}
                        fill="url(#colorCash)"
                        animationDuration={1500}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="animate-scale-in [animation-delay:0.1s]">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Expense Breakdown</CardTitle>
                    <CardDescription>Current month spending by category</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadChartAsImage("expense-chart", "expense-breakdown")}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    JPG
                  </Button>
                </CardHeader>
                <CardContent id="expense-chart">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={expenseBreakdown}>
                      <defs>
                        <linearGradient id="colorPayroll" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.9} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.7} />
                        </linearGradient>
                        <linearGradient id="colorMarketing" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.9} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.7} />
                        </linearGradient>
                        <linearGradient id="colorInfra" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.9} />
                          <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.7} />
                        </linearGradient>
                        <linearGradient id="colorOffice" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#a855f7" stopOpacity={0.9} />
                          <stop offset="95%" stopColor="#a855f7" stopOpacity={0.7} />
                        </linearGradient>
                        <linearGradient id="colorOther" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f97316" stopOpacity={0.9} />
                          <stop offset="95%" stopColor="#f97316" stopOpacity={0.7} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                      <XAxis 
                        dataKey="category" 
                        stroke="#f9fafb"
                        style={{ fontSize: '12px', fontWeight: 500, fill: '#f9fafb' }}
                      />
                      <YAxis 
                        stroke="#f9fafb"
                        style={{ fontSize: '12px', fontWeight: 500, fill: '#f9fafb' }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1f2937",
                          border: "2px solid #10b981",
                          borderRadius: "12px",
                          color: "#f9fafb",
                          fontWeight: 600,
                        }}
                        cursor={{fill: '#06b6d4', opacity: 0.1}}
                      />
                      <Bar 
                        dataKey="amount" 
                        radius={[12, 12, 0, 0]}
                        stroke="hsl(var(--foreground))"
                        strokeWidth={0.5}
                      >
                        {expenseBreakdown.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={`url(#${['colorPayroll', 'colorMarketing', 'colorInfra', 'colorOffice', 'colorOther'][index]})`}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="cashflow" className="space-y-6">
            <Card className="animate-scale-in">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Net Cash Flow Analysis</CardTitle>
                  <CardDescription>Revenue vs burn rate with net cash flow</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadChartAsImage("net-cashflow-chart", "net-cashflow-analysis")}
                >
                  <Download className="h-4 w-4 mr-2" />
                  JPG
                </Button>
              </CardHeader>
              <CardContent id="net-cashflow-chart">
                <ResponsiveContainer width="100%" height={400}>
                  <ComposedChart data={cashFlowData}>
                    <defs>
                      <linearGradient id="colorRevenueBar" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.9} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.6} />
                      </linearGradient>
                      <linearGradient id="colorBurnBar" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.9} />
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0.6} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                    <XAxis 
                      dataKey="month" 
                      stroke="#f9fafb"
                      style={{ fontSize: '12px', fontWeight: 500, fill: '#f9fafb' }}
                    />
                    <YAxis 
                      stroke="#f9fafb"
                      style={{ fontSize: '12px', fontWeight: 500, fill: '#f9fafb' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1f2937",
                        border: "2px solid #10b981",
                        borderRadius: "12px",
                        color: "#f9fafb",
                        fontWeight: 600,
                      }}
                    />
                    <Legend 
                      wrapperStyle={{
                        color: "#f9fafb",
                        fontWeight: 600,
                        fontSize: '14px'
                      }}
                    />
                    <Bar 
                      dataKey="revenue" 
                      fill="url(#colorRevenueBar)" 
                      name="Revenue" 
                      radius={[8, 8, 0, 0]}
                    />
                    <Bar 
                      dataKey="burn" 
                      fill="url(#colorBurnBar)" 
                      name="Burn Rate" 
                      radius={[8, 8, 0, 0]}
                    />
                    <Line
                      type="monotone"
                      dataKey="netCashFlow"
                      stroke="#a855f7"
                      strokeWidth={4}
                      name="Net Cash Flow"
                      dot={{ fill: '#a855f7', r: 5 }}
                      activeDot={{ r: 8 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-6">
            <Card className="animate-scale-in">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Revenue Growth vs Target</CardTitle>
                  <CardDescription>Monthly recurring revenue performance</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadChartAsImage("revenue-chart", "revenue-growth")}
                >
                  <Download className="h-4 w-4 mr-2" />
                  JPG
                </Button>
              </CardHeader>
              <CardContent id="revenue-chart">
                <ResponsiveContainer width="100%" height={400}>
                  <ComposedChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.7} />
                        <stop offset="50%" stopColor="#06b6d4" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                    <XAxis 
                      dataKey="month" 
                      stroke="#f9fafb"
                      style={{ fontSize: '12px', fontWeight: 500, fill: '#f9fafb' }}
                    />
                    <YAxis 
                      stroke="#f9fafb"
                      style={{ fontSize: '12px', fontWeight: 500, fill: '#f9fafb' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1f2937",
                        border: "2px solid #10b981",
                        borderRadius: "12px",
                        color: "#f9fafb",
                        fontWeight: 600,
                      }}
                    />
                    <Legend 
                      wrapperStyle={{
                        color: "#f9fafb",
                        fontWeight: 600,
                        fontSize: '14px'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#10b981"
                      strokeWidth={4}
                      fill="url(#colorRevenue)"
                      name="Actual Revenue"
                      animationDuration={1500}
                    />
                    <Line
                      type="monotone"
                      dataKey="target"
                      stroke="#fbbf24"
                      strokeWidth={3}
                      strokeDasharray="8 4"
                      name="Target"
                      dot={{ fill: '#fbbf24', r: 4 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="expenses" className="space-y-6">
            <Card className="animate-scale-in">
              <CardHeader>
                <CardTitle>Expense Category Analysis</CardTitle>
                <CardDescription>Detailed breakdown with trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {expenseBreakdown.map((expense, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="font-medium">{expense.category}</span>
                          <Badge
                            variant={expense.trend > 0 ? "destructive" : expense.trend < 0 ? "default" : "secondary"}
                          >
                            {expense.trend > 0 ? "+" : ""}
                            {expense.trend}%
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">${expense.amount.toLocaleString()}</div>
                          <div className="text-sm text-muted-foreground">{expense.percentage}% of total</div>
                        </div>
                      </div>
                      <div className="h-3 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-secondary to-primary transition-all duration-500"
                          style={{ width: `${expense.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="health" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="animate-scale-in">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Financial Health Score</CardTitle>
                    <CardDescription>Multi-dimensional performance analysis</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadChartAsImage("health-radar-chart", "financial-health-score")}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    JPG
                  </Button>
                </CardHeader>
                <CardContent id="health-radar-chart">
                  <ResponsiveContainer width="100%" height={400}>
                    <RadarChart data={financialHealthData}>
                      <defs>
                        <linearGradient id="colorRadar" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity={0.7} />
                          <stop offset="50%" stopColor="#06b6d4" stopOpacity={0.5} />
                          <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.3} />
                        </linearGradient>
                      </defs>
                      <PolarGrid 
                        stroke="#374151" 
                        strokeWidth={1.5}
                        opacity={0.5}
                      />
                      <PolarAngleAxis 
                        dataKey="metric" 
                        stroke="#f9fafb"
                        style={{ fontSize: '12px', fontWeight: 600, fill: '#f9fafb' }}
                      />
                      <PolarRadiusAxis 
                        stroke="#f9fafb"
                        style={{ fontSize: '11px', fontWeight: 500, fill: '#f9fafb' }}
                        angle={90}
                      />
                      <Radar
                        name="Score"
                        dataKey="value"
                        stroke="#10b981"
                        fill="url(#colorRadar)"
                        fillOpacity={0.7}
                        strokeWidth={3}
                        dot={{ fill: '#10b981', r: 5 }}
                        animationDuration={1500}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="animate-scale-in [animation-delay:0.1s]">
                <CardHeader>
                  <CardTitle>Health Score Breakdown</CardTitle>
                  <CardDescription>Individual metric performance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {financialHealthData.map((item, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{item.metric}</span>
                        <Badge
                          variant={item.value >= 70 ? "default" : item.value >= 40 ? "secondary" : "destructive"}
                          className={item.value >= 70 ? "bg-success" : ""}
                        >
                          {item.value}/100
                        </Badge>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            item.value >= 70 ? "bg-success" : item.value >= 40 ? "bg-warning" : "bg-destructive"
                          }`}
                          style={{ width: `${item.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* AI Insights Alert */}
        <Card className="mb-8 border-2 border-accent/50 bg-gradient-to-r from-accent/10 to-secondary/10 animate-slide-up">
          <CardHeader>
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-5 w-5 text-accent" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg mb-2">AI Financial Insights</CardTitle>
                <CardDescription className="text-base">
                  <strong className="text-foreground">Critical Alert:</strong> Your runway is critically low at 0.9
                  months. Based on your current burn rate of $82K/month and cash balance of $70K, you should start
                  fundraising immediately. Consider reducing non-essential expenses by 20% to extend runway to 1.5
                  months. Your revenue growth of 25% MoM is strong - highlight this in investor conversations.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Quick Actions */}
        <div className="mt-8 flex flex-wrap gap-4">
          <Button className="bg-gradient-to-r from-primary to-secondary gap-2">
            <Sparkles className="h-4 w-4" />
            Run Scenario Analysis
          </Button>
          <Button variant="outline" className="gap-2 bg-transparent">
            <Download className="h-4 w-4" />
            Export Full Report
          </Button>
          <Button variant="outline" className="gap-2 bg-transparent">
            <TrendingUp className="h-4 w-4" />
            View Detailed Forecast
          </Button>
        </div>
      </div>
    </div>
  )
}
