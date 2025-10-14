/**
 * Startup Equity & Funding Stage Calculator
 * Calculates equity distribution across multiple funding rounds
 */

export interface EquityStakeholder {
  name: string
  shares: number
  percentage: number
}

export interface FundingRound {
  name: string
  preMoneyValuation: number
  investment: number
  postMoneyValuation: number
  investorEquityPercent: number
  stakeholders: EquityStakeholder[]
  newInvestorName: string
  newInvestorShares: number
  newInvestorPercent: number
}

export interface EquityCalculationInput {
  founders: Array<{ name: string; percentage: number }>
  totalShares: number
  optionPoolPercent?: number
  rounds: Array<{
    name: string
    preMoneyValuation: number
    investment: number
    investorName: string
  }>
}

export interface EquityCalculationResult {
  rounds: FundingRound[]
  finalOwnership: Array<{
    stakeholder: string
    percentages: Record<string, number>
  }>
  insights: string[]
  totalShares: number
}

export class EquityCalculator {
  private totalShares: number
  private stakeholders: Map<string, number> // name -> shares

  constructor(totalShares: number = 10_000_000) {
    this.totalShares = totalShares
    this.stakeholders = new Map()
  }

  /**
   * Initialize with founders
   */
  initializeFounders(founders: Array<{ name: string; percentage: number }>) {
    founders.forEach(founder => {
      const shares = Math.round((founder.percentage / 100) * this.totalShares)
      this.stakeholders.set(founder.name, shares)
    })
  }

  /**
   * Add option pool (pre-money)
   */
  addOptionPool(percentage: number) {
    // Option pool dilutes existing shareholders
    const poolShares = Math.round((percentage / 100) * this.totalShares)
    
    // Dilute existing shareholders proportionally
    const dilutionFactor = (this.totalShares - poolShares) / this.totalShares
    
    for (const [name, shares] of this.stakeholders) {
      this.stakeholders.set(name, Math.round(shares * dilutionFactor))
    }
    
    this.stakeholders.set('Employee Option Pool', poolShares)
  }

  /**
   * Process a funding round
   */
  processFundingRound(
    roundName: string,
    preMoneyValuation: number,
    investment: number,
    investorName: string
  ): FundingRound {
    // Calculate post-money valuation
    const postMoneyValuation = preMoneyValuation + investment

    // Calculate investor equity percentage
    const investorEquityPercent = (investment / postMoneyValuation) * 100

    // Calculate new shares to issue to investor
    const existingTotalShares = Array.from(this.stakeholders.values()).reduce((a, b) => a + b, 0)
    
    // Formula: investor_shares = existing_shares * (investor% / (1 - investor%))
    const investorShares = Math.round(
      existingTotalShares * (investorEquityPercent / (100 - investorEquityPercent))
    )

    // Update total shares
    this.totalShares = existingTotalShares + investorShares

    // Record stakeholders before dilution
    const stakeholdersBeforeDilution = new Map(this.stakeholders)

    // Add new investor
    this.stakeholders.set(investorName, investorShares)

    // Create stakeholder list with percentages
    const stakeholders: EquityStakeholder[] = []
    
    for (const [name, shares] of this.stakeholders) {
      const percentage = (shares / this.totalShares) * 100
      stakeholders.push({ name, shares, percentage })
    }

    // Sort by percentage descending
    stakeholders.sort((a, b) => b.percentage - a.percentage)

    return {
      name: roundName,
      preMoneyValuation,
      investment,
      postMoneyValuation,
      investorEquityPercent,
      stakeholders,
      newInvestorName: investorName,
      newInvestorShares: investorShares,
      newInvestorPercent: investorEquityPercent,
    }
  }

  /**
   * Get current ownership snapshot
   */
  getCurrentOwnership(): EquityStakeholder[] {
    const stakeholders: EquityStakeholder[] = []
    
    for (const [name, shares] of this.stakeholders) {
      const percentage = (shares / this.totalShares) * 100
      stakeholders.push({ name, shares, percentage })
    }

    stakeholders.sort((a, b) => b.percentage - a.percentage)
    return stakeholders
  }

  /**
   * Full equity calculation across all rounds
   */
  static calculateEquity(input: EquityCalculationInput): EquityCalculationResult {
    const calculator = new EquityCalculator(input.totalShares)

    // Initialize founders
    calculator.initializeFounders(input.founders)

    // Add option pool if specified
    if (input.optionPoolPercent && input.optionPoolPercent > 0) {
      calculator.addOptionPool(input.optionPoolPercent)
    }

    // Track ownership evolution
    const ownershipEvolution = new Map<string, number[]>()
    
    // Record initial state (pre-funding)
    const initialOwnership = calculator.getCurrentOwnership()
    initialOwnership.forEach(s => {
      ownershipEvolution.set(s.name, [s.percentage])
    })

    // Process each funding round
    const rounds: FundingRound[] = []
    
    for (const round of input.rounds) {
      const fundingRound = calculator.processFundingRound(
        round.name,
        round.preMoneyValuation,
        round.investment,
        round.investorName
      )
      
      rounds.push(fundingRound)

      // Record ownership after this round
      fundingRound.stakeholders.forEach(s => {
        if (!ownershipEvolution.has(s.name)) {
          // New stakeholder, fill previous rounds with 0
          ownershipEvolution.set(s.name, Array(rounds.length).fill(0))
        }
        const history = ownershipEvolution.get(s.name)!
        history.push(s.percentage)
      })

      // Update existing stakeholders who didn't appear in this round
      for (const [name, history] of ownershipEvolution) {
        if (history.length < rounds.length + 1) {
          history.push(0) // They were diluted to 0 or merged
        }
      }
    }

    // Build final ownership summary
    const finalOwnership: Array<{
      stakeholder: string
      percentages: Record<string, number>
    }> = []

    const roundNames = ['Initial', ...input.rounds.map(r => r.name)]

    for (const [stakeholder, percentages] of ownershipEvolution) {
      const percentageMap: Record<string, number> = {}
      roundNames.forEach((name, idx) => {
        percentageMap[name] = percentages[idx] || 0
      })
      finalOwnership.push({ stakeholder, percentages: percentageMap })
    }

    // Sort by final percentage
    finalOwnership.sort((a, b) => {
      const aFinal = Object.values(a.percentages).slice(-1)[0]
      const bFinal = Object.values(b.percentages).slice(-1)[0]
      return bFinal - aFinal
    })

    // Generate insights
    const insights = this.generateInsights(rounds, finalOwnership, input)

    return {
      rounds,
      finalOwnership,
      insights,
      totalShares: calculator.totalShares,
    }
  }

  /**
   * Generate insights from equity calculation
   */
  private static generateInsights(
    rounds: FundingRound[],
    finalOwnership: Array<{ stakeholder: string; percentages: Record<string, number> }>,
    input: EquityCalculationInput
  ): string[] {
    const insights: string[] = []

    if (rounds.length === 0) return ['No funding rounds to analyze.']

    // Calculate total founder retention
    const founderNames = input.founders.map(f => f.name)
    const finalFounderOwnership = finalOwnership
      .filter(s => founderNames.includes(s.stakeholder))
      .reduce((sum, s) => sum + Object.values(s.percentages).slice(-1)[0], 0)

    // Calculate total investor ownership
    const investorOwnership = finalOwnership
      .filter(s => s.stakeholder.includes('Investor') || s.stakeholder.includes('Seed') || s.stakeholder.includes('Series'))
      .reduce((sum, s) => sum + Object.values(s.percentages).slice(-1)[0], 0)

    // Insight 1: Founder retention
    if (finalFounderOwnership >= 40) {
      insights.push(`✅ Founders retain ${finalFounderOwnership.toFixed(1)}% ownership, showing healthy control and growth trajectory.`)
    } else if (finalFounderOwnership >= 25) {
      insights.push(`⚠️ Founders retain ${finalFounderOwnership.toFixed(1)}% ownership. Consider future dilution carefully.`)
    } else {
      insights.push(`🚨 Founders retain only ${finalFounderOwnership.toFixed(1)}% ownership. This is below typical benchmarks for founder control.`)
    }

    // Insight 2: Investor ownership
    insights.push(`📊 Investors collectively own ${investorOwnership.toFixed(1)}%, reflecting ${rounds.length === 1 ? 'early-stage' : 'multi-stage'} investment.`)

    // Insight 3: Dilution analysis
    const lastRound = rounds[rounds.length - 1]
    if (lastRound.investorEquityPercent < 20) {
      insights.push(`💡 Last round dilution was ${lastRound.investorEquityPercent.toFixed(1)}% - excellent! High valuation minimized dilution.`)
    } else if (lastRound.investorEquityPercent < 30) {
      insights.push(`💰 Last round dilution was ${lastRound.investorEquityPercent.toFixed(1)}% - typical for ${lastRound.name}.`)
    } else {
      insights.push(`⚠️ Last round dilution was ${lastRound.investorEquityPercent.toFixed(1)}% - consider higher valuation next round.`)
    }

    // Insight 4: Valuation growth
    if (rounds.length > 1) {
      const firstValuation = rounds[0].postMoneyValuation
      const lastValuation = rounds[rounds.length - 1].postMoneyValuation
      const growth = ((lastValuation - firstValuation) / firstValuation) * 100
      
      insights.push(`📈 Company valuation grew ${growth.toFixed(0)}% from ${this.formatCurrency(firstValuation)} to ${this.formatCurrency(lastValuation)}.`)
    }

    // Insight 5: Option pool
    const optionPool = finalOwnership.find(s => s.stakeholder.includes('Option'))
    if (optionPool) {
      const optionPercent = Object.values(optionPool.percentages).slice(-1)[0]
      if (optionPercent >= 10) {
        insights.push(`🎯 Employee option pool is ${optionPercent.toFixed(1)}% - sufficient for hiring key talent.`)
      } else {
        insights.push(`⚠️ Option pool is ${optionPercent.toFixed(1)}% - may need refresh before next hiring wave.`)
      }
    }

    return insights
  }

  /**
   * Format currency
   */
  private static formatCurrency(amount: number): string {
    if (amount >= 1_000_000_000) {
      return `$${(amount / 1_000_000_000).toFixed(1)}B`
    } else if (amount >= 1_000_000) {
      return `$${(amount / 1_000_000).toFixed(1)}M`
    } else if (amount >= 1_000) {
      return `$${(amount / 1_000).toFixed(0)}K`
    }
    return `$${amount.toLocaleString()}`
  }
}

