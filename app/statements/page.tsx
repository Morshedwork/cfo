"use client"

import { useState, useEffect } from "react"
import { LoadingScreen } from "@/components/loading-screen"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, FileText, Sparkles, TrendingUp } from "lucide-react"

export default function StatementsPage() {
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState("current")

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  const profitLossData = [
    {
      category: "Revenue",
      items: [
        { name: "Product Sales", amount: 28000 },
        { name: "Service Revenue", amount: 7000 },
      ],
    },
    {
      category: "Cost of Revenue",
      items: [
        { name: "Hosting & Infrastructure", amount: -8000 },
        { name: "Payment Processing", amount: -1200 },
      ],
    },
    {
      category: "Operating Expenses",
      items: [
        { name: "Payroll & Benefits", amount: -45000 },
        { name: "Marketing & Advertising", amount: -18000 },
        { name: "Software & Tools", amount: -3500 },
        { name: "Office & Admin", amount: -5000 },
        { name: "Professional Services", amount: -2300 },
      ],
    },
  ]

  const cashFlowData = [
    {
      category: "Operating Activities",
      items: [
        { name: "Net Income", amount: -47000 },
        { name: "Accounts Receivable", amount: 5000 },
        { name: "Accounts Payable", amount: -3000 },
      ],
    },
    {
      category: "Investing Activities",
      items: [
        { name: "Equipment Purchase", amount: -2000 },
        { name: "Software Licenses", amount: -1500 },
      ],
    },
    {
      category: "Financing Activities",
      items: [
        { name: "Investor Funding", amount: 0 },
        { name: "Loan Repayment", amount: 0 },
      ],
    },
  ]

  const calculateTotal = (data: typeof profitLossData) => {
    return data.reduce((total, section) => {
      return total + section.items.reduce((sum, item) => sum + item.amount, 0)
    }, 0)
  }

  const totalRevenue = profitLossData[0].items.reduce((sum, item) => sum + item.amount, 0)
  const totalCOGS = Math.abs(profitLossData[1].items.reduce((sum, item) => sum + item.amount, 0))
  const grossProfit = totalRevenue - totalCOGS
  const totalOpEx = Math.abs(profitLossData[2].items.reduce((sum, item) => sum + item.amount, 0))
  const netIncome = grossProfit - totalOpEx

  const cashFlowTotal = calculateTotal(cashFlowData)

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
            <h1 className="text-3xl font-bold mb-2">Financial Statements</h1>
            <p className="text-muted-foreground">Investor-ready P&L and Cash Flow statements</p>
          </div>
          <div className="flex items-center gap-4">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current">Current Month</SelectItem>
                <SelectItem value="last">Last Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2 bg-transparent">
              <Download className="h-4 w-4" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card className="border-2 border-accent/50 bg-gradient-to-br from-accent/10 to-transparent">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">${totalRevenue.toLocaleString()}</div>
              <div className="flex items-center gap-1 text-sm text-accent mt-2">
                <TrendingUp className="h-4 w-4" />
                <span>+25% MoM</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-secondary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Gross Profit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">${grossProfit.toLocaleString()}</div>
              <p className="text-sm text-muted-foreground mt-2">
                {((grossProfit / totalRevenue) * 100).toFixed(0)}% margin
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Operating Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">${totalOpEx.toLocaleString()}</div>
              <div className="flex items-center gap-1 text-sm text-destructive mt-2">
                <TrendingUp className="h-4 w-4" />
                <span>+9% MoM</span>
              </div>
            </CardContent>
          </Card>

          <Card
            className={`border-2 ${netIncome >= 0 ? "border-accent/50 bg-gradient-to-br from-accent/10 to-transparent" : "border-destructive/50 bg-gradient-to-br from-destructive/10 to-transparent"}`}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Net Income</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${netIncome >= 0 ? "text-accent" : "text-destructive"}`}>
                {netIncome >= 0 ? "+" : ""}${netIncome.toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {((netIncome / totalRevenue) * 100).toFixed(0)}% margin
              </p>
            </CardContent>
          </Card>
        </div>

        {/* AI Insights */}
        <Card className="mb-8 border-2 border-accent/50 bg-gradient-to-r from-accent/10 to-secondary/10">
          <CardHeader>
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 animate-pulse-glow">
                <Sparkles className="h-5 w-5 text-accent" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg mb-2">AI Financial Analysis</CardTitle>
                <CardDescription className="text-base">
                  <span className="text-foreground">
                    Your gross margin is strong at {((grossProfit / totalRevenue) * 100).toFixed(0)}%, but operating
                    expenses are high relative to revenue. Focus on improving unit economics and consider delaying
                    non-essential hires. Your revenue growth of 25% MoM is excellent - maintain this momentum while
                    optimizing costs.
                  </span>
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Statements Tabs */}
        <Tabs defaultValue="pl" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="pl">Profit & Loss</TabsTrigger>
            <TabsTrigger value="cf">Cash Flow</TabsTrigger>
          </TabsList>

          <TabsContent value="pl">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Profit & Loss Statement</CardTitle>
                    <CardDescription>Income statement for the selected period</CardDescription>
                  </div>
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[60%]">Account</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {profitLossData.map((section, sectionIdx) => (
                      <>
                        <TableRow key={`section-${sectionIdx}`} className="bg-muted/50">
                          <TableCell className="font-semibold">{section.category}</TableCell>
                          <TableCell></TableCell>
                        </TableRow>
                        {section.items.map((item, itemIdx) => (
                          <TableRow key={`item-${sectionIdx}-${itemIdx}`}>
                            <TableCell className="pl-8">{item.name}</TableCell>
                            <TableCell
                              className={`text-right font-medium ${item.amount >= 0 ? "text-accent" : "text-foreground"}`}
                            >
                              {item.amount >= 0 ? "" : "-"}${Math.abs(item.amount).toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))}
                        {sectionIdx === 0 && (
                          <TableRow key="total-revenue" className="border-t-2">
                            <TableCell className="font-semibold">Total Revenue</TableCell>
                            <TableCell className="text-right font-bold text-accent">
                              ${totalRevenue.toLocaleString()}
                            </TableCell>
                          </TableRow>
                        )}
                        {sectionIdx === 1 && (
                          <>
                            <TableRow key="total-cogs" className="border-t-2">
                              <TableCell className="font-semibold">Total Cost of Revenue</TableCell>
                              <TableCell className="text-right font-bold">-${totalCOGS.toLocaleString()}</TableCell>
                            </TableRow>
                            <TableRow key="gross-profit" className="bg-muted/50 border-t-2">
                              <TableCell className="font-bold">Gross Profit</TableCell>
                              <TableCell
                                className={`text-right font-bold ${grossProfit >= 0 ? "text-accent" : "text-destructive"}`}
                              >
                                ${grossProfit.toLocaleString()}
                              </TableCell>
                            </TableRow>
                          </>
                        )}
                        {sectionIdx === 2 && (
                          <TableRow key="total-opex" className="border-t-2">
                            <TableCell className="font-semibold">Total Operating Expenses</TableCell>
                            <TableCell className="text-right font-bold">-${totalOpEx.toLocaleString()}</TableCell>
                          </TableRow>
                        )}
                      </>
                    ))}
                    <TableRow key="net-income" className="bg-primary/10 border-t-4 border-primary">
                      <TableCell className="font-bold text-lg">Net Income</TableCell>
                      <TableCell
                        className={`text-right font-bold text-lg ${netIncome >= 0 ? "text-accent" : "text-destructive"}`}
                      >
                        {netIncome >= 0 ? "+" : ""}${netIncome.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cf">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Cash Flow Statement</CardTitle>
                    <CardDescription>Cash movements for the selected period</CardDescription>
                  </div>
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[60%]">Account</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cashFlowData.map((section, sectionIdx) => (
                      <>
                        <TableRow key={`cf-section-${sectionIdx}`} className="bg-muted/50">
                          <TableCell className="font-semibold">{section.category}</TableCell>
                          <TableCell></TableCell>
                        </TableRow>
                        {section.items.map((item, itemIdx) => (
                          <TableRow key={`cf-item-${sectionIdx}-${itemIdx}`}>
                            <TableCell className="pl-8">{item.name}</TableCell>
                            <TableCell
                              className={`text-right font-medium ${item.amount >= 0 ? "text-accent" : "text-foreground"}`}
                            >
                              {item.amount >= 0 ? "+" : ""}${item.amount.toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow key={`net-cash-${section.category}`} className="border-t-2">
                          <TableCell className="font-semibold">
                            Net Cash from {section.category.replace(" Activities", "")}
                          </TableCell>
                          <TableCell className="text-right font-bold">
                            {section.items.reduce((sum, item) => sum + item.amount, 0) >= 0 ? "+" : ""}$
                            {section.items.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      </>
                    ))}
                    <TableRow key="net-change-cash" className="bg-primary/10 border-t-4 border-primary">
                      <TableCell className="font-bold text-lg">Net Change in Cash</TableCell>
                      <TableCell
                        className={`text-right font-bold text-lg ${cashFlowTotal >= 0 ? "text-accent" : "text-destructive"}`}
                      >
                        {cashFlowTotal >= 0 ? "+" : ""}${cashFlowTotal.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Export Options */}
        <div className="mt-8 flex flex-wrap gap-4">
          <Button className="bg-gradient-to-r from-primary to-secondary">
            <Download className="mr-2 h-4 w-4" />
            Download Full Report
          </Button>
          <Button variant="outline">Export to CSV</Button>
          <Button variant="outline">Share with Investors</Button>
        </div>
      </div>
    </div>
  )
}
