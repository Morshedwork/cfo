/**
 * Enhanced AI CFO Client
 * Integrates OpenAI with Financial Engine for advanced FP&A features
 */

import { GeminiClient, getGeminiClient } from './gemini-client'
import { FinancialEngine, type FinancialMetrics, type ScenarioChange } from './financial-engine'
import { findInvestorsFromCrust } from './crust-data'

export interface EnhancedMessage {
  type: 'text' | 'scenario_analysis' | 'kpi_dashboard' | 'alert' | 'cap_table' | 'strategic_insight' | 'forecast' | 'find_investors'
  message: string
  data?: any
  chart?: {
    type: 'line' | 'bar' | 'pie'
    data: any[]
    config?: any
  }
  actions?: Array<{
    label: string
    action: string
    variant?: 'default' | 'outline' | 'destructive' | 'secondary'
  }>
}

export class AICFOClient {
  private gemini: GeminiClient

  constructor() {
    this.gemini = getGeminiClient()
  }

  /**
   * Process user message and determine intent
   */
  async processMessage(
    message: string,
    context: FinancialMetrics
  ): Promise<EnhancedMessage> {
    const messageLower = message.toLowerCase()

    // Detect intent and route to appropriate handler
    if (this.isScenarioModeling(messageLower)) {
      return this.handleScenarioModeling(message, context)
    }
    
    if (this.isForecastRequest(messageLower)) {
      return this.handleForecast(message, context)
    }
    
    if (this.isKPIRequest(messageLower)) {
      return this.handleKPIDashboard(message, context)
    }
    
    if (this.isCapTableRequest(messageLower)) {
      return this.handleCapTable(message, context)
    }
    
    if (this.isFindInvestorsRequest(messageLower)) {
      return this.handleFindInvestors(message, context)
    }
    
    // Default: general financial analysis
    return this.handleGeneralQuery(message, context)
  }

  /**
   * Intent Detection Methods
   */
  private isScenarioModeling(message: string): boolean {
    const keywords = ['model', 'scenario', 'what if', 'impact of', 'hiring', 'adding', 'cutting', 'reducing']
    return keywords.some(keyword => message.includes(keyword))
  }

  private isForecastRequest(message: string): boolean {
    const keywords = ['forecast', 'project', 'predict', 'runway', 'cash zero', 'months left']
    return keywords.some(keyword => message.includes(keyword))
  }

  private isKPIRequest(message: string): boolean {
    const keywords = ['kpi', 'metrics', 'investor', 'dashboard', 'arr', 'ltv', 'cac', 'nrr']
    return keywords.some(keyword => message.includes(keyword))
  }

  private isCapTableRequest(message: string): boolean {
    const keywords = ['cap table', 'equity', 'dilution', 'series', 'funding round', 'ownership']
    return keywords.some(keyword => message.includes(keyword))
  }

  private isFindInvestorsRequest(message: string): boolean {
    const keywords = [
      'find investors', 'discover investors', 'investor matching', 'who should i pitch',
      'fundraising list', 'investor list', 'potential investors', 'investor discovery',
      'crust data', 'find investor', 'look for investors', 'investors for fundraising',
      'match investors', 'investor leads'
    ]
    return keywords.some(keyword => message.includes(keyword))
  }

  /**
   * Feature #1: FP&A - Scenario Modeling
   */
  private async handleScenarioModeling(
    message: string,
    context: FinancialMetrics
  ): Promise<EnhancedMessage> {
    // Extract scenario parameters from message using AI
    const changes = await this.extractScenarioChanges(message)
    
    // Run financial model
    const result = FinancialEngine.modelScenario(context, changes)
    
    // Generate narrative explanation
    const summary = this.generateScenarioSummary(changes, result)
    
    return {
      type: 'scenario_analysis',
      message: summary,
      data: {
        scenarioName: this.extractScenarioName(message, changes),
        before: result.before,
        after: result.after,
        changes: changes.map(c => c.description),
        impact: result.impact,
        severity: result.severity
      },
      actions: [
        { label: 'View Full Dashboard', action: 'open_dashboard', variant: 'outline' },
        { label: 'Save Scenario', action: 'save_scenario', variant: 'default' },
        { label: 'Model Another Change', action: 'model_another', variant: 'outline' }
      ]
    }
  }

  /**
   * Extract scenario changes from natural language
   */
  private async extractScenarioChanges(message: string): Promise<ScenarioChange[]> {
    const messageLower = message.toLowerCase()
    const changes: ScenarioChange[] = []

    // Pattern: Hiring X engineers at $Y salary
    const hiringMatch = messageLower.match(/(\d+)\s+(?:engineers?|developers?|employees?)\s+at\s+\$?(\d+)k?/)
    if (hiringMatch) {
      const count = parseInt(hiringMatch[1])
      const salary = parseInt(hiringMatch[2]) * (hiringMatch[2].length <= 3 ? 1000 : 1) // handle "180k" or "180000"
      changes.push({
        type: 'hiring',
        description: `Hire ${count} engineer${count > 1 ? 's' : ''} at $${(salary / 1000).toFixed(0)}k/year each`,
        monthlyImpact: -(count * salary / 12), // negative = increases burn
        oneTimeCost: count * 5000 // recruiting cost per hire
      })
    }

    // Pattern: Increase/decrease marketing by $X
    const marketingMatch = messageLower.match(/(increase|decrease|cut|add)\s+marketing\s+(?:by|spend)?\s+\$?(\d+)k?/)
    if (marketingMatch) {
      const action = marketingMatch[1]
      const amount = parseInt(marketingMatch[2]) * (marketingMatch[2].length <= 3 ? 1000 : 1)
      const isIncrease = ['increase', 'add'].includes(action)
      changes.push({
        type: 'marketing',
        description: `${isIncrease ? 'Increase' : 'Decrease'} marketing spend by $${(amount / 1000).toFixed(0)}k/month`,
        monthlyImpact: isIncrease ? -amount : amount // negative = increases burn
      })
    }

    // Pattern: Revenue increase by X% or $Y
    const revenueMatch = messageLower.match(/revenue\s+(?:increase|growth|boost)\s+(?:by|of)\s+(\d+)%?|\$(\d+)k?/)
    if (revenueMatch) {
      const pctOrAmount = revenueMatch[1] || revenueMatch[2]
      const isPercentage = message.includes('%')
      changes.push({
        type: 'revenue',
        description: `Revenue ${isPercentage ? 'increase by ' + pctOrAmount + '%' : 'increase by $' + pctOrAmount + 'k/month'}`,
        monthlyImpact: isPercentage ? 0 : parseInt(pctOrAmount) * 1000 // positive = reduces burn
      })
    }

    // Default: if no specific pattern, return generic change
    if (changes.length === 0) {
      changes.push({
        type: 'custom',
        description: 'Custom scenario change',
        monthlyImpact: -10000 // default assumption
      })
    }

    return changes
  }

  /**
   * Generate narrative summary for scenario
   */
  private generateScenarioSummary(changes: ScenarioChange[], result: any): string {
    const runwayChange = result.after.runway - result.before.runway
    const burnChange = result.after.monthlyBurn - result.before.monthlyBurn
    
    let summary = `📊 **Scenario Analysis Complete**\n\n`
    
    // Impact statement
    if (runwayChange < -3) {
      summary += `⚠️ **Warning**: This scenario significantly reduces your runway from **${result.before.runway.toFixed(1)} months** to **${result.after.runway.toFixed(1)} months** (${Math.abs(runwayChange).toFixed(1)} month decrease).\n\n`
    } else if (runwayChange > 3) {
      summary += `✅ **Positive Impact**: This scenario extends your runway from **${result.before.runway.toFixed(1)} months** to **${result.after.runway.toFixed(1)} months** (+${runwayChange.toFixed(1)} months).\n\n`
    } else {
      summary += `The changes result in a **${result.after.runway.toFixed(1)} month runway** (${runwayChange >= 0 ? '+' : ''}${runwayChange.toFixed(1)} month change).\n\n`
    }
    
    // Burn rate impact
    summary += `Your monthly burn rate would ${burnChange > 0 ? 'increase' : 'decrease'} from **$${result.before.monthlyBurn.toLocaleString()}** to **$${result.after.monthlyBurn.toLocaleString()}** (${burnChange >= 0 ? '+' : ''}$${Math.abs(burnChange).toLocaleString()}/month).\n\n`
    
    // Changes applied
    summary += `**Changes Applied:**\n`
    changes.forEach(change => {
      summary += `• ${change.description}\n`
    })
    
    // Cash zero date
    summary += `\n💰 **New Cash Zero Date**: ${result.changes.cashZeroDate}`
    
    return summary
  }

  /**
   * Extract scenario name from message
   */
  private extractScenarioName(message: string, changes: ScenarioChange[]): string {
    if (message.length < 50) return message
    return changes.map(c => c.type).join(' + ').toUpperCase() + ' Scenario'
  }

  /**
   * Feature #1: FP&A - Forecasting
   */
  private async handleForecast(
    message: string,
    context: FinancialMetrics
  ): Promise<EnhancedMessage> {
    // Generate 12-month forecast
    const forecast = FinancialEngine.generateForecast(context, 12)
    
    // Generate summary
    let summary = `📈 **Cash Flow Forecast - Next 12 Months**\n\n`
    summary += `Based on your current metrics:\n`
    summary += `• Starting Cash: **$${context.cashBalance.toLocaleString()}**\n`
    summary += `• Monthly Burn: **$${context.monthlyBurn.toLocaleString()}**\n`
    summary += `• Monthly Revenue: **$${context.monthlyRevenue?.toLocaleString() || context.mrr.toLocaleString()}**\n\n`
    
    if (forecast.cashZeroDate) {
      summary += `⚠️ **Critical**: You will run out of cash in **${forecast.cashZeroDate}** at the current burn rate.\n\n`
    } else {
      summary += `✅ **Good news**: At current burn rates, you have sufficient runway for the next 12+ months.\n\n`
    }
    
    summary += `**Key Projections:**\n`
    summary += `• Average Monthly Burn: $${forecast.averageBurn.toLocaleString()}\n`
    summary += `• Total Revenue (12mo): $${forecast.totalRevenue.toLocaleString()}\n`
    summary += `• Total Expenses (12mo): $${forecast.totalExpenses.toLocaleString()}\n`
    
    return {
      type: 'forecast',
      message: summary,
      data: {
        forecast: forecast.projections.slice(0, 6), // Show first 6 months in detail
        assumptions: forecast.assumptions,
        cashZeroDate: forecast.cashZeroDate
      },
      chart: {
        type: 'line',
        data: forecast.projections.map(p => ({
          month: p.month,
          cash: p.cash,
          runway: p.runway
        })),
        config: {
          xKey: 'month',
          yKeys: ['cash', 'runway'],
          colors: ['#10b981', '#f59e0b']
        }
      },
      actions: [
        { label: 'View Interactive Chart', action: 'open_chart', variant: 'outline' },
        { label: 'Export Forecast', action: 'export_forecast', variant: 'default' },
        { label: 'Adjust Assumptions', action: 'adjust_assumptions', variant: 'outline' }
      ]
    }
  }

  /**
   * Feature #2: Fundraising - KPI Dashboard
   */
  private async handleKPIDashboard(
    message: string,
    context: FinancialMetrics
  ): Promise<EnhancedMessage> {
    // Calculate investor KPIs
    const kpis = FinancialEngine.calculateInvestorKPIs({
      arr: context.arr,
      mrr: context.mrr,
      monthlyRevenue: context.monthlyRevenue,
      cashBalance: context.cashBalance,
      monthlyBurn: context.monthlyBurn,
      grossMargin: context.grossMargin
    })
    
    // Benchmark key metrics
    const ltvCacBenchmark = FinancialEngine.benchmarkKPI('ltvCacRatio', kpis.ltvCacRatio, 'series-a')
    const nrrBenchmark = FinancialEngine.benchmarkKPI('nrr', kpis.nrr, 'series-a')
    const marginBenchmark = FinancialEngine.benchmarkKPI('grossMargin', kpis.grossMargin, 'series-a')
    
    let summary = `💼 **Investor KPI Dashboard**\n\n`
    summary += `Here are your key metrics benchmarked against Series A companies:\n\n`
    summary += `**Growth Metrics:**\n`
    summary += `• ARR: **$${kpis.arr.toLocaleString()}** (↑ ${kpis.growthRate}% growth)\n`
    summary += `• MRR: **$${kpis.mrr.toLocaleString()}**\n\n`
    
    summary += `**Unit Economics:**\n`
    summary += `• LTV:CAC Ratio: **${kpis.ltvCacRatio.toFixed(1)}** - ${ltvCacBenchmark.comparison}\n`
    summary += `• Net Revenue Retention: **${kpis.nrr.toFixed(0)}%** - ${nrrBenchmark.rating}\n`
    summary += `• Gross Margin: **${kpis.grossMargin.toFixed(0)}%** - ${marginBenchmark.rating}\n\n`
    
    summary += `**Financial Health:**\n`
    summary += `• Cash Balance: **$${kpis.cashBalance.toLocaleString()}**\n`
    summary += `• Runway: **${kpis.runway.toFixed(1)} months**\n`
    summary += `• Burn Multiple: **${kpis.burnMultiple.toFixed(1)}**\n`
    
    return {
      type: 'kpi_dashboard',
      message: summary,
      data: {
        kpis: [
          { name: 'ARR', value: kpis.arr, unit: '', icon: 'dollar', change: kpis.growthRate, benchmark: ltvCacBenchmark },
          { name: 'LTV:CAC', value: kpis.ltvCacRatio.toFixed(1), icon: 'trending', benchmark: ltvCacBenchmark },
          { name: 'NRR', value: kpis.nrr.toFixed(0), unit: '%', icon: 'percent', benchmark: nrrBenchmark },
          { name: 'Gross Margin', value: kpis.grossMargin.toFixed(0), unit: '%', icon: 'percent', benchmark: marginBenchmark },
          { name: 'Runway', value: kpis.runway.toFixed(1), unit: 'mo', icon: 'trending' },
          { name: 'Burn Multiple', value: kpis.burnMultiple.toFixed(1), icon: 'dollar' }
        ]
      },
      actions: [
        { label: 'View Full Dashboard', action: 'open_dashboard', variant: 'outline' },
        { label: 'Download PDF Report', action: 'download_pdf', variant: 'default' },
        { label: 'Create Shareable Link', action: 'create_link', variant: 'secondary' }
      ]
    }
  }

  /**
   * Feature #4: Equity Management - Cap Table Modeling
   */
  private async handleCapTable(
    message: string,
    context: FinancialMetrics
  ): Promise<EnhancedMessage> {
    // Extract funding parameters
    const investmentAmount = this.extractAmount(message) || 10000000 // $10M default
    const preMoneyVal = this.extractValuation(message) || 100000000 // $100M default
    const optionPoolPct = this.extractPercentage(message) || 0.10 // 10% default
    
    // Mock current cap table
    const currentCapTable = [
      { name: 'Founders', shares: 6000000, percentage: 60 },
      { name: 'Seed Investors', shares: 1500000, percentage: 15 },
      { name: 'Series A Investors', shares: 2000000, percentage: 20 },
      { name: 'ESOP', shares: 500000, percentage: 5 }
    ]
    
    // Model dilution
    const dilutionModel = FinancialEngine.modelEquityDilution(currentCapTable, {
      amount: investmentAmount,
      preMoneyValuation: preMoneyVal,
      newOptionPoolPct: optionPoolPct
    })
    
    let summary = `📈 **Equity Dilution Analysis**\n\n`
    summary += `Modeling a **$${(investmentAmount / 1e6).toFixed(1)}M** investment at a **$${(preMoneyVal / 1e6).toFixed(0)}M pre-money valuation** with a **${(optionPoolPct * 100).toFixed(0)}% option pool refresh**.\n\n`
    summary += `**Valuation Summary:**\n`
    summary += `• Pre-Money: $${(dilutionModel.summary.preMoneyValuation / 1e6).toFixed(1)}M\n`
    summary += `• Post-Money: $${(dilutionModel.summary.postMoneyValuation / 1e6).toFixed(1)}M\n`
    summary += `• Price per Share: $${dilutionModel.summary.pricePerShare.toFixed(2)}\n\n`
    summary += `See the ownership changes table below.`
    
    // Prepare stakeholder comparison
    const stakeholders = dilutionModel.after.map(afterStakeholder => {
      const beforeStakeholder = dilutionModel.before.find(b => b.name === afterStakeholder.name)
      return {
        name: afterStakeholder.name,
        beforePct: beforeStakeholder?.percentage || 0,
        afterPct: afterStakeholder.percentage,
        change: afterStakeholder.percentage - (beforeStakeholder?.percentage || 0)
      }
    })
    
    return {
      type: 'cap_table',
      message: summary,
      data: {
        scenarioName: `Series B - $${(investmentAmount / 1e6).toFixed(1)}M Round`,
        stakeholders,
        summary: {
          preMoneyValuation: dilutionModel.summary.preMoneyValuation,
          investmentAmount: dilutionModel.summary.investmentAmount,
          postMoneyValuation: dilutionModel.summary.postMoneyValuation
        }
      },
      actions: [
        { label: 'View Full Cap Table', action: 'open_cap_table', variant: 'outline' },
        { label: 'Export to Carta', action: 'export_carta', variant: 'default' },
        { label: 'Model Different Terms', action: 'model_different', variant: 'outline' }
      ]
    }
  }

  /**
   * Fundraising agent: find investors using Crust Data
   */
  private async handleFindInvestors(
    message: string,
    context: FinancialMetrics
  ): Promise<EnhancedMessage> {
    const result = await findInvestorsFromCrust({
      minFundingUsd: 500_000,
      minHeadcount: 5,
      limit: 25,
    })

    const hasInvestors = result.investors.length > 0
    let summary = `🔍 **Investor discovery (Crust Data)**\n\n`
    if (result.message) {
      summary += `${result.message}\n\n`
    }
    if (hasInvestors) {
      summary += `I found **${result.investors.length}** investors from companies with similar funding profiles. `
      summary += `These investors have backed companies that have raised $1M+ and have 5+ employees. `
      summary += `Use the list below to research and prioritize your outreach.\n\n`
    } else {
      summary += `No investor matches returned. Try again or adjust criteria (e.g. lower funding threshold).\n\n`
    }

    return {
      type: 'find_investors',
      message: summary,
      data: {
        investors: result.investors,
        companies: result.companies.slice(0, 10),
        source: result.source,
        totalCompanies: result.companies.length,
      },
      actions: [
        { label: 'Refresh list', action: 'find_investors', variant: 'outline' },
        { label: 'Investor KPIs', action: 'open_investor_kpis', variant: 'secondary' },
      ],
    }
  }

  /**
   * General query handler
   */
  private async handleGeneralQuery(
    message: string,
    context: FinancialMetrics
  ): Promise<EnhancedMessage> {
    // Use existing Gemini analysis
    const response = await this.gemini.analyzeFinancialData(context, message)
    
    return {
      type: 'text',
      message: response.text || response.message || response
    }
  }

  /**
   * Helper: Extract dollar amount from message
   */
  private extractAmount(message: string): number | null {
    const match = message.match(/\$?(\d+(?:\.\d+)?)\s*([MmKk]?)/)
    if (!match) return null
    
    const num = parseFloat(match[1])
    const multiplier = match[2].toLowerCase()
    
    if (multiplier === 'm') return num * 1000000
    if (multiplier === 'k') return num * 1000
    return num
  }

  /**
   * Helper: Extract valuation from message
   */
  private extractValuation(message: string): number | null {
    const match = message.match(/\$?(\d+(?:\.\d+)?)\s*([MmKk]?)\s+(?:pre-money|pre|valuation)/)
    if (!match) return null
    
    const num = parseFloat(match[1])
    const multiplier = match[2].toLowerCase()
    
    if (multiplier === 'm') return num * 1000000
    if (multiplier === 'k') return num * 1000
    return num
  }

  /**
   * Helper: Extract percentage from message
   */
  private extractPercentage(message: string): number | null {
    const match = message.match(/(\d+(?:\.\d+)?)\s*%/)
    if (!match) return null
    return parseFloat(match[1]) / 100
  }
}

// Singleton instance
let aiCFOClient: AICFOClient | null = null

export function getAICFOClient(): AICFOClient {
  if (!aiCFOClient) {
    aiCFOClient = new AICFOClient()
  }
  return aiCFOClient
}
