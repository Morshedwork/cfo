/**
 * Financial Statements View Component
 * Displays auto-generated P&L, Cash Flow, and AI Insights
 */

"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { 
  FileText, 
  Download, 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2,
  DollarSign,
  Percent
} from "lucide-react"
import type { ProfitLossStatement, CashFlowStatement, AIInsights } from "@/lib/statement-generator"

interface FinancialStatementsViewProps {
  profitLoss: ProfitLossStatement
  cashFlow: CashFlowStatement
  insights: AIInsights
}

export function FinancialStatementsView({ profitLoss, cashFlow, insights }: FinancialStatementsViewProps) {
  const pl = profitLoss
  
  const handleExportPDF = () => {
    // Generate a comprehensive text report
    const report = generateTextReport(profitLoss, cashFlow, insights)
    
    // Create a blob and download as text file (PDF would require library)
    const blob = new Blob([report], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `financial-report-${pl.period.start}-${pl.period.end}.txt`
    link.click()
    window.URL.revokeObjectURL(url)
  }
  
  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header with Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-2 border-accent/50 bg-gradient-to-br from-accent/10 to-transparent">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${pl.revenue.total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">{pl.period.start} - {pl.period.end}</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Percent className="h-4 w-4" />
              Gross Margin
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pl.grossMargin.toFixed(1)}%</div>
            <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
              {pl.grossMargin >= 70 ? <CheckCircle2 className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
              {pl.grossMargin >= 70 ? 'Excellent' : 'Review COGS'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-orange-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Operating Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${pl.operatingExpenses.total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {((pl.operatingExpenses.total / pl.revenue.total) * 100).toFixed(0)}% of revenue
            </p>
          </CardContent>
        </Card>

        <Card className={`border-2 ${pl.netIncome >= 0 ? 'border-green-500/50 bg-green-500/5' : 'border-destructive/50 bg-destructive/5'}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Net Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${pl.netIncome >= 0 ? 'text-green-600' : 'text-destructive'}`}>
              {pl.netIncome >= 0 ? '+' : ''}${pl.netIncome.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {pl.netMargin.toFixed(1)}% margin
            </p>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Card className="border-2 border-accent/50 bg-gradient-to-r from-accent/10 to-secondary/10">
        <CardHeader>
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 animate-pulse-glow">
              <Sparkles className="h-5 w-5 text-accent" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg mb-2">AI Financial Analysis</CardTitle>
              <CardDescription className="text-base text-foreground">
                {insights.summary}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Strengths */}
          {insights.strengths.length > 0 && (
            <div>
              <p className="text-sm font-semibold mb-2 flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                Strengths
              </p>
              <ul className="space-y-1">
                {insights.strengths.map((strength, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    {strength}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Concerns */}
          {insights.concerns.length > 0 && (
            <div>
              <p className="text-sm font-semibold mb-2 flex items-center gap-2 text-orange-600">
                <AlertTriangle className="h-4 w-4" />
                Areas of Concern
              </p>
              <ul className="space-y-1">
                {insights.concerns.map((concern, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-orange-600 mt-0.5">⚠</span>
                    {concern}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations */}
          {insights.recommendations.length > 0 && (
            <div>
              <p className="text-sm font-semibold mb-2 flex items-center gap-2 text-blue-600">
                <Sparkles className="h-4 w-4" />
                Growth Manager Recommendations
              </p>
              <ul className="space-y-1">
                {insights.recommendations.map((rec, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">💡</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Financial Statements Tabs */}
      <Tabs defaultValue="pl" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="pl">Profit & Loss</TabsTrigger>
            <TabsTrigger value="cf">Cash Flow</TabsTrigger>
          </TabsList>
          <Button variant="outline" onClick={handleExportPDF} className="gap-2">
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
        </div>

        {/* P&L Statement */}
        <TabsContent value="pl">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Profit & Loss Statement</CardTitle>
                  <CardDescription>
                    Period: {pl.period.start} - {pl.period.end}
                  </CardDescription>
                </div>
                <FileText className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[70%]">Account</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Revenue */}
                  <TableRow className="bg-muted/50">
                    <TableCell className="font-semibold">Revenue</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                  {pl.revenue.items.map((item, i) => (
                    <TableRow key={`rev-${i}`}>
                      <TableCell className="pl-8">{item.category}</TableCell>
                      <TableCell className="text-right font-medium text-green-600">
                        ${item.amount.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="border-t-2">
                    <TableCell className="font-semibold">Total Revenue</TableCell>
                    <TableCell className="text-right font-bold text-green-600">
                      ${pl.revenue.total.toLocaleString()}
                    </TableCell>
                  </TableRow>

                  {/* COGS */}
                  {pl.costOfRevenue.items.length > 0 && (
                    <>
                      <TableRow className="bg-muted/50">
                        <TableCell className="font-semibold">Cost of Revenue</TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                      {pl.costOfRevenue.items.map((item, i) => (
                        <TableRow key={`cogs-${i}`}>
                          <TableCell className="pl-8">{item.category}</TableCell>
                          <TableCell className="text-right font-medium">
                            -${item.amount.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="border-t-2">
                        <TableCell className="font-semibold">Total Cost of Revenue</TableCell>
                        <TableCell className="text-right font-bold">
                          -${pl.costOfRevenue.total.toLocaleString()}
                        </TableCell>
                      </TableRow>
                      <TableRow className="bg-muted/50 border-t-2">
                        <TableCell className="font-bold">Gross Profit</TableCell>
                        <TableCell className="text-right font-bold text-green-600">
                          ${pl.grossProfit.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    </>
                  )}

                  {/* Operating Expenses */}
                  <TableRow className="bg-muted/50">
                    <TableCell className="font-semibold">Operating Expenses</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                  {pl.operatingExpenses.items.map((item, i) => (
                    <TableRow key={`opex-${i}`}>
                      <TableCell className="pl-8">{item.category}</TableCell>
                      <TableCell className="text-right font-medium">
                        -${item.amount.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="border-t-2">
                    <TableCell className="font-semibold">Total Operating Expenses</TableCell>
                    <TableCell className="text-right font-bold">
                      -${pl.operatingExpenses.total.toLocaleString()}
                    </TableCell>
                  </TableRow>

                  {/* Net Income */}
                  <TableRow className="bg-primary/10 border-t-4 border-primary">
                    <TableCell className="font-bold text-lg">Net Income</TableCell>
                    <TableCell className={`text-right font-bold text-lg ${pl.netIncome >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                      {pl.netIncome >= 0 ? '+' : ''}${pl.netIncome.toLocaleString()}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cash Flow Statement */}
        <TabsContent value="cf">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Cash Flow Statement</CardTitle>
                  <CardDescription>
                    Period: {cashFlow.period.start} - {cashFlow.period.end}
                  </CardDescription>
                </div>
                <FileText className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[70%]">Activity</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Operating */}
                  <TableRow className="bg-muted/50">
                    <TableCell className="font-semibold">Operating Activities</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                  {cashFlow.operating.items.map((item, i) => (
                    <TableRow key={`op-${i}`}>
                      <TableCell className="pl-8">{item.name}</TableCell>
                      <TableCell className={`text-right font-medium ${item.amount >= 0 ? 'text-green-600' : ''}`}>
                        {item.amount >= 0 ? '+' : ''}${item.amount.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="border-t-2">
                    <TableCell className="font-semibold">Net Cash from Operating</TableCell>
                    <TableCell className="text-right font-bold">
                      {cashFlow.operating.total >= 0 ? '+' : ''}${cashFlow.operating.total.toLocaleString()}
                    </TableCell>
                  </TableRow>

                  {/* Investing */}
                  {cashFlow.investing.items.length > 0 && (
                    <>
                      <TableRow className="bg-muted/50">
                        <TableCell className="font-semibold">Investing Activities</TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                      {cashFlow.investing.items.map((item, i) => (
                        <TableRow key={`inv-${i}`}>
                          <TableCell className="pl-8">{item.name}</TableCell>
                          <TableCell className="text-right font-medium">
                            {item.amount >= 0 ? '+' : ''}${item.amount.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="border-t-2">
                        <TableCell className="font-semibold">Net Cash from Investing</TableCell>
                        <TableCell className="text-right font-bold">
                          {cashFlow.investing.total >= 0 ? '+' : ''}${cashFlow.investing.total.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    </>
                  )}

                  {/* Net Change */}
                  <TableRow className="bg-primary/10 border-t-4 border-primary">
                    <TableCell className="font-bold text-lg">Net Change in Cash</TableCell>
                    <TableCell className={`text-right font-bold text-lg ${cashFlow.netChange >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                      {cashFlow.netChange >= 0 ? '+' : ''}${cashFlow.netChange.toLocaleString()}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Download Report Section */}
      <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <h3 className="text-lg font-semibold mb-1">Export Financial Report</h3>
              <p className="text-sm text-muted-foreground">
                Download complete financial statements with AI insights for your records or investors
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleExportPDF} className="gap-2 bg-gradient-to-r from-primary to-secondary">
                <Download className="h-4 w-4" />
                Download Report
              </Button>
              <Button variant="outline" onClick={() => handleExportCSV(profitLoss)} className="gap-2">
                <FileText className="h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Export P&L as CSV
 */
function handleExportCSV(pl: ProfitLossStatement) {
  const rows = [
    ['Financial Statement Export'],
    [`Period: ${pl.period.start} - ${pl.period.end}`],
    [''],
    ['PROFIT & LOSS STATEMENT'],
    ['Account', 'Amount'],
    [''],
    ['REVENUE'],
    ...pl.revenue.items.map(item => [item.category, item.amount.toString()]),
    ['Total Revenue', pl.revenue.total.toString()],
    [''],
    ['COST OF REVENUE'],
    ...pl.costOfRevenue.items.map(item => [item.category, `-${item.amount}`]),
    ['Total Cost of Revenue', `-${pl.costOfRevenue.total}`],
    [''],
    ['Gross Profit', pl.grossProfit.toString()],
    ['Gross Margin', `${pl.grossMargin.toFixed(1)}%`],
    [''],
    ['OPERATING EXPENSES'],
    ...pl.operatingExpenses.items.map(item => [item.category, `-${item.amount}`]),
    ['Total Operating Expenses', `-${pl.operatingExpenses.total}`],
    [''],
    ['NET INCOME', pl.netIncome.toString()],
    ['Net Margin', `${pl.netMargin.toFixed(1)}%`],
  ]

  const csvContent = rows.map(row => row.join(',')).join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `financial-statement-${pl.period.start}-${pl.period.end}.csv`
  link.click()
  window.URL.revokeObjectURL(url)
}

/**
 * Generate comprehensive text report
 */
function generateTextReport(pl: ProfitLossStatement, cf: CashFlowStatement, insights: AIInsights): string {
  const lines: string[] = []
  
  // Header
  lines.push('═══════════════════════════════════════════════════════════')
  lines.push('              FINANCIAL STATEMENTS REPORT')
  lines.push('                   Generated by Aura AI')
  lines.push('═══════════════════════════════════════════════════════════')
  lines.push('')
  lines.push(`Period: ${pl.period.start} - ${pl.period.end}`)
  lines.push(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`)
  lines.push('')
  lines.push('')
  
  // Executive Summary
  lines.push('EXECUTIVE SUMMARY')
  lines.push('─────────────────────────────────────────────────────────')
  lines.push(insights.summary)
  lines.push('')
  lines.push('')
  
  // Key Metrics
  lines.push('KEY FINANCIAL METRICS')
  lines.push('─────────────────────────────────────────────────────────')
  lines.push(`Total Revenue:           $${pl.revenue.total.toLocaleString()}`)
  lines.push(`Gross Profit:            $${pl.grossProfit.toLocaleString()}`)
  lines.push(`Gross Margin:            ${pl.grossMargin.toFixed(1)}%`)
  lines.push(`Operating Expenses:      $${pl.operatingExpenses.total.toLocaleString()}`)
  lines.push(`Net Income:              ${pl.netIncome >= 0 ? '+' : ''}$${pl.netIncome.toLocaleString()}`)
  lines.push(`Net Margin:              ${pl.netMargin.toFixed(1)}%`)
  lines.push(`Monthly Burn Rate:       $${insights.keyMetrics.burnRate.toLocaleString()}`)
  lines.push(`Runway:                  ${insights.keyMetrics.runway === Infinity ? '∞' : insights.keyMetrics.runway.toFixed(0)} months`)
  lines.push('')
  lines.push('')
  
  // P&L Statement
  lines.push('PROFIT & LOSS STATEMENT')
  lines.push('═══════════════════════════════════════════════════════════')
  lines.push('')
  lines.push('REVENUE')
  pl.revenue.items.forEach(item => {
    lines.push(`  ${item.category.padEnd(45)} $${item.amount.toLocaleString()}`)
  })
  lines.push(`  ${''.padEnd(45)} ${''.padStart(15, '─')}`)
  lines.push(`  ${'Total Revenue'.padEnd(45)} $${pl.revenue.total.toLocaleString()}`)
  lines.push('')
  
  if (pl.costOfRevenue.items.length > 0) {
    lines.push('COST OF REVENUE')
    pl.costOfRevenue.items.forEach(item => {
      lines.push(`  ${item.category.padEnd(45)} ($${item.amount.toLocaleString()})`)
    })
    lines.push(`  ${''.padEnd(45)} ${''.padStart(15, '─')}`)
    lines.push(`  ${'Total Cost of Revenue'.padEnd(45)} ($${pl.costOfRevenue.total.toLocaleString()})`)
    lines.push('')
    lines.push(`  ${'GROSS PROFIT'.padEnd(45)} $${pl.grossProfit.toLocaleString()}`)
    lines.push(`  ${'Gross Margin'.padEnd(45)} ${pl.grossMargin.toFixed(1)}%`)
    lines.push('')
  }
  
  lines.push('OPERATING EXPENSES')
  pl.operatingExpenses.items.forEach(item => {
    lines.push(`  ${item.category.padEnd(45)} ($${item.amount.toLocaleString()})`)
  })
  lines.push(`  ${''.padEnd(45)} ${''.padStart(15, '─')}`)
  lines.push(`  ${'Total Operating Expenses'.padEnd(45)} ($${pl.operatingExpenses.total.toLocaleString()})`)
  lines.push('')
  lines.push(`  ${'NET INCOME'.padEnd(45)} ${pl.netIncome >= 0 ? '+' : ''}$${pl.netIncome.toLocaleString()}`)
  lines.push('')
  lines.push('')
  
  // Cash Flow Statement
  lines.push('CASH FLOW STATEMENT')
  lines.push('═══════════════════════════════════════════════════════════')
  lines.push('')
  lines.push('OPERATING ACTIVITIES')
  cf.operating.items.forEach(item => {
    lines.push(`  ${item.name.padEnd(45)} ${item.amount >= 0 ? '+' : ''}$${item.amount.toLocaleString()}`)
  })
  lines.push(`  ${'Net Cash from Operating'.padEnd(45)} ${cf.operating.total >= 0 ? '+' : ''}$${cf.operating.total.toLocaleString()}`)
  lines.push('')
  
  if (cf.investing.items.length > 0) {
    lines.push('INVESTING ACTIVITIES')
    cf.investing.items.forEach(item => {
      lines.push(`  ${item.name.padEnd(45)} ${item.amount >= 0 ? '+' : ''}$${item.amount.toLocaleString()}`)
    })
    lines.push(`  ${'Net Cash from Investing'.padEnd(45)} ${cf.investing.total >= 0 ? '+' : ''}$${cf.investing.total.toLocaleString()}`)
    lines.push('')
  }
  
  lines.push(`  ${'NET CHANGE IN CASH'.padEnd(45)} ${cf.netChange >= 0 ? '+' : ''}$${cf.netChange.toLocaleString()}`)
  lines.push('')
  lines.push('')
  
  // AI Insights
  lines.push('AI FINANCIAL ANALYSIS')
  lines.push('═══════════════════════════════════════════════════════════')
  lines.push('')
  
  if (insights.strengths.length > 0) {
    lines.push('✓ STRENGTHS')
    insights.strengths.forEach(strength => {
      lines.push(`  • ${strength}`)
    })
    lines.push('')
  }
  
  if (insights.concerns.length > 0) {
    lines.push('⚠ AREAS OF CONCERN')
    insights.concerns.forEach(concern => {
      lines.push(`  • ${concern}`)
    })
    lines.push('')
  }
  
  if (insights.recommendations.length > 0) {
    lines.push('💡 GROWTH MANAGER RECOMMENDATIONS')
    insights.recommendations.forEach(rec => {
      lines.push(`  • ${rec}`)
    })
    lines.push('')
  }
  
  lines.push('')
  lines.push('═══════════════════════════════════════════════════════════')
  lines.push('                   END OF REPORT')
  lines.push('═══════════════════════════════════════════════════════════')
  
  return lines.join('\n')
}
