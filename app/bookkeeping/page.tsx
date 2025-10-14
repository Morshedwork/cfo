"use client"

import { useState, useEffect } from "react"
import { LoadingScreen } from "@/components/loading-screen"
import { AuthNavbar } from "@/components/auth-navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Sparkles, CheckCircle2, AlertCircle, Search, Filter, Download } from "lucide-react"

interface Transaction {
  id: string
  date: string
  description: string
  amount: number
  category: string
  status: "auto" | "review" | "manual"
  confidence: number
}

export default function BookkeepingPage() {
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  const transactions: Transaction[] = [
    {
      id: "1",
      date: "2025-10-10",
      description: "AWS Cloud Services",
      amount: -2450.0,
      category: "Infrastructure",
      status: "auto",
      confidence: 98,
    },
    {
      id: "2",
      date: "2025-10-09",
      description: "Google Ads Campaign",
      amount: -5000.0,
      category: "Marketing",
      status: "auto",
      confidence: 95,
    },
    {
      id: "3",
      date: "2025-10-08",
      description: "Stripe Payment - Customer #1234",
      amount: 2500.0,
      category: "Revenue",
      status: "auto",
      confidence: 99,
    },
    {
      id: "4",
      date: "2025-10-08",
      description: "Office Supplies - Staples",
      amount: -234.5,
      category: "Office",
      status: "auto",
      confidence: 92,
    },
    {
      id: "5",
      date: "2025-10-07",
      description: "Payroll - October 2025",
      amount: -45000.0,
      category: "Payroll",
      status: "auto",
      confidence: 100,
    },
    {
      id: "6",
      date: "2025-10-07",
      description: "Unknown Vendor Payment",
      amount: -1200.0,
      category: "Uncategorized",
      status: "review",
      confidence: 45,
    },
    {
      id: "7",
      date: "2025-10-06",
      description: "Figma Subscription",
      amount: -45.0,
      category: "Software",
      status: "auto",
      confidence: 97,
    },
    {
      id: "8",
      date: "2025-10-05",
      description: "Client Invoice Payment",
      amount: 8500.0,
      category: "Revenue",
      status: "auto",
      confidence: 99,
    },
  ]

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch = t.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = filterCategory === "all" || t.category === filterCategory
    const matchesStatus = filterStatus === "all" || t.status === filterStatus
    return matchesSearch && matchesCategory && matchesStatus
  })

  const stats = {
    total: transactions.length,
    autoCategorized: transactions.filter((t) => t.status === "auto").length,
    needsReview: transactions.filter((t) => t.status === "review").length,
    accuracy: Math.round((transactions.filter((t) => t.status === "auto").length / transactions.length) * 100),
  }

  const getStatusBadge = (status: Transaction["status"], confidence: number) => {
    if (status === "auto") {
      return (
        <Badge className="gap-1 bg-accent text-accent-foreground">
          <CheckCircle2 className="h-3 w-3" />
          Auto ({confidence}%)
        </Badge>
      )
    } else if (status === "review") {
      return (
        <Badge variant="secondary" className="gap-1">
          <AlertCircle className="h-3 w-3" />
          Review
        </Badge>
      )
    }
    return <Badge variant="outline">Manual</Badge>
  }

  if (loading) {
    return <LoadingScreen />
  }

  return (
    <div className="min-h-screen bg-background">
      <AuthNavbar />

      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">AI Bookkeeping</h1>
          <p className="text-muted-foreground">Automatically categorize transactions with machine learning</p>
        </div>

        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card className="border-2 border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stats.total}</div>
              <p className="text-sm text-muted-foreground mt-1">This month</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-accent/50 bg-gradient-to-br from-accent/10 to-transparent">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Auto-Categorized</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stats.autoCategorized}</div>
              <p className="text-sm text-accent mt-1">{stats.accuracy}% accuracy</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-secondary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Needs Review</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stats.needsReview}</div>
              <p className="text-sm text-muted-foreground mt-1">Requires attention</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Time Saved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">4.5 hrs</div>
              <p className="text-sm text-muted-foreground mt-1">This month</p>
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
                <CardTitle className="text-lg mb-2">AI Bookkeeping Insights</CardTitle>
                <CardDescription className="text-base">
                  <span className="text-foreground">
                    <strong>Great job!</strong> Your AI categorization accuracy is at {stats.accuracy}%. You have{" "}
                    {stats.needsReview} transaction(s) that need manual review. The AI has low confidence on these items
                    and recommends human verification.
                  </span>
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>Review and manage your categorized transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Revenue">Revenue</SelectItem>
                  <SelectItem value="Payroll">Payroll</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Infrastructure">Infrastructure</SelectItem>
                  <SelectItem value="Office">Office</SelectItem>
                  <SelectItem value="Software">Software</SelectItem>
                  <SelectItem value="Uncategorized">Uncategorized</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="auto">Auto-Categorized</SelectItem>
                  <SelectItem value="review">Needs Review</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="gap-2 bg-transparent">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>

            {/* Transactions Table */}
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">
                        {new Date(transaction.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{transaction.category}</Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(transaction.status, transaction.confidence)}</TableCell>
                      <TableCell
                        className={`text-right font-semibold ${transaction.amount > 0 ? "text-accent" : "text-foreground"}`}
                      >
                        {transaction.amount > 0 ? "+" : ""}${Math.abs(transaction.amount).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredTransactions.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <p>No transactions found matching your filters</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-4">
          <Button className="bg-gradient-to-r from-primary to-secondary">
            <Sparkles className="mr-2 h-4 w-4" />
            Review Pending Transactions
          </Button>
          <Button variant="outline">Create Custom Rule</Button>
          <Button variant="outline">Sync Bank Accounts</Button>
        </div>
      </div>
    </div>
  )
}
