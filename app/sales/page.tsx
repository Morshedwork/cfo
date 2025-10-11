"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { LoadingScreen } from "@/components/loading-screen"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  TrendingUp,
  Download,
  Upload,
  Sparkles,
  ShoppingCart,
  DollarSign,
  BarChart3,
  Globe,
  ArrowUpRight,
  FileSpreadsheet,
  Plus,
} from "lucide-react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import html2canvas from "html2canvas"

export default function SalesAnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState("30d")

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  // Mock sales data
  const salesData = [
    { date: "Jan 1", sales: 12500, orders: 45, visitors: 1200 },
    { date: "Jan 8", sales: 15800, orders: 52, visitors: 1450 },
    { date: "Jan 15", sales: 18200, orders: 61, visitors: 1680 },
    { date: "Jan 22", sales: 21500, orders: 68, visitors: 1920 },
    { date: "Jan 29", sales: 24800, orders: 75, visitors: 2150 },
    { date: "Feb 5", sales: 28200, orders: 82, visitors: 2380 },
    { date: "Feb 12", sales: 32500, orders: 91, visitors: 2650 },
  ]

  const productPerformance = [
    { name: "Product A", revenue: 45000, units: 320, growth: 25 },
    { name: "Product B", revenue: 38000, units: 280, growth: 18 },
    { name: "Product C", revenue: 32000, units: 245, growth: 32 },
    { name: "Product D", revenue: 28000, units: 210, growth: -5 },
    { name: "Product E", revenue: 22000, units: 180, growth: 12 },
  ]

  const channelData = [
    { name: "Website", value: 45, color: "hsl(var(--chart-1))" },
    { name: "Mobile App", value: 30, color: "hsl(var(--chart-2))" },
    { name: "Marketplace", value: 15, color: "hsl(var(--chart-3))" },
    { name: "Social", value: 10, color: "hsl(var(--chart-4))" },
  ]

  const conversionFunnel = [
    { stage: "Visitors", count: 15000, percentage: 100 },
    { stage: "Product Views", count: 8500, percentage: 57 },
    { stage: "Add to Cart", count: 3200, percentage: 21 },
    { stage: "Checkout", count: 1800, percentage: 12 },
    { stage: "Purchase", count: 1200, percentage: 8 },
  ]

  const handleExcelUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Simulate file processing
      console.log("[v0] Processing Excel file:", file.name)
      alert(`Excel file "${file.name}" uploaded successfully! AI is analyzing your sales data...`)
    }
  }

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
    return <LoadingScreen />
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Sales & Traction Analytics</h1>
            <p className="text-muted-foreground">Track your sales performance and website metrics in real-time</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Label htmlFor="excel-upload" className="cursor-pointer">
                <Button variant="outline" className="gap-2 bg-transparent" asChild>
                  <span>
                    <Upload className="h-4 w-4" />
                    Import Excel
                  </span>
                </Button>
              </Label>
              <Input
                id="excel-upload"
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={handleExcelUpload}
              />
            </div>
            <Button className="gap-2 bg-gradient-to-r from-primary to-secondary">
              <Plus className="h-4 w-4" />
              Add Data Source
            </Button>
          </div>
        </div>

        {/* AI Insights */}
        <Card className="mb-8 border-2 border-accent/50 bg-gradient-to-r from-accent/10 to-secondary/10 animate-slide-up">
          <CardHeader>
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-5 w-5 text-accent" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg mb-2">AI Sales Insights</CardTitle>
                <CardDescription className="text-base">
                  <strong className="text-foreground">Strong Growth Detected:</strong> Your sales have increased 98%
                  over the last 7 weeks. Product C is your fastest-growing item (+32%). Consider increasing inventory
                  and marketing spend for this product. Your conversion rate of 8% is above industry average.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Key Metrics */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent hover-lift">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">$165,000</div>
              <div className="flex items-center gap-1 text-sm text-success mt-2">
                <ArrowUpRight className="h-4 w-4" />
                <span>+98% from last period</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-secondary/20 bg-gradient-to-br from-secondary/5 to-transparent hover-lift">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">574</div>
              <div className="flex items-center gap-1 text-sm text-success mt-2">
                <ArrowUpRight className="h-4 w-4" />
                <span>+67% from last period</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-accent/20 bg-gradient-to-br from-accent/5 to-transparent hover-lift">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Order Value</CardTitle>
              <BarChart3 className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">$287</div>
              <div className="flex items-center gap-1 text-sm text-success mt-2">
                <ArrowUpRight className="h-4 w-4" />
                <span>+18% from last period</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-chart-4/20 bg-gradient-to-br from-chart-4/5 to-transparent hover-lift">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Conversion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-chart-4" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">8.0%</div>
              <div className="flex items-center gap-1 text-sm text-success mt-2">
                <ArrowUpRight className="h-4 w-4" />
                <span>+1.2% from last period</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="channels">Channels</TabsTrigger>
            <TabsTrigger value="funnel">Funnel</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="animate-scale-in">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Sales Trend</CardTitle>
                    <CardDescription>Revenue over time</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadChartAsImage("sales-trend-chart", "sales-trend")}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    JPG
                  </Button>
                </CardHeader>
                <CardContent id="sales-trend-chart">
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={salesData}>
                      <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="sales"
                        stroke="hsl(var(--primary))"
                        strokeWidth={3}
                        fill="url(#colorSales)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="animate-scale-in [animation-delay:0.1s]">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Orders & Traffic</CardTitle>
                    <CardDescription>Orders vs website visitors</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadChartAsImage("orders-traffic-chart", "orders-traffic")}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    JPG
                  </Button>
                </CardHeader>
                <CardContent id="orders-traffic-chart">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="orders"
                        stroke="hsl(var(--secondary))"
                        strokeWidth={3}
                        dot={{ fill: "hsl(var(--secondary))", r: 4 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="visitors"
                        stroke="hsl(var(--accent))"
                        strokeWidth={3}
                        dot={{ fill: "hsl(var(--accent))", r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <Card className="animate-scale-in">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Product Performance</CardTitle>
                  <CardDescription>Revenue by product with growth rates</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadChartAsImage("product-performance-chart", "product-performance")}
                >
                  <Download className="h-4 w-4 mr-2" />
                  JPG
                </Button>
              </CardHeader>
              <CardContent id="product-performance-chart">
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={productPerformance} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                    <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-6 space-y-3">
                  {productPerformance.map((product, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">{product.units} units sold</p>
                      </div>
                      <Badge
                        variant={product.growth > 0 ? "default" : "destructive"}
                        className={product.growth > 0 ? "bg-success" : ""}
                      >
                        {product.growth > 0 ? "+" : ""}
                        {product.growth}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="channels" className="space-y-6">
            <Card className="animate-scale-in">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Sales Channels</CardTitle>
                  <CardDescription>Revenue distribution by channel</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadChartAsImage("channels-chart", "sales-channels")}
                >
                  <Download className="h-4 w-4 mr-2" />
                  JPG
                </Button>
              </CardHeader>
              <CardContent id="channels-chart">
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={channelData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}%`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {channelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="funnel" className="space-y-6">
            <Card className="animate-scale-in">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Conversion Funnel</CardTitle>
                  <CardDescription>Customer journey from visit to purchase</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadChartAsImage("funnel-chart", "conversion-funnel")}
                >
                  <Download className="h-4 w-4 mr-2" />
                  JPG
                </Button>
              </CardHeader>
              <CardContent id="funnel-chart">
                <div className="space-y-4">
                  {conversionFunnel.map((stage, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{stage.stage}</span>
                        <span className="text-muted-foreground">
                          {stage.count.toLocaleString()} ({stage.percentage}%)
                        </span>
                      </div>
                      <div className="h-12 bg-muted rounded-lg overflow-hidden relative">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-primary-foreground font-semibold transition-all duration-500"
                          style={{ width: `${stage.percentage}%` }}
                        >
                          {stage.percentage}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Integration Options */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Data Sources & Integrations</CardTitle>
            <CardDescription>Connect your sales platforms to track data automatically</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-auto py-6 flex-col gap-2 bg-transparent">
                <Globe className="h-8 w-8 text-primary" />
                <span className="font-semibold">Website Analytics</span>
                <span className="text-xs text-muted-foreground">Google Analytics, Plausible</span>
              </Button>
              <Button variant="outline" className="h-auto py-6 flex-col gap-2 bg-transparent">
                <ShoppingCart className="h-8 w-8 text-secondary" />
                <span className="font-semibold">E-commerce</span>
                <span className="text-xs text-muted-foreground">Shopify, WooCommerce</span>
              </Button>
              <Button variant="outline" className="h-auto py-6 flex-col gap-2 bg-transparent">
                <FileSpreadsheet className="h-8 w-8 text-accent" />
                <span className="font-semibold">Manual Upload</span>
                <span className="text-xs text-muted-foreground">Excel, CSV files</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
