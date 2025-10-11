"use client"

import { useState, useEffect } from "react"
import { LoadingScreen } from "@/components/loading-screen"
import { Navbar } from "@/components/navbar"
import { ExcelManager } from "@/components/excel-manager"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Database, Sparkles, TrendingUp, FileText, Calendar, DollarSign, Tag, CheckCircle2 } from "lucide-react"

export default function DataManagementPage() {
  const [loading, setLoading] = useState(true)
  const [importedData, setImportedData] = useState<any>(null)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500)
    return () => clearTimeout(timer)
  }, [])

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
    return <LoadingScreen />
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Data Management</h1>
          <p className="text-muted-foreground">Import, export, and manage your financial data with AI assistance</p>
        </div>

        {/* AI Insights */}
        {importedData && (
          <Card className="mb-8 border-2 border-accent/50 bg-gradient-to-r from-accent/10 to-secondary/10 animate-slide-up">
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-5 w-5 text-accent" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2">Import Complete</CardTitle>
                  <CardDescription className="text-base">
                    Successfully processed {importedData.rows} rows across {importedData.columns} columns. Identified{" "}
                    {importedData.categories.length} main categories: {importedData.categories.join(", ")}. Date range:{" "}
                    {importedData.dateRange}.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <ExcelManager onDataImport={setImportedData} exportFilename="aura-financial-data" />

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
      </div>
    </div>
  )
}
