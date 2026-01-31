/**
 * Financial Modeling Engine
 * Powers FP&A, forecasting, scenario analysis, and KPI calculations
 */

export interface FinancialMetrics {
  cashBalance: number
  monthlyBurn: number
  monthlyRevenue: number
  runway: number // in months
  mrr: number
  arr: number
  growthRate: number // percentage
  grossMargin: number // percentage
  burnMultiple: number
}

export interface ScenarioChange {
  type: 'hiring' | 'marketing' | 'revenue' | 'cost_reduction' | 'custom'
  description: string
  monthlyImpact: number // positive for revenue, negative for expenses
  startDate?: Date
  oneTimeCost?: number
}

export interface ForecastResult {
  projections: Array<{
    month: string
    cash: number
    revenue: number
    expenses: number
    burn: number
    runway: number
  }>
  cashZeroDate: string | null
  averageBurn: number
  totalRevenue: number
  totalExpenses: number
  assumptions: string[]
}

export interface ScenarioResult {
  before: FinancialMetrics
  after: FinancialMetrics
  changes: {
    runway: number // change in months
    monthlyBurn: number // change in burn
    cashZeroDate: string // new date
  }
  impact: 'positive' | 'negative' | 'neutral'
  severity: 'low' | 'medium' | 'high' | 'critical'
}

export interface InvestorKPIs {
  arr: number
  mrr: number
  growthRate: number // MoM or QoQ
  ltv: number
  cac: number
  ltvCacRatio: number
  nrr: number // Net Revenue Retention
  grossMargin: number
  burnMultiple: number
  cashBalance: number
  runway: number
  employeeCount?: number
  revenuePerEmployee?: number
}

/**
 * Financial Modeling Engine
 */
export class FinancialEngine {
  /**
   * Calculate runway from current financial metrics
   */
  static calculateRunway(cashBalance: number, monthlyBurn: number): number {
    if (monthlyBurn <= 0) return Infinity
    return Math.max(0, cashBalance / monthlyBurn)
  }

  /**
   * Calculate cash zero date
   */
  static calculateCashZeroDate(cashBalance: number, monthlyBurn: number): Date | null {
    if (monthlyBurn <= 0) return null
    const runwayMonths = this.calculateRunway(cashBalance, monthlyBurn)
    if (runwayMonths === Infinity) return null
    
    const today = new Date()
    const cashZeroDate = new Date(today)
    cashZeroDate.setMonth(today.getMonth() + Math.floor(runwayMonths))
    return cashZeroDate
  }

  /**
   * Generate cash flow forecast for next N months
   */
  static generateForecast(
    currentMetrics: FinancialMetrics,
    monthsAhead: number = 12,
    assumptions?: {
      revenueGrowthRate?: number // monthly growth as decimal
      burnGrowthRate?: number // monthly burn change as decimal
      seasonalityFactors?: number[] // monthly multipliers
    }
  ): ForecastResult {
    const projections = []
    const revenueGrowth = assumptions?.revenueGrowthRate ?? currentMetrics.growthRate / 100 / 12 // Convert annual to monthly
    const burnGrowth = assumptions?.burnGrowthRate ?? 0
    
    let cash = currentMetrics.cashBalance
    let monthlyRevenue = currentMetrics.monthlyRevenue || currentMetrics.mrr
    let monthlyBurn = currentMetrics.monthlyBurn
    
    const today = new Date()
    const assumptionsList: string[] = [
      `Starting cash: $${cash.toLocaleString()}`,
      `Initial monthly revenue: $${monthlyRevenue.toLocaleString()}`,
      `Initial monthly burn: $${monthlyBurn.toLocaleString()}`,
      `Revenue growth: ${(revenueGrowth * 100).toFixed(1)}% per month`,
      burnGrowth !== 0 ? `Burn growth: ${(burnGrowth * 100).toFixed(1)}% per month` : null
    ].filter(Boolean) as string[]

    for (let i = 0; i < monthsAhead; i++) {
      const monthDate = new Date(today)
      monthDate.setMonth(today.getMonth() + i)
      const monthStr = monthDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
      
      // Apply seasonality if provided
      const seasonalityFactor = assumptions?.seasonalityFactors?.[i % 12] ?? 1
      
      // Calculate for this month
      const revenue = monthlyRevenue * seasonalityFactor
      const expenses = monthlyBurn * (1 + burnGrowth * i)
      const netBurn = expenses - revenue
      cash = cash - netBurn
      
      const runway = cash > 0 ? this.calculateRunway(cash, netBurn) : 0
      
      projections.push({
        month: monthStr,
        cash: Math.max(0, cash),
        revenue,
        expenses,
        burn: netBurn,
        runway
      })
      
      // Update for next iteration
      monthlyRevenue = monthlyRevenue * (1 + revenueGrowth)
      
      // Stop if we run out of cash
      if (cash <= 0) break
    }
    
    const cashZeroProjection = projections.find(p => p.cash <= 0)
    const cashZeroDate = cashZeroProjection?.month ?? null
    
    return {
      projections,
      cashZeroDate,
      averageBurn: projections.reduce((sum, p) => sum + p.burn, 0) / projections.length,
      totalRevenue: projections.reduce((sum, p) => sum + p.revenue, 0),
      totalExpenses: projections.reduce((sum, p) => sum + p.expenses, 0),
      assumptions: assumptionsList
    }
  }

  /**
   * Model a scenario change (what-if analysis)
   */
  static modelScenario(
    currentMetrics: FinancialMetrics,
    changes: ScenarioChange[]
  ): ScenarioResult {
    // Calculate current state
    const before = { ...currentMetrics }
    
    // Calculate total monthly impact
    const totalMonthlyImpact = changes.reduce((sum, change) => sum + change.monthlyImpact, 0)
    const totalOneTimeCost = changes.reduce((sum, change) => sum + (change.oneTimeCost || 0), 0)
    
    // Calculate new metrics
    const newCashBalance = currentMetrics.cashBalance - totalOneTimeCost
    const newMonthlyBurn = currentMetrics.monthlyBurn - totalMonthlyImpact // negative impact increases burn
    const newRunway = this.calculateRunway(newCashBalance, newMonthlyBurn)
    
    const after: FinancialMetrics = {
      ...currentMetrics,
      cashBalance: newCashBalance,
      monthlyBurn: newMonthlyBurn,
      runway: newRunway
    }
    
    // Calculate changes
    const runwayChange = after.runway - before.runway
    const burnChange = after.monthlyBurn - before.monthlyBurn
    const cashZeroDate = this.calculateCashZeroDate(after.cashBalance, after.monthlyBurn)
    
    // Determine impact and severity
    let impact: 'positive' | 'negative' | 'neutral' = 'neutral'
    let severity: 'low' | 'medium' | 'high' | 'critical' = 'low'
    
    if (runwayChange < -3) {
      impact = 'negative'
      severity = runwayChange < -6 ? 'critical' : 'high'
    } else if (runwayChange > 3) {
      impact = 'positive'
      severity = 'medium'
    } else if (Math.abs(runwayChange) < 1) {
      impact = 'neutral'
      severity = 'low'
    } else {
      impact = runwayChange < 0 ? 'negative' : 'positive'
      severity = 'medium'
    }
    
    return {
      before,
      after,
      changes: {
        runway: runwayChange,
        monthlyBurn: burnChange,
        cashZeroDate: cashZeroDate?.toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) || 'Never'
      },
      impact,
      severity
    }
  }

  /**
   * Calculate investor-focused KPIs
   */
  static calculateInvestorKPIs(
    financialData: {
      arr?: number
      mrr?: number
      monthlyRevenue?: number
      customerLifetimeValue?: number
      customerAcquisitionCost?: number
      churnRate?: number // monthly churn as decimal
      grossMargin?: number
      cashBalance: number
      monthlyBurn: number
      employeeCount?: number
    }
  ): InvestorKPIs {
    const mrr = financialData.mrr || financialData.monthlyRevenue || 0
    const arr = financialData.arr || mrr * 12
    
    // Calculate NRR (Net Revenue Retention) - simplified
    const churnRate = financialData.churnRate || 0.05 // assume 5% if not provided
    const nrr = (1 - churnRate) * 100
    
    // LTV:CAC ratio
    const ltv = financialData.customerLifetimeValue || mrr / churnRate
    const cac = financialData.customerAcquisitionCost || 1000 // default assumption
    const ltvCacRatio = ltv / cac
    
    // Gross Margin
    const grossMargin = financialData.grossMargin || 70 // assume 70% for SaaS
    
    // Burn Multiple (how many $ burned for each $ of new ARR)
    const burnMultiple = financialData.monthlyBurn / (mrr || 1)
    
    // Runway
    const runway = this.calculateRunway(financialData.cashBalance, financialData.monthlyBurn)
    
    // Revenue per employee
    const revenuePerEmployee = financialData.employeeCount 
      ? arr / financialData.employeeCount 
      : undefined
    
    return {
      arr,
      mrr,
      growthRate: 25, // This should be calculated from historical data
      ltv,
      cac,
      ltvCacRatio,
      nrr,
      grossMargin,
      burnMultiple,
      cashBalance: financialData.cashBalance,
      runway,
      employeeCount: financialData.employeeCount,
      revenuePerEmployee
    }
  }

  /**
   * Benchmark KPI against industry standards
   */
  static benchmarkKPI(
    kpiName: string,
    kpiValue: number,
    companyStage: 'seed' | 'series-a' | 'series-b' | 'series-c'
  ): {
    percentile: number
    rating: 'poor' | 'below-average' | 'average' | 'good' | 'excellent'
    comparison: string
  } {
    // Industry benchmarks (simplified - in production, use real data)
    const benchmarks: Record<string, Record<string, { p25: number, p50: number, p75: number, p90: number }>> = {
      'ltvCacRatio': {
        'seed': { p25: 1.5, p50: 2.5, p75: 3.5, p90: 5.0 },
        'series-a': { p25: 2.0, p50: 3.0, p75: 4.0, p90: 6.0 },
        'series-b': { p25: 2.5, p50: 3.5, p75: 5.0, p90: 7.0 },
        'series-c': { p25: 3.0, p50: 4.0, p75: 6.0, p90: 8.0 }
      },
      'nrr': {
        'seed': { p25: 90, p50: 100, p75: 110, p90: 120 },
        'series-a': { p25: 95, p50: 105, p75: 115, p90: 125 },
        'series-b': { p25: 100, p50: 110, p75: 120, p90: 130 },
        'series-c': { p25: 105, p50: 115, p75: 125, p90: 135 }
      },
      'grossMargin': {
        'seed': { p25: 60, p50: 70, p75: 80, p90: 85 },
        'series-a': { p25: 65, p50: 75, p75: 82, p90: 88 },
        'series-b': { p25: 70, p50: 78, p75: 85, p90: 90 },
        'series-c': { p25: 72, p50: 80, p75: 87, p90: 92 }
      }
    }
    
    const benchmark = benchmarks[kpiName]?.[companyStage]
    if (!benchmark) {
      return { percentile: 50, rating: 'average', comparison: 'No benchmark data available' }
    }
    
    // Calculate percentile
    let percentile = 50
    let rating: 'poor' | 'below-average' | 'average' | 'good' | 'excellent' = 'average'
    
    if (kpiValue >= benchmark.p90) {
      percentile = 90
      rating = 'excellent'
    } else if (kpiValue >= benchmark.p75) {
      percentile = 75
      rating = 'good'
    } else if (kpiValue >= benchmark.p50) {
      percentile = 60
      rating = 'average'
    } else if (kpiValue >= benchmark.p25) {
      percentile = 35
      rating = 'below-average'
    } else {
      percentile = 20
      rating = 'poor'
    }
    
    const comparison = `Your ${kpiName} of ${kpiValue.toFixed(1)} is ${rating} and ranks in the ${percentile}th percentile for ${companyStage} companies.`
    
    return { percentile, rating, comparison }
  }

  /**
   * Model equity dilution from a funding round
   */
  static modelEquityDilution(
    currentCapTable: Array<{ name: string; shares: number; percentage: number }>,
    investment: {
      amount: number
      preMoneyValuation: number
      newOptionPoolPct?: number // as decimal (e.g., 0.10 for 10%)
    }
  ): {
    before: Array<{ name: string; shares: number; percentage: number }>
    after: Array<{ name: string; shares: number; percentage: number }>
    summary: {
      preMoneyValuation: number
      postMoneyValuation: number
      investmentAmount: number
      pricePerShare: number
      newShares: number
      optionPoolShares: number
    }
  } {
    const { amount, preMoneyValuation, newOptionPoolPct = 0 } = investment
    
    // Calculate total shares before investment
    const totalSharesBefore = currentCapTable.reduce((sum, s) => sum + s.shares, 0)
    
    // Calculate price per share
    const pricePerShare = preMoneyValuation / totalSharesBefore
    
    // Calculate new shares for investor
    const newInvestorShares = amount / pricePerShare
    
    // Calculate option pool shares
    const postMoneyValuation = preMoneyValuation + amount
    const totalSharesAfterInvestment = totalSharesBefore + newInvestorShares
    const optionPoolShares = newOptionPoolPct > 0 
      ? (totalSharesAfterInvestment * newOptionPoolPct) / (1 - newOptionPoolPct)
      : 0
    
    const totalSharesAfter = totalSharesAfterInvestment + optionPoolShares
    
    // Calculate after scenario
    const after = currentCapTable.map(stakeholder => ({
      ...stakeholder,
      percentage: (stakeholder.shares / totalSharesAfter) * 100
    }))
    
    // Add new investor
    after.push({
      name: 'New Investor',
      shares: newInvestorShares,
      percentage: (newInvestorShares / totalSharesAfter) * 100
    })
    
    // Add/update option pool
    const existingOptionPool = after.find(s => s.name === 'ESOP')
    if (existingOptionPool && optionPoolShares > 0) {
      existingOptionPool.shares += optionPoolShares
      existingOptionPool.percentage = (existingOptionPool.shares / totalSharesAfter) * 100
    } else if (optionPoolShares > 0) {
      after.push({
        name: 'ESOP',
        shares: optionPoolShares,
        percentage: (optionPoolShares / totalSharesAfter) * 100
      })
    }
    
    return {
      before: currentCapTable,
      after,
      summary: {
        preMoneyValuation,
        postMoneyValuation,
        investmentAmount: amount,
        pricePerShare,
        newShares: newInvestorShares,
        optionPoolShares
      }
    }
  }
}
