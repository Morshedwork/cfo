/**
 * Financial Statement Generator
 * Auto-generates P&L and Cash Flow statements from transaction data
 */

export interface Transaction {
  date: string
  description: string
  amount: number
  category: string
  type: 'Income' | 'Expense'
  vendor?: string
  paymentMethod?: string
}

export interface ProfitLossStatement {
  period: {
    start: string
    end: string
  }
  revenue: {
    items: Array<{ category: string; amount: number }>
    total: number
  }
  costOfRevenue: {
    items: Array<{ category: string; amount: number }>
    total: number
  }
  grossProfit: number
  grossMargin: number
  operatingExpenses: {
    items: Array<{ category: string; amount: number }>
    total: number
  }
  netIncome: number
  netMargin: number
}

export interface CashFlowStatement {
  period: {
    start: string
    end: string
  }
  operating: {
    items: Array<{ name: string; amount: number }>
    total: number
  }
  investing: {
    items: Array<{ name: string; amount: number }>
    total: number
  }
  financing: {
    items: Array<{ name: string; amount: number }>
    total: number
  }
  netChange: number
}

export interface AIInsights {
  summary: string
  strengths: string[]
  concerns: string[]
  recommendations: string[]
  keyMetrics: {
    burnRate: number
    runway: number
    grossMargin: number
    topExpenseCategory: string
  }
}

/**
 * Parse CSV content into transactions
 */
export function parseCSV(csvContent: string): Transaction[] {
  const lines = csvContent.trim().split('\n')
  if (lines.length < 2) return []
  
  // Parse headers
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/\s+/g, ''))
  
  const transactions: Transaction[] = []
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue
    
    // Simple CSV parsing (handles basic cases)
    const values = line.split(',').map(v => v.trim())
    
    if (values.length < 5) continue // Need at least date, desc, amount, category, type
    
    const row: any = {}
    headers.forEach((header, index) => {
      row[header] = values[index] || ''
    })
    
    // Parse amount - remove any currency symbols and parse as number
    const amountStr = (row.amount || row.price || '0').toString().replace(/[$,]/g, '')
    const amount = parseFloat(amountStr) || 0
    
    // Determine transaction type
    let type: 'Income' | 'Expense' = row.type || 'Expense'
    if (type !== 'Income' && type !== 'Expense') {
      type = amount >= 0 ? 'Income' : 'Expense'
    }
    
    transactions.push({
      date: row.date || '',
      description: row.description || row.desc || '',
      amount: Math.abs(amount), // Store as positive
      category: row.category || 'Uncategorized',
      type: type,
      vendor: row.vendor || '',
      paymentMethod: row.paymentmethod || row['paymentmethod'] || ''
    })
  }
  
  console.log('[Statement Generator] Parsed transactions:', transactions.length)
  return transactions
}

/**
 * Generate Profit & Loss Statement
 */
export function generateProfitLoss(transactions: Transaction[]): ProfitLossStatement {
  // Get date range
  const dates = transactions.map(t => new Date(t.date)).sort((a, b) => a.getTime() - b.getTime())
  const startDate = dates[0]?.toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) || 'N/A'
  const endDate = dates[dates.length - 1]?.toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) || 'N/A'
  
  // Categorize transactions
  const revenue = transactions
    .filter(t => t.type === 'Income')
    .reduce((acc, t) => {
      const existing = acc.find(item => item.category === t.category)
      if (existing) {
        existing.amount += t.amount
      } else {
        acc.push({ category: t.category, amount: t.amount })
      }
      return acc
    }, [] as Array<{ category: string; amount: number }>)
  
  const totalRevenue = revenue.reduce((sum, item) => sum + item.amount, 0)
  
  // COGS categories (typically Infrastructure and Payment Processing for SaaS)
  const cogsCategories = ['Infrastructure', 'Payment Processing', 'Cost of Revenue']
  const costOfRevenue = transactions
    .filter(t => t.type === 'Expense' && cogsCategories.includes(t.category))
    .reduce((acc, t) => {
      const existing = acc.find(item => item.category === t.category)
      if (existing) {
        existing.amount += Math.abs(t.amount)
      } else {
        acc.push({ category: t.category, amount: Math.abs(t.amount) })
      }
      return acc
    }, [] as Array<{ category: string; amount: number }>)
  
  const totalCOGS = costOfRevenue.reduce((sum, item) => sum + item.amount, 0)
  const grossProfit = totalRevenue - totalCOGS
  const grossMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0
  
  // Operating expenses (everything else)
  const operatingExpenses = transactions
    .filter(t => t.type === 'Expense' && !cogsCategories.includes(t.category))
    .reduce((acc, t) => {
      const existing = acc.find(item => item.category === t.category)
      if (existing) {
        existing.amount += Math.abs(t.amount)
      } else {
        acc.push({ category: t.category, amount: Math.abs(t.amount) })
      }
      return acc
    }, [] as Array<{ category: string; amount: number }>)
  
  const totalOpEx = operatingExpenses.reduce((sum, item) => sum + item.amount, 0)
  const netIncome = grossProfit - totalOpEx
  const netMargin = totalRevenue > 0 ? (netIncome / totalRevenue) * 100 : 0
  
  return {
    period: { start: startDate, end: endDate },
    revenue: { items: revenue, total: totalRevenue },
    costOfRevenue: { items: costOfRevenue, total: totalCOGS },
    grossProfit,
    grossMargin,
    operatingExpenses: { items: operatingExpenses.sort((a, b) => b.amount - a.amount), total: totalOpEx },
    netIncome,
    netMargin
  }
}

/**
 * Generate Cash Flow Statement (simplified)
 */
export function generateCashFlow(transactions: Transaction[], pl: ProfitLossStatement): CashFlowStatement {
  const operatingItems = [
    { name: 'Net Income', amount: pl.netIncome },
    // Simplified - in real world, would adjust for AR/AP changes
  ]
  
  const investingItems = transactions
    .filter(t => t.type === 'Expense' && ['Equipment', 'Software Licenses', 'Capital'].some(k => t.category.includes(k)))
    .map(t => ({ name: t.description, amount: t.amount }))
  
  const financingItems: Array<{ name: string; amount: number }> = []
  // Would include funding rounds, loans, etc.
  
  return {
    period: pl.period,
    operating: {
      items: operatingItems,
      total: operatingItems.reduce((sum, item) => sum + item.amount, 0)
    },
    investing: {
      items: investingItems,
      total: investingItems.reduce((sum, item) => sum + item.amount, 0)
    },
    financing: {
      items: financingItems,
      total: 0
    },
    netChange: operatingItems.reduce((sum, item) => sum + item.amount, 0) + 
               investingItems.reduce((sum, item) => sum + item.amount, 0)
  }
}

/**
 * Generate AI Insights from P&L
 */
export function generateAIInsights(pl: ProfitLossStatement, transactions: Transaction[]): AIInsights {
  const strengths: string[] = []
  const concerns: string[] = []
  const recommendations: string[] = []
  
  // Analyze Gross Margin
  if (pl.grossMargin >= 70) {
    strengths.push(`Excellent ${pl.grossMargin.toFixed(0)}% gross margin (typical SaaS target is 70%+)`)
  } else if (pl.grossMargin < 50) {
    concerns.push(`Low ${pl.grossMargin.toFixed(0)}% gross margin - review COGS structure`)
  }
  
  // Analyze Profitability
  if (pl.netIncome < 0) {
    const monthlyBurn = Math.abs(pl.netIncome) / 3 // Assuming 3-month period
    concerns.push(`Burning $${monthlyBurn.toLocaleString()} per month with $${Math.abs(pl.netIncome).toLocaleString()} net loss`)
    recommendations.push('Focus on reaching profitability or secure additional funding')
  } else {
    strengths.push(`Profitable with $${pl.netIncome.toLocaleString()} net income`)
  }
  
  // Analyze expense structure
  const topExpense = pl.operatingExpenses.items[0]
  if (topExpense) {
    const expensePct = (topExpense.amount / pl.revenue.total) * 100
    if (topExpense.category.includes('Payroll') && expensePct > 60) {
      concerns.push(`${topExpense.category} is ${expensePct.toFixed(0)}% of revenue (high for early-stage)`)
      recommendations.push('Consider slowing hiring or improving revenue per employee')
    }
  }
  
  // Analyze revenue concentration
  if (pl.revenue.items.length === 1) {
    recommendations.push('Diversify revenue streams to reduce risk')
  }
  
  // Calculate metrics
  const monthlyBurnRate = Math.abs(pl.netIncome) / 3 // 3 months of data
  const assumedCash = 500000 // Would come from actual cash balance
  const runway = pl.netIncome < 0 ? assumedCash / monthlyBurnRate : Infinity
  
  // Generate summary
  let summary = `Revenue: $${pl.revenue.total.toLocaleString()} | `
  summary += `Net ${pl.netIncome >= 0 ? 'Income' : 'Loss'}: $${Math.abs(pl.netIncome).toLocaleString()} | `
  summary += `Gross Margin: ${pl.grossMargin.toFixed(0)}%`
  
  if (pl.netIncome < 0) {
    summary += ` | Runway: ~${runway.toFixed(0)} months`
  }
  
  return {
    summary,
    strengths,
    concerns,
    recommendations,
    keyMetrics: {
      burnRate: monthlyBurnRate,
      runway: runway,
      grossMargin: pl.grossMargin,
      topExpenseCategory: topExpense?.category || 'N/A'
    }
  }
}

/**
 * Main function: Generate all statements from CSV
 */
export function generateFinancialStatements(csvContent: string) {
  const transactions = parseCSV(csvContent)
  const profitLoss = generateProfitLoss(transactions)
  const cashFlow = generateCashFlow(transactions, profitLoss)
  const insights = generateAIInsights(profitLoss, transactions)
  
  return {
    transactions,
    profitLoss,
    cashFlow,
    insights,
    summary: {
      totalTransactions: transactions.length,
      dateRange: `${profitLoss.period.start} - ${profitLoss.period.end}`,
      categories: Array.from(new Set(transactions.map(t => t.category))),
      vendors: Array.from(new Set(transactions.map(t => t.vendor).filter(Boolean)))
    }
  }
}
