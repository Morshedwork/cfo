"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { LoadingScreen } from "@/components/loading-screen"
import { AuthNavbar } from "@/components/auth-navbar"
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
import { parseSalesCSV, type SalesAnalytics } from "@/lib/sales-parser"

export default function SalesAnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [isExiting, setIsExiting] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState("30d")
  const [salesAnalytics, setSalesAnalytics] = useState<SalesAnalytics | null>(null)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')

  useEffect(() => {
    // Minimum display time for signature loading screen (2.5 seconds)
    const minLoadTime = setTimeout(() => {
      setIsExiting(true)
      setTimeout(() => setLoading(false), 500)
    }, 2500)
    return () => clearTimeout(minLoadTime)
  }, [])

  // Use parsed data or fallback to mock data
  const salesData = salesAnalytics?.timeSeriesData || [
    { date: "Jan 1", sales: 12500, orders: 45, visitors: 1200 },
    { date: "Jan 8", sales: 15800, orders: 52, visitors: 1450 },
    { date: "Jan 15", sales: 18200, orders: 61, visitors: 1680 },
    { date: "Jan 22", sales: 21500, orders: 68, visitors: 1920 },
    { date: "Jan 29", sales: 24800, orders: 75, visitors: 2150 },
    { date: "Feb 5", sales: 28200, orders: 82, visitors: 2380 },
    { date: "Feb 12", sales: 32500, orders: 91, visitors: 2650 },
  ]

  const productPerformance = salesAnalytics?.productPerformance || [
    { name: "Product A", revenue: 45000, units: 320, growth: 25 },
    { name: "Product B", revenue: 38000, units: 280, growth: 18 },
    { name: "Product C", revenue: 32000, units: 245, growth: 32 },
    { name: "Product D", revenue: 28000, units: 210, growth: -5 },
    { name: "Product E", revenue: 22000, units: 180, growth: 12 },
  ]

  const channelData = salesAnalytics?.channelDistribution || [
    { name: "Website", value: 45, color: "#3b82f6" },
    { name: "Mobile App", value: 30, color: "#10b981" },
    { name: "Marketplace", value: 15, color: "#f59e0b" },
    { name: "Social", value: 10, color: "#8b5cf6" },
  ]

  const conversionFunnel = salesAnalytics?.conversionFunnel || [
    { stage: "Visitors", count: 15000, percentage: 100 },
    { stage: "Product Views", count: 8500, percentage: 57 },
    { stage: "Add to Cart", count: 3200, percentage: 21 },
    { stage: "Checkout", count: 1800, percentage: 12 },
    { stage: "Purchase", count: 1200, percentage: 8 },
  ]

  const metrics = salesAnalytics?.metrics || {
    totalRevenue: 165000,
    totalOrders: 574,
    avgOrderValue: 287,
    conversionRate: 8.0,
    revenueGrowth: 98,
  }

  const aiInsights = salesAnalytics?.aiInsights || `
    <strong class="text-foreground">Strong Growth Detected:</strong> Your sales have increased 98%
    over the last 7 weeks. Product C is your fastest-growing item (+32%). Consider increasing inventory
    and marketing spend for this product. Your conversion rate of 8% is above industry average.
  `

  const handleExcelUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadStatus('uploading')
    
    try {
      const text = await file.text()
      console.log("[Sales] Processing CSV file:", file.name)
      
      const analytics = parseSalesCSV(text)
      setSalesAnalytics(analytics)
      setUploadStatus('success')
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => setUploadStatus('idle'), 3000)
    } catch (error) {
      console.error("[Sales] Error parsing CSV:", error)
      setUploadStatus('error')
      setTimeout(() => setUploadStatus('idle'), 3000)
    }
  }

  const downloadDemoCSV = () => {
    const link = document.createElement('a')
    link.href = '/demo-sales-data.csv'
    link.download = 'demo-sales-data.csv'
    link.click()
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
    return <LoadingScreen isExiting={isExiting} />
  }

  return (
    <div className="min-h-screen bg-background page-transition">
      <AuthNavbar />

      <div className="container py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Sales & Traction Analytics</h1>
            <p className="text-muted-foreground">Track your sales performance and website metrics in real-time</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2" onClick={downloadDemoCSV}>
              <Download className="h-4 w-4" />
              Download Demo CSV
            </Button>
            <div className="flex items-center gap-2">
              <Label htmlFor="excel-upload" className="cursor-pointer">
                <Button 
                  variant="outline" 
                  className={`gap-2 ${uploadStatus === 'success' ? 'border-green-500 bg-green-50 dark:bg-green-950' : uploadStatus === 'error' ? 'border-red-500 bg-red-50 dark:bg-red-950' : ''}`}
                  asChild
                >
                  <span>
                    <Upload className="h-4 w-4" />
                    {uploadStatus === 'uploading' ? 'Processing...' : uploadStatus === 'success' ? 'Uploaded!' : uploadStatus === 'error' ? 'Error!' : 'Upload CSV'}
                  </span>
                </Button>
              </Label>
              <Input
                id="excel-upload"
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={handleExcelUpload}
                disabled={uploadStatus === 'uploading'}
              />
            </div>
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
                <CardDescription 
                  className="text-base"
                  dangerouslySetInnerHTML={{ __html: aiInsights }}
                />
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
              <div className="text-3xl font-bold text-foreground">
                ${metrics.totalRevenue.toLocaleString()}
              </div>
              <div className="flex items-center gap-1 text-sm text-success mt-2">
                <ArrowUpRight className="h-4 w-4" />
                <span>+{metrics.revenueGrowth}% from last period</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-secondary/20 bg-gradient-to-br from-secondary/5 to-transparent hover-lift">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {metrics.totalOrders.toLocaleString()}
              </div>
              <div className="flex items-center gap-1 text-sm text-success mt-2">
                <ArrowUpRight className="h-4 w-4" />
                <span>Strong performance</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-accent/20 bg-gradient-to-br from-accent/5 to-transparent hover-lift">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Order Value</CardTitle>
              <BarChart3 className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                ${metrics.avgOrderValue.toFixed(2)}
              </div>
              <div className="flex items-center gap-1 text-sm text-success mt-2">
                <ArrowUpRight className="h-4 w-4" />
                <span>Healthy pricing</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-chart-4/20 bg-gradient-to-br from-chart-4/5 to-transparent hover-lift">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Conversion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-chart-4" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {metrics.conversionRate.toFixed(1)}%
              </div>
              <div className="flex items-center gap-1 text-sm text-success mt-2">
                <ArrowUpRight className="h-4 w-4" />
                <span>Above industry avg</span>
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
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                      <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
                      <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#ffffff",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                        }}
                        labelStyle={{ color: "#111827" }}
                      />
                      <Area
                        type="monotone"
                        dataKey="sales"
                        stroke="#3b82f6"
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
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                      <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
                      <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#ffffff",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                        }}
                        labelStyle={{ color: "#111827" }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="orders"
                        stroke="#10b981"
                        strokeWidth={3}
                        dot={{ fill: "#10b981", r: 5 }}
                        name="Orders"
                      />
                      <Line
                        type="monotone"
                        dataKey="visitors"
                        stroke="#f59e0b"
                        strokeWidth={3}
                        dot={{ fill: "#f59e0b", r: 5 }}
                        name="Visitors"
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
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                    <XAxis type="number" stroke="#6b7280" style={{ fontSize: '12px' }} />
                    <YAxis dataKey="name" type="category" stroke="#6b7280" style={{ fontSize: '12px' }} width={150} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#ffffff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                      }}
                      labelStyle={{ color: "#111827" }}
                    />
                    <Bar dataKey="revenue" fill="#3b82f6" radius={[0, 8, 8, 0]} />
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
                      labelLine={true}
                      label={({ name, value }) => `${name}: ${value}%`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {channelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="#fff" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: "#ffffff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
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
                      <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden relative">
                        <div
                          className="h-full flex items-center justify-center text-white font-semibold transition-all duration-500"
                          style={{ 
                            width: `${stage.percentage}%`,
                            background: 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)'
                          }}
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
