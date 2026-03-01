import { NextRequest, NextResponse } from "next/server"
import { getVoiceAIClient, isVoiceFallbackMode } from "@/lib/gemini-client"
import { createClient } from "@/lib/supabase/server"
import { getAgentActions, type AgentAction } from "@/lib/aura-agent"
import { runMarketIntelAgent } from "@/lib/market-intelligence-agents"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const { query, userId, recentMessages, competitors: bodyCompetitors } = body
    const competitors = Array.isArray(bodyCompetitors) ? bodyCompetitors : []

    if (!query) {
      return NextResponse.json(
        { error: "Query is required" },
        { status: 400 }
      )
    }

    const messages = Array.isArray(recentMessages) ? recentMessages.slice(-16) : []
    const emotionHint = getEmotionHint(query)
    if (emotionHint) {
      console.log("[Voice API] Emotion hint:", emotionHint)
    }
    console.log("[Voice API] Processing query (conversational, full context):", query.slice(0, 60), "… | context turns:", messages.length)

    // Get user's financial data context (server Supabase)
    const financialData = await getFinancialContext(userId)

    // Voice AI: uses OpenAI for execution when OPENAI_API_KEY is set
    const voiceAI = getVoiceAIClient()
    const response = await voiceAI.analyzeFinancialData(financialData, query, {
      recentMessages: messages,
      advanced: true,
      emotionHint: emotionHint || undefined,
    })

    // Clean response text - remove ACTIONS/ACTION line and markdown
    let cleanedText = (response.text || '')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/^#+\s+/gm, '')
      .replace(/\n*ACTIONS?:\s*.*$/im, '')
      .trim()

    // Agentic: detect and attach executable actions (rules + LLM output, with context resolution)
    let actions: AgentAction[] = getAgentActions(query, response.text || '', messages)

    // Run market intelligence agent by voice when user asks (run_market_intel)
    const marketIntelAction = actions.find((a): a is AgentAction & { type: "run_market_intel"; task: string } => a.type === "run_market_intel")
    if (marketIntelAction && marketIntelAction.type === "run_market_intel") {
      try {
        const task = marketIntelAction.task
        const context = {
          companyName: financialData.companyName,
          industry: financialData.industry,
          competitors,
          monthlyRevenue: typeof financialData.monthlyRevenue === "number" ? financialData.monthlyRevenue : undefined,
          monthlyBurn: typeof financialData.monthlyBurn === "number" ? financialData.monthlyBurn : undefined,
          cashBalance: typeof financialData.cashBalance === "number" ? financialData.cashBalance : undefined,
          runwayMonths: financialData.runway != null ? parseFloat(String(financialData.runway)) : undefined,
          growthRate: financialData.revenueGrowth != null ? parseFloat(String(financialData.revenueGrowth)) : undefined,
        }
        const result = await runMarketIntelAgent(task, context, { competitors })
        const rec = result.recommendations[0]
        cleanedText = result.summary + (rec ? ` Recommendation: ${rec}` : "") + " Opening Market Intelligence."
        actions = actions.filter((a) => a.type !== "run_market_intel")
        if (!actions.some((a) => a.type === "navigate")) {
          actions = [{ type: "navigate", path: "/dashboard/market-intelligence" }, ...actions]
        }
      } catch (e) {
        console.error("[Voice API] Market intel agent error:", e)
        cleanedText = "I couldn't run that market intelligence report right now. Try opening Market Intelligence from the dashboard."
        actions = actions.filter((a) => a.type !== "run_market_intel")
      }
    }

    // Execute create_transaction (and add_expense/add_revenue with amount) server-side when possible
    const createResult = await executeCreateTransactionIfRequested(userId, actions)
    if (createResult.executed) {
      cleanedText = createResult.responseOverride ?? cleanedText
      // Remove the create/add action from client-side actions so we don't double-navigate
      actions = actions.filter(
        (a) =>
          a.type !== "create_transaction" &&
          !(a.type === "add_expense" && (a as any).amount != null) &&
          !(a.type === "add_revenue" && (a as any).amount != null)
      )
    }

    // If we're executing a navigation/app action, prepend a short confirmation (skip if we already spoke market intel result)
    const first = actions[0]
    const hasNavigate = first && (first.type === "navigate" || String(first.type).startsWith("open_"))
    const didMarketIntel = cleanedText.includes("Recommendation:")
    if (hasNavigate && first && !didMarketIntel) {
      const path = first.type === "navigate" ? (first as any).path : first.type === "open_scenarios" ? "/dashboard/scenarios" : first.type === "open_market_intelligence" ? "/dashboard/market-intelligence" : `/${String(first.type).replace("open_", "").replace("_", "-")}`
      const pageName = path.split('/').filter(Boolean).pop() || 'page'
      const friendly = pageName.replace(/-/g, ' ')
      cleanedText = `Opening ${friendly} for you. ${cleanedText}`.trim()
    }

    // run_report: optionally add navigate action for runway/dashboard
    const reportAction = actions.find((a) => a.type === "run_report")
    if (reportAction && reportAction.type === "run_report" && reportAction.report) {
      const reportPath = reportAction.report === "runway" ? "/runway" : "/dashboard"
      if (!actions.some((a) => a.type === "navigate")) {
        actions = [{ type: "navigate", path: reportPath }, ...actions]
      }
    }

    return NextResponse.json({
      success: true,
      response: cleanedText,
      insights: response.insights,
      recommendations: response.recommendations,
      data: financialData,
      actions,
      demoMode: isVoiceFallbackMode(),
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
 * If the user asked to add an expense/revenue (or create_transaction), create it in Supabase and return a confirmation.
 */
async function executeCreateTransactionIfRequested(
  userId: string | undefined,
  actions: AgentAction[]
): Promise<{ executed: boolean; responseOverride?: string }> {
  const createAction = actions.find(
    (a) =>
      a.type === "create_transaction" ||
      (a.type === "add_expense" && (a as any).amount != null) ||
      (a.type === "add_revenue" && (a as any).amount != null)
  ) as
    | { type: "create_transaction"; kind: "expense" | "revenue"; amount: number; description?: string; category?: string }
    | { type: "add_expense"; amount?: number; description?: string; category?: string }
    | { type: "add_revenue"; amount?: number; description?: string; category?: string }
    | undefined

  if (!createAction || !userId) return { executed: false }

  let amount: number
  let type: "expense" | "revenue"
  let description: string
  let category: string

  if (createAction.type === "create_transaction") {
    amount = createAction.amount
    type = createAction.kind
    description = createAction.description ?? (type === "expense" ? "Expense" : "Revenue")
    category = createAction.category ?? "Other"
  } else {
    amount = (createAction as any).amount!
    type = createAction.type === "add_expense" ? "expense" : "revenue"
    description = (createAction as any).description ?? (type === "expense" ? "Expense" : "Revenue")
    category = (createAction as any).category ?? "Other"
  }

  const absAmount = Math.abs(amount)
  const amountForDb = type === "expense" ? -absAmount : absAmount
  const today = new Date().toISOString().split("T")[0]

  try {
    const supabase = await createClient()
    const { data: company, error: companyError } = await supabase
      .from("companies")
      .select("id")
      .eq("user_id", userId)
      .limit(1)
      .maybeSingle()

    if (companyError || !company?.id) {
      console.warn("[Voice API] No company for user, skipping create transaction")
      return { executed: false }
    }

    const { error: insertError } = await supabase.from("transactions").insert({
      company_id: company.id,
      date: today,
      description: description.slice(0, 500),
      amount: amountForDb,
      category: category.slice(0, 100),
      type,
      payment_method: "Voice",
      vendor: "Aura Strategic Financial Growth Manager",
      ai_confidence: 0.95,
      needs_review: false,
    })

    if (insertError) {
      console.error("[Voice API] Create transaction error:", insertError)
      return {
        executed: true,
        responseOverride: `I couldn't save that transaction right now. Try adding it from Bookkeeping.`,
      }
    }

    const friendly = type === "expense" ? "expense" : "revenue"
    const responseOverride = `Done. I've logged a ${friendly} of $${absAmount.toLocaleString()}${category && category !== "Other" ? ` under ${category}` : ""}.`
    return { executed: true, responseOverride }
  } catch (e) {
    console.error("[Voice API] executeCreateTransaction error:", e)
    return { executed: false }
  }
}

/**
 * Detect likely emotion from query text so the model can acknowledge and match tone.
 * Used for real-time, emotion-aware conversation.
 */
function getEmotionHint(query: string): string | null {
  if (!query || typeof query !== "string") return null
  const q = query.trim().toLowerCase()
  if (q.length < 3) return null
  const hints: { patterns: RegExp[]; hint: string }[] = [
    { patterns: [/\b(worried|worry|anxious|anxiety|scared|nervous|stressed|stress|overwhelmed|panic|terrified)\b/i], hint: "worry or stress" },
    { patterns: [/\b(frustrated|frustrating|annoyed|angry|mad|upset|irritated|sick of)\b/i], hint: "frustration" },
    { patterns: [/\b(excited|exciting|great|awesome|amazing|thrilled|pumped|happy|relieved|relief)\b/i], hint: "excitement or relief" },
    { patterns: [/\b(confused|don't get|don\'t understand|no idea|unclear|what does that mean)\b/i], hint: "confusion" },
    { patterns: [/\b(urgent|asap|emergency|quick|immediately|right now|critical)\b/i], hint: "urgency" },
    { patterns: [/\b(hopeful|hope|optimistic|looking forward|can't wait)\b/i], hint: "hope or optimism" },
    { patterns: [/\b(disappointed|disappointing|sad|down|discouraged)\b/i], hint: "disappointment" },
    { patterns: [/\b(just tell me|bottom line|cut to the chase|yes or no)\b/i], hint: "impatience or desire for a direct answer" },
    { patterns: [/\b(thanks|thank you|perfect|sounds good|got it|okay|ok)\b/i], hint: "satisfaction or acknowledgment" },
    { patterns: [/\b(why|how come|explain|break down|walk me through)\b/i], hint: "desire for deeper explanation" },
    { patterns: [/\b(what about|what if|suppose|assuming)\b/i], hint: "exploring scenarios or alternatives" },
  ]
  for (const { patterns, hint } of hints) {
    if (patterns.some((p) => p.test(q))) return hint
  }
  return null
}

/**
 * Get comprehensive financial context for the AI assistant (voice-native financial OS)
 */
async function getFinancialContext(userId?: string) {
  try {
    if (userId) {
      const supabase = await createClient()
      const { data: company, error: companyError } = await supabase
        .from("companies")
        .select("*")
        .eq("user_id", userId)
        .limit(1)
        .maybeSingle()

      if (companyError) {
        console.warn("[Voice API] Company fetch error:", companyError)
        return getDemoFinancialData()
      }

      let transactions: any[] = []
      if (company?.id) {
        const { data: txData } = await supabase
          .from("transactions")
          .select("*")
          .eq("company_id", company.id)
          .order("date", { ascending: false })
          .limit(100)
        transactions = txData ?? []
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .limit(1)
        .maybeSingle()

      console.log("[Voice API] Fetched data:", {
        hasCompany: !!company,
        transactionCount: transactions.length,
        hasProfile: !!profile,
      })

      if (company || transactions.length > 0) {
        return calculateFinancialMetrics(company, transactions, profile)
      }
    }

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
