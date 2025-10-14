"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, TrendingUp, Users, PieChart, AlertCircle } from "lucide-react"
import type { EquityCalculationResult } from "@/lib/equity-calculator"

interface EquityCalculatorViewProps {
  result: EquityCalculationResult
}

export function EquityCalculatorView({ result }: EquityCalculatorViewProps) {
  const { rounds, finalOwnership, insights, totalShares } = result

  const downloadCapTable = () => {
    // Generate CSV
    const roundNames = ['Initial', ...rounds.map(r => r.name)]
    const headers = ['Stakeholder', ...roundNames].join(',')
    
    const rows = finalOwnership.map(owner => {
      const values = [
        owner.stakeholder,
        ...roundNames.map(round => {
          const pct = owner.percentages[round] || 0
          return `${pct.toFixed(2)}%`
        })
      ]
      return values.join(',')
    })

    const csv = [headers, ...rows].join('\n')
    
    // Download
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'cap-table.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const formatCurrency = (amount: number): string => {
    if (amount >= 1_000_000_000) {
      return `$${(amount / 1_000_000_000).toFixed(1)}B`
    } else if (amount >= 1_000_000) {
      return `$${(amount / 1_000_000).toFixed(1)}M`
    } else if (amount >= 1_000) {
      return `$${(amount / 1_000).toFixed(0)}K`
    }
    return `$${amount.toLocaleString()}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <PieChart className="h-6 w-6 text-primary" />
            Equity Distribution Calculator
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {rounds.length} funding round{rounds.length > 1 ? 's' : ''} analyzed • {totalShares.toLocaleString()} total shares
          </p>
        </div>
        <Button onClick={downloadCapTable} variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Download Cap Table (CSV)
        </Button>
      </div>

      {/* Insights */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-primary" />
            Key Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {insights.map((insight, idx) => (
              <div key={idx} className="flex items-start gap-2 text-sm">
                <div className="mt-1">•</div>
                <p className="flex-1">{insight}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Funding Rounds */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Funding Rounds Breakdown
        </h3>

        {rounds.map((round, idx) => (
          <Card key={idx} className="border-l-4 border-l-primary">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{round.name}</CardTitle>
                  <CardDescription>
                    Pre-Money: {formatCurrency(round.preMoneyValuation)} • 
                    Investment: {formatCurrency(round.investment)} → 
                    Post-Money: {formatCurrency(round.postMoneyValuation)}
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="text-lg">
                  {round.investorEquityPercent.toFixed(1)}% dilution
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 font-semibold">Stakeholder</th>
                      <th className="text-right py-2 font-semibold">Ownership %</th>
                      <th className="text-right py-2 font-semibold">Shares</th>
                      <th className="text-right py-2 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {round.stakeholders.map((stakeholder, sIdx) => {
                      const isNewInvestor = stakeholder.name === round.newInvestorName
                      return (
                        <tr key={sIdx} className="border-b last:border-0">
                          <td className="py-2 flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            {stakeholder.name}
                            {isNewInvestor && (
                              <Badge variant="default" className="text-xs">New</Badge>
                            )}
                          </td>
                          <td className="text-right py-2 font-semibold">
                            {stakeholder.percentage.toFixed(2)}%
                          </td>
                          <td className="text-right py-2 text-muted-foreground">
                            {stakeholder.shares.toLocaleString()}
                          </td>
                          <td className="text-right py-2">
                            {isNewInvestor ? (
                              <Badge variant="outline" className="text-xs bg-green-500/10 text-green-700 border-green-500/20">
                                Invested {formatCurrency(round.investment)}
                              </Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                Diluted
                              </span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Math Explanation */}
              <div className="mt-4 p-4 bg-muted/50 rounded-lg text-xs font-mono space-y-1">
                <div className="font-semibold text-foreground mb-2">📐 Calculation:</div>
                <div>Post-Money = Pre-Money + Investment</div>
                <div>Post-Money = {formatCurrency(round.preMoneyValuation)} + {formatCurrency(round.investment)} = {formatCurrency(round.postMoneyValuation)}</div>
                <div className="mt-2">Investor Equity % = Investment ÷ Post-Money × 100</div>
                <div>Investor Equity % = {formatCurrency(round.investment)} ÷ {formatCurrency(round.postMoneyValuation)} × 100 = {round.investorEquityPercent.toFixed(2)}%</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Final Ownership Summary */}
      <Card className="border-2 border-primary/30">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <PieChart className="h-5 w-5 text-primary" />
            Final Ownership Summary (All Rounds)
          </CardTitle>
          <CardDescription>
            Evolution of equity across all funding stages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-semibold sticky left-0 bg-background">
                    Stakeholder
                  </th>
                  {Object.keys(finalOwnership[0]?.percentages || {}).map(roundName => (
                    <th key={roundName} className="text-right py-2 font-semibold px-4">
                      {roundName}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {finalOwnership.map((owner, idx) => (
                  <tr key={idx} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="py-3 font-medium sticky left-0 bg-background">
                      {owner.stakeholder}
                    </td>
                    {Object.entries(owner.percentages).map(([roundName, pct]) => {
                      const isZero = pct === 0
                      const isHigh = pct >= 20
                      return (
                        <td
                          key={roundName}
                          className={`text-right py-3 px-4 font-semibold ${
                            isZero ? 'text-muted-foreground' : isHigh ? 'text-primary' : ''
                          }`}
                        >
                          {isZero ? '—' : `${pct.toFixed(1)}%`}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Visual Representation */}
          <div className="mt-6 space-y-3">
            <div className="text-sm font-semibold">📊 Visual Breakdown (Final Round):</div>
            {finalOwnership.map((owner, idx) => {
              const finalPct = Object.values(owner.percentages).slice(-1)[0]
              if (finalPct === 0) return null
              
              const colors = [
                'bg-blue-500',
                'bg-green-500',
                'bg-purple-500',
                'bg-orange-500',
                'bg-pink-500',
                'bg-cyan-500',
                'bg-yellow-500',
              ]
              const color = colors[idx % colors.length]

              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{owner.stakeholder}</span>
                    <span className="text-muted-foreground">{finalPct.toFixed(2)}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                    <div
                      className={`${color} h-full rounded-full transition-all`}
                      style={{ width: `${finalPct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Additional Context */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-lg">💡 Understanding Equity Dilution</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2 text-muted-foreground">
          <p>
            <strong>Dilution</strong> occurs when new shares are issued to investors, reducing the
            ownership percentage of existing shareholders.
          </p>
          <p>
            <strong>Higher valuations</strong> mean less dilution per dollar raised. This is why
            growing your valuation between rounds is critical.
          </p>
          <p>
            <strong>Founders should aim</strong> to retain 40-50% ownership by Series B to maintain
            meaningful control while still attracting investors.
          </p>
          <p>
            <strong>Option pools</strong> (10-15%) are essential for attracting top talent and
            should be factored into pre-money valuations when possible.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

