export type StartupStage = 'pre-seed' | 'seed' | 'series-a' | 'series-b'

export interface InvestmentInput {
  investmentAmount: number
  currentRevenue: number
  grossMargin: number // percentage
  operatingExpenses: number
  netIncome: number
  stage: StartupStage
  teamSize: number
  monthlyBurn: number
}

export interface AllocationCategory {
  category: string
  amount: number
  percentage: number
  rationale: string
}

export interface MonthlyProjection {
  month: number
  monthName: string
  revenue: number
  expenses: number
  burn: number
  cashRemaining: number
  milestone: string
}

export interface KPIRecommendation {
  metric: string
  target: string
  why: string
  currentEstimate?: string
}

export interface RiskAlert {
  risk: string
  severity: 'low' | 'medium' | 'high'
  mitigation: string
}

export interface InvestmentAnalysis {
  allocation: AllocationCategory[]
  projections: MonthlyProjection[]
  metrics: {
    newMonthlyBurn: number
    projectedRunway: number
    breakEvenMonth: number
    targetROI: number
  }
  kpis: KPIRecommendation[]
  risks: RiskAlert[]
  summary: string
  actionPlan: string[]
}

export class InvestmentAnalyzer {
  private getStageAllocations(stage: StartupStage): Record<string, number> {
    // Allocation percentages by startup stage - Optimized for maximum ROI
    const allocations = {
      'pre-seed': {
        product: 50, // Focus on MVP and core features
        marketing: 20, // Early customer validation and testing
        operations: 20, // Minimal team and basic infrastructure
        buffer: 10, // Emergency fund for 2-3 months
      },
      seed: {
        product: 35, // Scale product features and hire engineers
        marketing: 35, // Aggressive growth and customer acquisition
        operations: 20, // Expand team and improve systems
        buffer: 10, // Maintain healthy reserve
      },
      'series-a': {
        product: 25, // Product-market fit refinement
        marketing: 45, // Scale proven channels and build brand
        operations: 20, // Professional ops, HR, finance teams
        buffer: 10, // Strategic reserve
      },
      'series-b': {
        product: 20, // Advanced features and integrations
        marketing: 40, // Multi-channel expansion and enterprise sales
        operations: 30, // Full-scale operations and international expansion
        buffer: 10, // M&A and market downturn reserve
      },
    }

    return allocations[stage]
  }

  private getStageRationale(stage: StartupStage): Record<string, string> {
    const rationales = {
      'pre-seed': {
        product: 'Focus on building MVP and core features. Hire 1-2 key engineers.',
        marketing: 'Early customer acquisition and validation. Test channels.',
        operations: 'Basic infrastructure, legal, accounting. Minimal team.',
        buffer: 'Emergency fund for 2-3 months of unexpected costs.',
      },
      seed: {
        product: 'Scale product features. Hire 2-3 engineers and 1 designer.',
        marketing: 'Aggressive growth. Hire 1-2 marketers. Paid ads, content.',
        operations: 'Expand team. Hire ops, finance. Better tools and systems.',
        buffer: 'Emergency fund for unforeseen market changes.',
      },
      'series-a': {
        product: 'Product-market fit refinement. Hire senior engineers.',
        marketing: 'Scale proven channels. Build brand. Hire marketing team.',
        operations: 'Professional ops team. HR, finance, legal. Scale systems.',
        buffer: 'Maintain 2-3 months of operational buffer.',
      },
      'series-b': {
        product: 'Advanced features, integrations. Hire specialized engineers.',
        marketing: 'Multi-channel expansion. Enterprise sales. Large campaigns.',
        operations: 'Full-scale operations. Multiple departments. International.',
        buffer: 'Strategic reserve for M&A or market downturns.',
      },
    }

    return rationales[stage]
  }

  analyze(input: InvestmentInput): InvestmentAnalysis {
    const { investmentAmount, currentRevenue, grossMargin, operatingExpenses, stage, teamSize, monthlyBurn } = input

    // Calculate allocation
    const stageAllocation = this.getStageAllocations(stage)
    const rationales = this.getStageRationale(stage)

    const allocation: AllocationCategory[] = [
      {
        category: 'Product Development',
        amount: (investmentAmount * stageAllocation.product) / 100,
        percentage: stageAllocation.product,
        rationale: rationales.product,
      },
      {
        category: 'Marketing & Growth',
        amount: (investmentAmount * stageAllocation.marketing) / 100,
        percentage: stageAllocation.marketing,
        rationale: rationales.marketing,
      },
      {
        category: 'Operations & Team',
        amount: (investmentAmount * stageAllocation.operations) / 100,
        percentage: stageAllocation.operations,
        rationale: rationales.operations,
      },
      {
        category: 'Buffer / Emergency Fund',
        amount: (investmentAmount * stageAllocation.buffer) / 100,
        percentage: stageAllocation.buffer,
        rationale: rationales.buffer,
      },
    ]

    // Calculate new monthly burn (assuming investment will increase spend)
    const additionalMonthlySpend = investmentAmount * 0.12 // Assume 12% monthly deployment rate
    const newMonthlyBurn = monthlyBurn + additionalMonthlySpend

    // Calculate runway
    const projectedRunway = Math.floor(investmentAmount / newMonthlyBurn)

    // Generate 6-month projections
    const projections: MonthlyProjection[] = []
    const monthNames = ['Month 1', 'Month 2', 'Month 3', 'Month 4', 'Month 5', 'Month 6']
    const milestones = this.getMilestones(stage)

    let cashRemaining = investmentAmount
    let monthlyRevenue = currentRevenue / 12 // Convert annual to monthly

    for (let i = 0; i < 6; i++) {
      // Assume 5% monthly revenue growth with investment
      monthlyRevenue = monthlyRevenue * 1.05

      const monthlyExpenses = newMonthlyBurn
      const monthlyBurnAmount = monthlyExpenses - monthlyRevenue

      cashRemaining -= monthlyBurnAmount

      projections.push({
        month: i + 1,
        monthName: monthNames[i],
        revenue: Math.round(monthlyRevenue),
        expenses: Math.round(monthlyExpenses),
        burn: Math.round(monthlyBurnAmount),
        cashRemaining: Math.round(Math.max(0, cashRemaining)),
        milestone: milestones[i] || 'Continue growth trajectory',
      })
    }

    // Calculate break-even (simplified)
    const grossProfitMargin = grossMargin / 100
    const breakEvenRevenue = operatingExpenses / grossProfitMargin
    const currentAnnualRevenue = currentRevenue
    const revenueGrowthNeeded = breakEvenRevenue - currentAnnualRevenue
    const monthsToBreakEven = Math.ceil(revenueGrowthNeeded / (monthlyRevenue * 0.05 * 12))

    // KPI recommendations
    const kpis: KPIRecommendation[] = [
      {
        metric: 'Customer Acquisition Cost (CAC)',
        target: stage === 'pre-seed' ? '< $500' : stage === 'seed' ? '< $1,000' : '< $2,000',
        why: 'Measure marketing efficiency. Should be < 1/3 of LTV.',
        currentEstimate: 'Track from Month 1',
      },
      {
        metric: 'Lifetime Value (LTV)',
        target: stage === 'pre-seed' ? '> $1,500' : stage === 'seed' ? '> $5,000' : '> $10,000',
        why: 'Customer value over their lifetime. Aim for LTV:CAC ratio of 3:1.',
        currentEstimate: 'Calculate after 3 months',
      },
      {
        metric: 'Monthly Recurring Revenue (MRR)',
        target: `Grow 15-20% monthly`,
        why: 'Core metric for SaaS. Track growth consistency.',
        currentEstimate: `$${Math.round(monthlyRevenue).toLocaleString()}`,
      },
      {
        metric: 'Burn Multiple',
        target: '< 1.5x',
        why: 'Net burn / Net new ARR. Lower is better. Shows capital efficiency.',
        currentEstimate: `${(newMonthlyBurn / monthlyRevenue).toFixed(2)}x`,
      },
      {
        metric: 'Gross Margin',
        target: '> 70%',
        why: 'Profitability indicator. Higher margins = more sustainable.',
        currentEstimate: `${grossMargin}%`,
      },
    ]

    // Risk analysis
    const risks: RiskAlert[] = []

    if (newMonthlyBurn / monthlyRevenue > 3) {
      risks.push({
        risk: 'High Burn Multiple',
        severity: 'high',
        mitigation: 'Your burn is 3x+ your revenue. Focus on revenue growth or reduce expenses by 20%.',
      })
    }

    if (projectedRunway < 12) {
      risks.push({
        risk: 'Short Runway',
        severity: 'high',
        mitigation: `Only ${projectedRunway} months runway. Start fundraising in 6 months or cut burn by 30%.`,
      })
    }

    if (stageAllocation.marketing > 40 && monthlyRevenue < 10000) {
      risks.push({
        risk: 'Premature Scaling',
        severity: 'medium',
        mitigation: 'High marketing spend before product-market fit. Validate your channel ROI first.',
      })
    }

    if (teamSize < 5 && stageAllocation.operations > 25) {
      risks.push({
        risk: 'Over-investment in Operations',
        severity: 'low',
        mitigation: 'Small team with high ops spend. Consider outsourcing or delaying hires.',
      })
    }

    if (risks.length === 0) {
      risks.push({
        risk: 'No Critical Risks Detected',
        severity: 'low',
        mitigation: 'Continue monitoring burn rate and revenue growth monthly.',
      })
    }

    // Summary - Clean and readable format
    const summary = `Based on your ${stage.toUpperCase().replace('-', ' ')} stage and $${investmentAmount.toLocaleString()} investment, I recommend the following strategic allocation:

Product Development: $${allocation[0].amount.toLocaleString()} (${stageAllocation.product}%) - ${rationales.product}

Marketing & Growth: $${allocation[1].amount.toLocaleString()} (${stageAllocation.marketing}%) - ${rationales.marketing}

Operations & Team: $${allocation[2].amount.toLocaleString()} (${stageAllocation.operations}%) - ${rationales.operations}

Buffer/Emergency Fund: $${allocation[3].amount.toLocaleString()} (${stageAllocation.buffer}%) - ${rationales.buffer}

With this allocation, your new monthly burn will be $${Math.round(newMonthlyBurn).toLocaleString()}, giving you ${projectedRunway} months of runway. Aim to reach $${Math.round(monthlyRevenue * 1.3).toLocaleString()} in monthly revenue by Month 6. ${projectedRunway < 12 ? 'You should start preparing materials for your next funding round in 6 months to maintain healthy runway.' : 'Focus on scaling efficiently and hitting your growth milestones.'}`

    // Action plan - Stage-specific and detailed
    const monthlyProductBudget = Math.round((investmentAmount * stageAllocation.product) / 100 / 6)
    const monthlyMarketingBudget = Math.round((investmentAmount * stageAllocation.marketing) / 100 / 6)
    
    const actionPlan = stage === 'pre-seed' ? [
      `Month 1: Deploy $${monthlyProductBudget.toLocaleString()} to product development. Hire 1-2 engineers. Build MVP core features. Set up basic analytics and tracking.`,
      `Month 2: Launch early marketing campaigns with $${monthlyMarketingBudget.toLocaleString()}/month budget. Focus on organic channels (content, SEO, community). Get first 10 beta customers.`,
      `Month 3: Product validation phase. Gather user feedback, iterate on MVP. Start measuring CAC and LTV. Aim for $5K MRR milestone.`,
      `Month 4: Scale what works. If product-market fit signals are positive, increase marketing spend. Otherwise, pivot based on feedback. Hire 1 ops/support role.`,
      `Month 5: Mid-point review. Assess metrics: Are you hitting $10K+ MRR? Is CAC < $500? Adjust strategy if needed. Build financial model for next 12 months.`,
      `Month 6: Prepare seed round materials if runway < 9 months. Target 50+ active customers, $15K+ MRR. Create investor deck and financial projections.`,
    ] : stage === 'seed' ? [
      `Month 1: Hire 2-3 engineers and 1 designer. Invest $${monthlyProductBudget.toLocaleString()}/month in product scaling. Launch 1-2 major features.`,
      `Month 2: Ramp up marketing to $${monthlyMarketingBudget.toLocaleString()}/month. Test paid channels (Google Ads, LinkedIn, Facebook). Hire 1 marketer.`,
      `Month 3: Optimize customer acquisition. Track CAC, LTV, conversion rates. Scale channels with best ROI. Aim for $25K MRR.`,
      `Month 4: Expand operations. Hire ops, finance, and customer success roles. Implement CRM and financial systems.`,
      `Month 5: Product-market fit validation. Are customers staying? Is NRR > 100%? Hit 500 customers and $50K MRR.`,
      `Month 6: If runway < 12 months, start Series A prep. Otherwise, focus on hitting $100K MRR and profitability path.`,
    ] : stage === 'series-a' ? [
      `Month 1: Scale product team. Hire senior engineers and product managers. Invest in advanced features and integrations.`,
      `Month 2: Aggressive marketing push with $${monthlyMarketingBudget.toLocaleString()}/month. Build sales team. Launch brand campaigns.`,
      `Month 3: Expand to 2-3 new markets. Test product-market fit in each. Aim for $100K MRR across all markets.`,
      `Month 4: Build out operations. Hire HR, finance, legal teams. Implement enterprise-grade systems and processes.`,
      `Month 5: Push for $1M ARR. Optimize unit economics. Ensure LTV:CAC ratio is 3:1+. Build path to profitability.`,
      `Month 6: Prepare Series B if runway < 12 months and growth is strong. Otherwise, focus on operational excellence.`,
    ] : [
      `Month 1: Scale product for enterprise. Hire specialized engineers. Build advanced features, security, and compliance.`,
      `Month 2: Multi-channel marketing expansion with $${monthlyMarketingBudget.toLocaleString()}/month. Launch large brand campaigns.`,
      `Month 3: International expansion. Set up operations in 2-3 new countries. Localize product and marketing.`,
      `Month 4: Build full-scale operations. Multiple departments. Consider M&A opportunities.`,
      `Month 5: Push for $5M ARR. Focus on enterprise sales and long-term contracts. Build moat around product.`,
      `Month 6: Evaluate exit opportunities or prepare for IPO if metrics support it. Focus on sustainable growth.`,
    ]

    return {
      allocation,
      projections,
      metrics: {
        newMonthlyBurn: Math.round(newMonthlyBurn),
        projectedRunway,
        breakEvenMonth: monthsToBreakEven,
        targetROI: 300, // Target 3x return
      },
      kpis,
      risks,
      summary,
      actionPlan,
    }
  }

  private getMilestones(stage: StartupStage): string[] {
    const milestones = {
      'pre-seed': [
        'MVP launch + first 10 customers',
        'Product validation + user feedback',
        '$5K MRR milestone',
        'Expand core team by 2',
        'Reach 50 active users',
        'Prepare seed deck',
      ],
      seed: [
        'Product-market fit validation',
        'Scale to $25K MRR',
        'Hire 3-5 key team members',
        'Launch 2 major features',
        'Hit 500 customers',
        'Prepare Series A materials',
      ],
      'series-a': [
        'Scale to $100K MRR',
        'Expand to 3 new markets',
        'Build out sales team',
        'Launch enterprise features',
        'Reach $1M ARR',
        'Achieve profitability path',
      ],
      'series-b': [
        'Scale to $500K MRR',
        'International expansion',
        'Build brand presence',
        'Launch new product lines',
        'Reach $5M ARR',
        'Prepare for IPO/exit',
      ],
    }

    return milestones[stage]
  }
}
