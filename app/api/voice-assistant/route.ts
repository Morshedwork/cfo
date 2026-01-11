import { NextRequest, NextResponse } from "next/server"
import { getGeminiClient } from "@/lib/gemini-client"
import { createBrowserClient } from "@supabase/ssr"

export async function POST(request: NextRequest) {
  try {
    const { query, userId } = await request.json()

    if (!query) {
      return NextResponse.json(
        { error: "Query is required" },
        { status: 400 }
      )
    }

    console.log("[Voice API] Processing query:", query)

    // Get user's financial data context
    const financialData = await getFinancialContext(userId)

    // Use Gemini to analyze and respond
    const gemini = getGeminiClient()
    const response = await gemini.analyzeFinancialData(financialData, query)

    // Clean response text - remove any asterisks or markdown
    const cleanedText = (response.text || '')
      .replace(/\*\*([^*]+)\*\*/g, '$1')  // Remove bold
      .replace(/\*([^*]+)\*/g, '$1')       // Remove italic
      .replace(/^#+\s+/gm, '')              // Remove headers
      .trim()

    return NextResponse.json({
      success: true,
      response: cleanedText,
      insights: response.insights,
      recommendations: response.recommendations,
      data: financialData,
    })
  } catch (error) {
    console.error("[Voice API] Error:", error)
    return NextResponse.json(
      { 
        error: "Failed to process voice query",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

/**
 * Get comprehensive financial context for the AI assistant
 */
async function getFinancialContext(userId?: string) {
  try {
    // If userId provided, try to get real data from Supabase
    if (userId) {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      // Get all data in parallel
      const [companyResult, transactionsResult, profileResult] = await Promise.all([
        supabase
          .from('companies')
          .select('*')
          .eq('user_id', userId)
          .limit(1)
          .maybeSingle(),
        supabase
          .from('transactions')
          .select('*')
          .eq('user_id', userId)
          .order('date', { ascending: false })
          .limit(100),
        supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .limit(1)
          .maybeSingle()
      ])

      const company = companyResult.data
      const transactions = transactionsResult.data || []
      const profile = profileResult.data

      console.log("[Voice API] Fetched data:", {
        hasCompany: !!company,
        transactionCount: transactions.length,
        hasProfile: !!profile
      })

      if (company || transactions.length > 0) {
        return calculateFinancialMetrics(company, transactions, profile)
      }
    }

    // Return demo data if no user data available
    console.log("[Voice API] No real data found, using demo data")
    return getDemoFinancialData()
  } catch (error) {
    console.error("[Voice API] Error fetching financial data:", error)
    return getDemoFinancialData()
  }
}

/**
 * Calculate comprehensive financial metrics from real data
 */
function calculateFinancialMetrics(company: any, transactions: any[], profile: any) {
  const currentDate = new Date()
  const thirtyDaysAgo = new Date(currentDate.getTime() - 30 * 24 * 60 * 60 * 1000)
  const sixtyDaysAgo = new Date(currentDate.getTime() - 60 * 24 * 60 * 60 * 1000)
  const ninetyDaysAgo = new Date(currentDate.getTime() - 90 * 24 * 60 * 60 * 1000)

  // Filter transactions by time periods
  const last30Days = transactions.filter(t => new Date(t.date) >= thirtyDaysAgo)
  const last60Days = transactions.filter(t => new Date(t.date) >= sixtyDaysAgo)
  const prev30Days = transactions.filter(t => 
    new Date(t.date) >= sixtyDaysAgo && new Date(t.date) < thirtyDaysAgo
  )

  // Calculate expenses
  const currentExpenses = last30Days
    .filter(t => t.type === 'expense' || t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0)

  const previousExpenses = prev30Days
    .filter(t => t.type === 'expense' || t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0)

  // Calculate revenue
  const currentRevenue = last30Days
    .filter(t => t.type === 'revenue' || t.amount > 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0)

  const previousRevenue = prev30Days
    .filter(t => t.type === 'revenue' || t.amount > 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0)

  // Calculate metrics
  const monthlyBurn = currentExpenses
  const monthlyRevenue = currentRevenue
  const netBurn = monthlyBurn - monthlyRevenue
  const cashBalance = company?.current_cash || company?.cash_balance || 100000
  const runway = netBurn > 0 ? (cashBalance / netBurn) : 999
  
  // Calculate growth rates
  const revenueGrowth = previousRevenue > 0 
    ? ((currentRevenue - previousRevenue) / previousRevenue * 100)
    : 0

  const burnGrowth = previousExpenses > 0
    ? ((currentExpenses - previousExpenses) / previousExpenses * 100)
    : 0

  // Expense breakdown by category
  const expensesByCategory: { [key: string]: number } = {}
  last30Days
    .filter(t => t.type === 'expense' || t.amount < 0)
    .forEach(t => {
      const category = t.category || 'Other'
      expensesByCategory[category] = (expensesByCategory[category] || 0) + Math.abs(t.amount)
    })

  // Top expenses
  const topExpenses = Object.entries(expensesByCategory)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([category, amount]) => ({
      category,
      amount: Math.round(amount),
      percentage: Math.round((amount / monthlyBurn) * 100)
    }))

  return {
    // Core metrics
    cashBalance: Math.round(cashBalance),
    monthlyBurn: Math.round(monthlyBurn),
    monthlyRevenue: Math.round(monthlyRevenue),
    netBurn: Math.round(netBurn),
    runway: runway < 999 ? runway.toFixed(1) : '∞',
    mrr: Math.round(monthlyRevenue),
    
    // Growth metrics
    revenueGrowth: revenueGrowth.toFixed(1),
    burnGrowth: burnGrowth.toFixed(1),
    
    // Company info
    companyName: company?.name || company?.company_name || profile?.full_name || 'Your Company',
    industry: company?.industry || 'Technology',
    teamSize: company?.team_size || company?.employees || 10,
    fundingStage: company?.funding_stage || 'seed',
    foundedDate: company?.founded_date || company?.created_at,
    
    // Expense breakdown
    topExpenses,
    expensesByCategory,
    
    // Transaction insights
    totalTransactions: transactions.length,
    recentTransactionCount: last30Days.length,
    recentTransactions: last30Days.slice(0, 10).map(t => ({
      description: t.description,
      amount: t.amount,
      category: t.category,
      date: t.date,
      type: t.type
    })),
    
    // Status flags
    isUsingRealData: true,
    hasCompanyData: !!company,
    hasTransactionData: transactions.length > 0,
  }
}

/**
 * Static financial data from Dashboard & Runway pages
 * This matches the data shown in your dashboard
 */
function getDemoFinancialData() {
  return {
    // From Runway page - current state
    cashBalance: 70000,
    monthlyBurn: 82000,
    monthlyRevenue: 35000,
    netBurn: 47000, // burn - revenue
    runway: 0.9, // ~1 month (70000 / (82000-35000))
    mrr: 35000,
    revenueGrowth: 16.7, // (35000 - 28000) / 28000 * 100
    burnGrowth: 2.5, // (82000 - 80000) / 80000 * 100
    
    // Company info
    companyName: 'Your Startup',
    industry: 'SaaS',
    teamSize: 8,
    fundingStage: 'Seed',
    foundedDate: '2023-06-01',
    
    // From Dashboard - expense breakdown
    topExpenses: [
      { category: 'Payroll', amount: 45000, percentage: 55 },
      { category: 'Marketing', amount: 18000, percentage: 22 },
      { category: 'Infrastructure', amount: 8000, percentage: 10 },
      { category: 'Software & Tools', amount: 6000, percentage: 7 },
      { category: 'Office & Operations', amount: 5000, percentage: 6 },
    ],
    expensesByCategory: {
      'Payroll': 45000,
      'Marketing': 18000,
      'Infrastructure': 8000,
      'Software & Tools': 6000,
      'Office & Operations': 5000,
    },
    
    // Recent history from dashboard
    totalTransactions: 68,
    recentTransactionCount: 24,
    recentTransactions: [
      { description: 'SaaS Subscriptions - June', amount: 35000, category: 'Revenue', date: '2024-06-30', type: 'revenue' },
      { description: 'Team Payroll', amount: -45000, category: 'Payroll', date: '2024-06-25', type: 'expense' },
      { description: 'Google Ads Campaign', amount: -12000, category: 'Marketing', date: '2024-06-20', type: 'expense' },
      { description: 'AWS & Infrastructure', amount: -8000, category: 'Infrastructure', date: '2024-06-15', type: 'expense' },
      { description: 'Software Tools (GitHub, Figma, etc)', amount: -6000, category: 'Software & Tools', date: '2024-06-10', type: 'expense' },
      { description: 'Office Rent & Utilities', amount: -5000, category: 'Office & Operations', date: '2024-06-05', type: 'expense' },
      { description: 'Social Media Ads', amount: -6000, category: 'Marketing', date: '2024-06-03', type: 'expense' },
      { description: 'SaaS Subscriptions - May', amount: 28000, category: 'Revenue', date: '2024-05-30', type: 'revenue' },
    ],
    
    // Cash flow trend (last 6 months from dashboard)
    cashFlowHistory: [
      { month: 'Jan', cash: 450000, burn: 75000, revenue: 12000 },
      { month: 'Feb', cash: 375000, burn: 78000, revenue: 15000 },
      { month: 'Mar', cash: 297000, burn: 72000, revenue: 18000 },
      { month: 'Apr', cash: 225000, burn: 75000, revenue: 22000 },
      { month: 'May', cash: 150000, burn: 80000, revenue: 28000 },
      { month: 'Jun', cash: 70000, burn: 82000, revenue: 35000 },
    ],
    
    // Status flags
    isUsingRealData: false,
    hasCompanyData: true, // Using dashboard data
    hasTransactionData: true, // Using dashboard data
    dataSource: 'Dashboard Static Data',
  }
}
