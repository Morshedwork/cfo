"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Download,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Target,
  Calendar,
  DollarSign,
  Rocket,
} from "lucide-react"
import type { InvestmentAnalysis } from "@/lib/investment-analyzer"

interface InvestmentResultsViewProps {
  analysis: InvestmentAnalysis
  investmentAmount: number
}

export function InvestmentResultsView({ analysis, investmentAmount }: InvestmentResultsViewProps) {
  const { allocation, projections, metrics, kpis, risks, summary, actionPlan } = analysis

  const downloadReport = () => {
    const report = `
INVESTMENT ALLOCATION REPORT
Investment Amount: $${investmentAmount.toLocaleString()}
Generated: ${new Date().toLocaleDateString()}

==============================================
EXECUTIVE SUMMARY
==============================================
${summary}

==============================================
FUND ALLOCATION
==============================================
${allocation.map((a) => `${a.category}: $${a.amount.toLocaleString()} (${a.percentage}%)
Rationale: ${a.rationale}
`).join('\n')}

==============================================
KEY METRICS
==============================================
New Monthly Burn: $${metrics.newMonthlyBurn.toLocaleString()}
Projected Runway: ${metrics.projectedRunway} months
Break-Even Target: Month ${metrics.breakEvenMonth}
Target ROI: ${metrics.targetROI}%

==============================================
6-MONTH CASH FLOW PROJECTION
==============================================
${projections.map((p) => `${p.monthName}:
  Revenue: $${p.revenue.toLocaleString()}
  Expenses: $${p.expenses.toLocaleString()}
  Burn: $${p.burn.toLocaleString()}
  Cash Remaining: $${p.cashRemaining.toLocaleString()}
  Milestone: ${p.milestone}
`).join('\n')}

==============================================
KPI TRACKING RECOMMENDATIONS
==============================================
${kpis.map((k) => `${k.metric}
  Target: ${k.target}
  Why: ${k.why}
  Current: ${k.currentEstimate || 'N/A'}
`).join('\n')}

==============================================
RISK ANALYSIS
==============================================
${risks.map((r) => `[${r.severity.toUpperCase()}] ${r.risk}
  Mitigation: ${r.mitigation}
`).join('\n')}

==============================================
6-MONTH ACTION PLAN
==============================================
${actionPlan.map((action, i) => `${i + 1}. ${action}`).join('\n')}

==============================================
End of Report
    `.trim()

    const blob = new Blob([report], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `investment-allocation-${Date.now()}.txt`
    link.click()
    URL.revokeObjectURL(url)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-500'
      case 'medium':
        return 'bg-yellow-500'
      default:
        return 'bg-green-500'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with Download */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Investment Allocation Report</h2>
          <p className="text-muted-foreground">Strategic deployment plan for ${investmentAmount.toLocaleString()}</p>
        </div>
        <Button onClick={downloadReport} className="gap-2">
          <Download className="h-4 w-4" />
          Download Report
        </Button>
      </div>

      {/* Summary Card */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Rocket className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Executive Summary</CardTitle>
              <CardDescription>AI-generated strategic overview</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-foreground leading-relaxed whitespace-pre-line">{summary}</p>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>New Monthly Burn</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">${(metrics.newMonthlyBurn / 1000).toFixed(0)}K</span>
              <span className="text-sm text-muted-foreground">/ month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Projected Runway</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{metrics.projectedRunway}</span>
              <span className="text-sm text-muted-foreground">months</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Break-Even Target</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{metrics.breakEvenMonth}</span>
              <span className="text-sm text-muted-foreground">months</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Target ROI</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{metrics.targetROI}%</span>
              <span className="text-sm text-muted-foreground">return</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Allocation Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <DollarSign className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Fund Allocation Strategy</CardTitle>
              <CardDescription>Optimized capital deployment by category</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {allocation.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{item.category}</span>
                  <span className="text-sm text-muted-foreground">
                    ${item.amount.toLocaleString()} ({item.percentage}%)
                  </span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-secondary transition-all"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <p className="text-sm text-muted-foreground">{item.rationale}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 6-Month Projection */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>6-Month Cash Flow Projection</CardTitle>
              <CardDescription>Month-by-month financial forecast</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-semibold">Month</th>
                  <th className="text-right p-2 font-semibold">Revenue</th>
                  <th className="text-right p-2 font-semibold">Expenses</th>
                  <th className="text-right p-2 font-semibold">Burn</th>
                  <th className="text-right p-2 font-semibold">Cash Left</th>
                  <th className="text-left p-2 font-semibold">Milestone</th>
                </tr>
              </thead>
              <tbody>
                {projections.map((proj, index) => (
                  <tr key={index} className="border-b hover:bg-muted/50">
                    <td className="p-2">{proj.monthName}</td>
                    <td className="p-2 text-right text-green-600 dark:text-green-400">
                      ${proj.revenue.toLocaleString()}
                    </td>
                    <td className="p-2 text-right text-red-600 dark:text-red-400">
                      ${proj.expenses.toLocaleString()}
                    </td>
                    <td className="p-2 text-right">
                      ${proj.burn.toLocaleString()}
                    </td>
                    <td className="p-2 text-right font-semibold">
                      ${proj.cashRemaining.toLocaleString()}
                    </td>
                    <td className="p-2 text-sm text-muted-foreground">{proj.milestone}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* KPIs */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Target className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Key Performance Indicators</CardTitle>
              <CardDescription>Metrics to track investment effectiveness</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {kpis.map((kpi, index) => (
              <div key={index} className="p-4 border rounded-lg bg-muted/30">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold">{kpi.metric}</h4>
                  <Badge variant="outline">{kpi.target}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-1">{kpi.why}</p>
                {kpi.currentEstimate && (
                  <p className="text-sm text-primary font-medium">Current: {kpi.currentEstimate}</p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Risk Analysis */}
      <Card className="border-2 border-yellow-500/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <div>
              <CardTitle>Risk Analysis</CardTitle>
              <CardDescription>Potential challenges and mitigation strategies</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {risks.map((risk, index) => (
              <div key={index} className="flex gap-3 p-3 border rounded-lg bg-muted/30">
                <div className={`h-2 w-2 rounded-full mt-2 flex-shrink-0 ${getSeverityColor(risk.severity)}`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{risk.risk}</h4>
                    <Badge variant={risk.severity === 'high' ? 'destructive' : 'secondary'} className="text-xs">
                      {risk.severity}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <strong>Mitigation:</strong> {risk.mitigation}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Plan */}
      <Card className="border-2 border-green-500/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <div>
              <CardTitle>6-Month Action Plan</CardTitle>
              <CardDescription>Step-by-step execution roadmap</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {actionPlan.map((action, index) => (
              <div key={index} className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-primary">{index + 1}</span>
                </div>
                <p className="text-sm leading-relaxed pt-1">{action}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
