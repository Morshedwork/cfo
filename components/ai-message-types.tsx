/**
 * Rich Message Components for AI Assistant
 * These components render interactive, data-rich responses in the chatbot
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Calendar,
  BarChart3,
  Download,
  ExternalLink,
  Users,
  Percent,
  Target,
  AlertCircle,
  Info,
  Zap,
  XCircle
} from "lucide-react"
import { cn } from "@/lib/utils"

// ============================================
// 1. Scenario Comparison Component
// ============================================

export interface ScenarioComparisonProps {
  scenarioName: string
  before: {
    runway: number
    monthlyBurn: number
    cashZeroDate: string
    cashBalance?: number
  }
  after: {
    runway: number
    monthlyBurn: number
    cashZeroDate: string
    cashBalance?: number
  }
  changes: string[]
  impact: 'positive' | 'negative' | 'neutral'
  severity: 'low' | 'medium' | 'high' | 'critical'
  onViewDashboard?: () => void
  onSaveScenario?: () => void
  onModelAnother?: () => void
}

export function ScenarioComparisonCard({
  scenarioName,
  before,
  after,
  changes,
  impact,
  severity,
  onViewDashboard,
  onSaveScenario,
  onModelAnother
}: ScenarioComparisonProps) {
  // Handle null/undefined values with defaults
  const beforeRunway = before.runway ?? 0
  const afterRunway = after.runway ?? 0
  const beforeBurn = before.monthlyBurn ?? 0
  const afterBurn = after.monthlyBurn ?? 0
  
  const runwayChange = afterRunway - beforeRunway
  const burnChange = afterBurn - beforeBurn
  
  return (
    <Card className={cn(
      "border-2 mt-2",
      impact === 'negative' && severity === 'critical' && "border-destructive/50 bg-destructive/5",
      impact === 'negative' && severity === 'high' && "border-orange-500/50 bg-orange-500/5",
      impact === 'positive' && "border-green-500/50 bg-green-500/5"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            {scenarioName}
          </CardTitle>
          <Badge variant={impact === 'positive' ? 'default' : 'destructive'}>
            {impact === 'positive' ? 'Positive Impact' : impact === 'negative' ? 'Negative Impact' : 'Neutral'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary */}
        <div className="text-sm">
          <p className="font-medium mb-2">Impact Summary:</p>
          <ul className="space-y-1 text-muted-foreground">
            {changes.map((change, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                {change}
              </li>
            ))}
          </ul>
        </div>

        {/* Before vs After Table */}
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-2 font-medium">Metric</th>
                <th className="text-right p-2 font-medium">Before</th>
                <th className="text-right p-2 font-medium">After</th>
                <th className="text-right p-2 font-medium">Change</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t">
                <td className="p-2 flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  Runway
                </td>
                <td className="p-2 text-right">{beforeRunway.toFixed(1)} mo</td>
                <td className="p-2 text-right font-semibold">{afterRunway.toFixed(1)} mo</td>
                <td className={cn(
                  "p-2 text-right font-semibold",
                  runwayChange > 0 ? "text-green-600" : runwayChange < 0 ? "text-destructive" : ""
                )}>
                  {runwayChange > 0 ? '+' : ''}{runwayChange.toFixed(1)} mo
                </td>
              </tr>
              <tr className="border-t">
                <td className="p-2 flex items-center gap-2">
                  <TrendingDown className="h-3 w-3" />
                  Monthly Burn
                </td>
                <td className="p-2 text-right">${beforeBurn.toLocaleString()}</td>
                <td className="p-2 text-right font-semibold">${afterBurn.toLocaleString()}</td>
                <td className={cn(
                  "p-2 text-right font-semibold",
                  burnChange < 0 ? "text-green-600" : burnChange > 0 ? "text-destructive" : ""
                )}>
                  {burnChange > 0 ? '+' : ''}${burnChange.toLocaleString()}
                </td>
              </tr>
              <tr className="border-t">
                <td className="p-2 flex items-center gap-2">
                  <AlertTriangle className="h-3 w-3" />
                  Cash Zero Date
                </td>
                <td className="p-2 text-right text-xs">{before.cashZeroDate}</td>
                <td className="p-2 text-right font-semibold text-xs">{after.cashZeroDate}</td>
                <td className="p-2 text-right text-xs">—</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 pt-2">
          {onViewDashboard && (
            <Button size="sm" variant="outline" onClick={onViewDashboard} className="flex-1">
              <ExternalLink className="h-3 w-3 mr-1" />
              View Dashboard
            </Button>
          )}
          {onSaveScenario && (
            <Button size="sm" variant="default" onClick={onSaveScenario}>
              <Download className="h-3 w-3 mr-1" />
              Save Scenario
            </Button>
          )}
          {onModelAnother && (
            <Button size="sm" variant="ghost" onClick={onModelAnother}>
              Model Another
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================
// 2. KPI Dashboard Component
// ============================================

export interface KPIDashboardProps {
  title?: string
  kpis: Array<{
    name: string
    value: number | string
    unit?: string
    change?: number
    benchmark?: {
      percentile: number
      rating: 'poor' | 'below-average' | 'average' | 'good' | 'excellent'
    }
    icon?: 'dollar' | 'percent' | 'users' | 'trending'
  }>
  onViewFull?: () => void
  onDownloadPDF?: () => void
  onShare?: () => void
}

export function KPIDashboardCard({ title = "Investor KPIs", kpis, onViewFull, onDownloadPDF, onShare }: KPIDashboardProps) {
  const getIcon = (iconType?: string) => {
    switch (iconType) {
      case 'dollar': return DollarSign
      case 'percent': return Percent
      case 'users': return Users
      case 'trending': return TrendingUp
      default: return Target
    }
  }

  const getRatingColor = (rating?: string) => {
    switch (rating) {
      case 'excellent': return 'text-green-600 bg-green-500/10'
      case 'good': return 'text-blue-600 bg-blue-500/10'
      case 'average': return 'text-yellow-600 bg-yellow-500/10'
      case 'below-average': return 'text-orange-600 bg-orange-500/10'
      case 'poor': return 'text-destructive bg-destructive/10'
      default: return 'text-muted-foreground bg-muted'
    }
  }

  return (
    <Card className="border-2 border-primary/20 mt-2">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            {title}
          </CardTitle>
          <Badge variant="secondary">Live Data</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* KPI Grid */}
        <div className="grid grid-cols-2 gap-3">
          {kpis.map((kpi, i) => {
            const Icon = getIcon(kpi.icon)
            return (
              <div key={i} className="p-3 rounded-lg border bg-muted/30">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{kpi.name}</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-bold">
                    {typeof kpi.value === 'number' ? kpi.value.toLocaleString() : kpi.value}
                    {kpi.unit && <span className="text-sm font-normal text-muted-foreground ml-1">{kpi.unit}</span>}
                  </span>
                  {kpi.change && (
                    <span className={cn(
                      "text-xs font-medium flex items-center gap-0.5",
                      kpi.change > 0 ? "text-green-600" : "text-destructive"
                    )}>
                      {kpi.change > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {Math.abs(kpi.change)}%
                    </span>
                  )}
                </div>
                {kpi.benchmark && (
                  <div className="mt-2">
                    <Badge className={cn("text-xs", getRatingColor(kpi.benchmark.rating))}>
                      {kpi.benchmark.percentile}th percentile • {kpi.benchmark.rating}
                    </Badge>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 pt-2">
          {onViewFull && (
            <Button size="sm" variant="outline" onClick={onViewFull} className="flex-1">
              <ExternalLink className="h-3 w-3 mr-1" />
              Full Dashboard
            </Button>
          )}
          {onDownloadPDF && (
            <Button size="sm" variant="default" onClick={onDownloadPDF}>
              <Download className="h-3 w-3 mr-1" />
              PDF Report
            </Button>
          )}
          {onShare && (
            <Button size="sm" variant="secondary" onClick={onShare}>
              Share Link
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================
// 3. Risk Alert Component
// ============================================

export interface RiskAlertProps {
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  message: string
  metrics: {
    label: string
    oldValue: string | number
    newValue: string | number
  }[]
  actions?: Array<{
    label: string
    action: string
    variant?: 'default' | 'outline' | 'destructive'
  }>
}

export function RiskAlertCard({ severity, title, message, metrics, actions }: RiskAlertProps) {
  const getSeverityStyles = () => {
    switch (severity) {
      case 'critical': return { bg: 'bg-destructive/10', border: 'border-destructive', Icon: XCircle, text: 'text-destructive' }
      case 'high': return { bg: 'bg-orange-500/10', border: 'border-orange-500', Icon: AlertCircle, text: 'text-orange-600' }
      case 'medium': return { bg: 'bg-yellow-500/10', border: 'border-yellow-500', Icon: Zap, text: 'text-yellow-600' }
      case 'low': return { bg: 'bg-blue-500/10', border: 'border-blue-500', Icon: Info, text: 'text-blue-600' }
    }
  }

  const styles = getSeverityStyles()
  const IconComponent = styles.Icon

  return (
    <Card className={cn("border-2 mt-2", styles.border, styles.bg)}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <IconComponent className={cn("h-5 w-5", styles.text)} />
          <div className="flex-1">
            <CardTitle className={cn("text-base font-bold", styles.text)}>
              {severity.toUpperCase()} ALERT: {title}
            </CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Message */}
        <p className="text-sm">{message}</p>

        {/* Metrics Changes */}
        <div className="border rounded-lg p-3 bg-background">
          <div className="space-y-2">
            {metrics.map((metric, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{metric.label}:</span>
                <span className="font-semibold">
                  {metric.oldValue} → <span className={styles.text}>{metric.newValue}</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        {actions && actions.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {actions.map((action, i) => (
              <Button
                key={i}
                size="sm"
                variant={action.variant || 'outline'}
                onClick={() => console.log('Action:', action.action)}
                className="flex-1"
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ============================================
// 4. Cap Table Comparison Component
// ============================================

export interface CapTableComparisonProps {
  scenarioName: string
  stakeholders: Array<{
    name: string
    beforePct: number
    afterPct: number
    change: number
  }>
  summary: {
    preMoneyValuation: number
    investmentAmount: number
    postMoneyValuation: number
  }
  onViewFull?: () => void
  onExport?: () => void
  onModelDifferent?: () => void
}

export function CapTableComparisonCard({
  scenarioName,
  stakeholders,
  summary,
  onViewFull,
  onExport,
  onModelDifferent
}: CapTableComparisonProps) {
  return (
    <Card className="border-2 border-purple-500/20 mt-2 bg-purple-500/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Users className="h-4 w-4" />
          {scenarioName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-2 p-3 bg-background rounded-lg border">
          <div>
            <p className="text-xs text-muted-foreground">Pre-Money</p>
            <p className="font-bold text-sm">${((summary.preMoneyValuation ?? 0) / 1e6).toFixed(1)}M</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Investment</p>
            <p className="font-bold text-sm">${((summary.investmentAmount ?? 0) / 1e6).toFixed(1)}M</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Post-Money</p>
            <p className="font-bold text-sm">${((summary.postMoneyValuation ?? 0) / 1e6).toFixed(1)}M</p>
          </div>
        </div>

        {/* Ownership Table */}
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-2 font-medium">Stakeholder</th>
                <th className="text-right p-2 font-medium">Before</th>
                <th className="text-right p-2 font-medium">After</th>
                <th className="text-right p-2 font-medium">Change</th>
              </tr>
            </thead>
            <tbody>
              {stakeholders.map((sh, i) => (
                <tr key={i} className="border-t">
                  <td className="p-2 font-medium">{sh.name}</td>
                  <td className="p-2 text-right">{(sh.beforePct ?? 0).toFixed(1)}%</td>
                  <td className="p-2 text-right font-semibold">{(sh.afterPct ?? 0).toFixed(1)}%</td>
                  <td className={cn(
                    "p-2 text-right font-semibold text-xs",
                    sh.change > 0 ? "text-green-600" : sh.change < 0 ? "text-destructive" : ""
                  )}>
                    {sh.change > 0 ? '+' : ''}{(sh.change ?? 0).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 pt-2">
          {onViewFull && (
            <Button size="sm" variant="outline" onClick={onViewFull} className="flex-1">
              <ExternalLink className="h-3 w-3 mr-1" />
              Full Cap Table
            </Button>
          )}
          {onExport && (
            <Button size="sm" variant="default" onClick={onExport}>
              <Download className="h-3 w-3 mr-1" />
              Export
            </Button>
          )}
          {onModelDifferent && (
            <Button size="sm" variant="ghost" onClick={onModelDifferent}>
              Model Different Terms
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================
// 5. Strategic Insight Component
// ============================================

export interface StrategicInsightProps {
  title: string
  insight: string
  dataPoints: Array<{ label: string; value: string }>
  recommendations: string[]
  impactScore: number // 1-10
  onImplement?: () => void
  onDismiss?: () => void
}

export function StrategicInsightCard({
  title,
  insight,
  dataPoints,
  recommendations,
  impactScore,
  onImplement,
  onDismiss
}: StrategicInsightProps) {
  const getImpactColor = (score: number) => {
    if (score >= 8) return 'text-green-600 bg-green-500/10'
    if (score >= 5) return 'text-blue-600 bg-blue-500/10'
    return 'text-yellow-600 bg-yellow-500/10'
  }

  return (
    <Card className="border-2 border-blue-500/20 mt-2 bg-blue-500/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-blue-600" />
            {title}
          </CardTitle>
          <Badge className={getImpactColor(impactScore)}>
            Impact: {impactScore}/10
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Insight */}
        <p className="text-sm font-medium">{insight}</p>

        {/* Data Points */}
        <div className="grid grid-cols-2 gap-2">
          {dataPoints.map((dp, i) => (
            <div key={i} className="p-2 rounded bg-background border text-xs">
              <p className="text-muted-foreground">{dp.label}</p>
              <p className="font-bold">{dp.value}</p>
            </div>
          ))}
        </div>

        {/* Recommendations */}
        <div>
          <p className="text-xs font-semibold mb-2 text-blue-600">Recommendations:</p>
          <ul className="space-y-1 text-sm">
            {recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle2 className="h-3 w-3 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {onImplement && (
            <Button size="sm" variant="default" onClick={onImplement} className="flex-1">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Mark as Implemented
            </Button>
          )}
          {onDismiss && (
            <Button size="sm" variant="ghost" onClick={onDismiss}>
              Dismiss
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
