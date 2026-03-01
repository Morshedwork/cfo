/**
 * Aura Agent - Agentic layer for Voice-Native Financial OS
 * Parses user intent and returns executable actions (navigate, create transaction, reports, etc.)
 */

export type MarketIntelTask =
  | "overview"
  | "competitors"
  | "ad_spend"
  | "seo"
  | "benchmarks"
  | "opportunities"

export type AgentAction =
  | { type: "navigate"; path: string }
  | { type: "open_bookkeeping" }
  | { type: "open_runway" }
  | { type: "open_dashboard" }
  | { type: "open_sales" }
  | { type: "open_data" }
  | { type: "open_ai_assistant" }
  | { type: "open_settings" }
  | { type: "open_scenarios" }
  | { type: "open_market_intelligence" }
  | { type: "open_voice_assistant" }
  | { type: "add_expense"; description?: string; amount?: number; category?: string }
  | { type: "add_revenue"; description?: string; amount?: number; category?: string }
  | { type: "create_transaction"; kind: "expense" | "revenue"; amount: number; description?: string; category?: string }
  | { type: "run_report"; report?: "runway" | "burn" | "revenue" | "week" }
  | { type: "summarize"; period?: "week" | "month" }
  | { type: "run_market_intel"; task: MarketIntelTask }
  | { type: "export_data" }
  | { type: "compare_periods"; period?: "month" | "quarter" }
  | { type: "show_top_expenses" }
  | { type: "show_cash_flow" }

export interface AgentResult {
  response: string
  insights?: string[]
  recommendations?: string[]
  actions: AgentAction[]
}

const ALLOWED_PATHS = [
  "/dashboard", "/runway", "/bookkeeping", "/sales", "/data-management",
  "/ai-assistant", "/settings", "/scenarios", "/voice-assistant",
  "/dashboard/scenarios", "/dashboard/market-intelligence",
] as const
const VOICE_ASSISTANT_PATH = "/voice-assistant"

const NAV_TRIGGERS: { patterns: RegExp[]; path: string }[] = [
  { patterns: [/\b(go to|open|show|take me to|navigate to)\s*(the\s*)?dashboard\b/i, /\bdashboard\s*(page)?\s*$/i], path: "/dashboard" },
  { patterns: [/\b(go to|open|show|take me to)\s*(the\s*)?runway\b/i, /\brunway\s*(page)?\s*$/i, /\b(show|see)\s*(my\s*)?runway\b/i], path: "/runway" },
  { patterns: [/\b(go to|open|show|take me to)\s*(the\s*)?bookkeeping\b/i, /\bbookkeeping\s*$/i, /\b(show|add)\s*transactions\b/i], path: "/bookkeeping" },
  { patterns: [/\b(go to|open|show|take me to)\s*(the\s*)?sales\b/i, /\bsales\s*(page)?\s*$/i], path: "/sales" },
  { patterns: [/\b(go to|open|show|take me to)\s*(the\s*)?data\b/i, /\bdata\s*(management)?\s*$/i, /\bupload\s*(my\s*)?data\b/i], path: "/data-management" },
  { patterns: [/\b(go to|open|show)\s*(the\s*)?(ai\s*)?assistant\b/i, /\b(ai\s*)?assistant\s*$/i, /\bchat\s*(with\s*)?(ai)?\s*$/i], path: "/ai-assistant" },
  { patterns: [/\b(go to|open|show)\s*(the\s*)?settings\b/i, /\bsettings\s*$/i, /\b(account|preferences)\s*$/i], path: "/settings" },
  { patterns: [/\b(go to|open|show|run|model)\s*(the\s*)?scenarios\b/i, /\bscenarios\s*$/i, /\bwhat\s*if\b/i, /\bmodel\s+(a\s+)?(scenario|hiring)\b/i, /\bgrowth\s*scenarios\b/i], path: "/dashboard/scenarios" },
  { patterns: [/\b(go to|open|show)\s*(the\s*)?market\s*intelligence\b/i, /\bmarket\s*intelligence\s*$/i, /\bcompetitors?\b.*(research|see|show)/i, /\bbenchmarks?\b/i], path: "/dashboard/market-intelligence" },
  { patterns: [/\b(go to|open|show)\s*(the\s*)?voice\s*(assistant|ai)?\b/i, /\bvoice\s*(assistant|ai)?\s*$/i, /\btake\s+me\s+to\s+voice\b/i], path: VOICE_ASSISTANT_PATH },
]

function detectNavigateAction(query: string): AgentAction | null {
  const trimmed = query.trim().toLowerCase()
  for (const { patterns, path } of NAV_TRIGGERS) {
    if (patterns.some((p) => p.test(query))) return { type: "navigate", path }
  }
  // Short commands
  if (/^(dashboard|runway|bookkeeping|sales|data|ai|settings|scenarios?|market|benchmarks?|voice)$/i.test(trimmed)) {
    const map: Record<string, string> = {
      dashboard: "/dashboard",
      runway: "/runway",
      bookkeeping: "/bookkeeping",
      sales: "/sales",
      data: "/data-management",
      ai: "/ai-assistant",
      settings: "/settings",
      scenarios: "/dashboard/scenarios",
      scenario: "/dashboard/scenarios",
      market: "/dashboard/market-intelligence",
      benchmarks: "/dashboard/market-intelligence",
      voice: VOICE_ASSISTANT_PATH,
    }
    const path = map[trimmed] ?? map["dashboard"]
    return { type: "navigate", path }
  }
  return null
}

const CATEGORY_HINTS = [
  "marketing", "payroll", "office", "software", "infrastructure", "travel",
  "rent", "utilities", "ads", "advertising", "tools", "contractors", "legal",
  "insurance", "revenue", "sales", "subscription",
]

function extractCategoryFromQuery(query: string): string | undefined {
  const lower = query.toLowerCase()
  for (const cat of CATEGORY_HINTS) {
    if (new RegExp(`\\b(for\\s+)?${cat}\\b`, "i").test(lower)) return cat
    if (new RegExp(`\\b${cat}\\s+(expense|spend|cost)`, "i").test(lower)) return cat
  }
  const forMatch = query.match(/\bfor\s+(\w+(?:\s+\w+)?)/i)
  if (forMatch) return forMatch[1].trim().replace(/\s+/g, " ")
  return undefined
}

function detectAddTransactionAction(query: string): AgentAction | null {
  const lower = query.toLowerCase()
  const amountMatch = query.match(/\$?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:dollars?)?/)
  const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, "")) : undefined
  const category = extractCategoryFromQuery(query)

  const isExpense =
    /\b(add|record|log|enter)\s+(an?\s*)?(expense|spending|cost)\b/i.test(query) ||
    /\b(spent|paid)\s+\$?\d+/i.test(query) ||
    (/\b(add|record)\s+.+\s+(for|of)\s+\$/i.test(query) && !/revenue|income|earned|received/i.test(query))
  const isRevenue =
    /\b(add|record|log|enter)\s+(an?\s*)?(revenue|income|sale)\b/i.test(query) ||
    /\b(received|earned)\s+\$?\d+/i.test(query)

  if (isExpense)
    return {
      type: "add_expense",
      amount,
      description: undefined,
      category: category || undefined,
    }
  if (isRevenue)
    return {
      type: "add_revenue",
      amount,
      description: undefined,
      category: category || undefined,
    }
  return null
}

function detectReportOrSummarizeAction(query: string): AgentAction | null {
  const lower = query.trim().toLowerCase()
  if (/\b(run|show|give me)\s+(a\s+)?(report|summary)\b/i.test(query) || /\breport\s*(on|for)\b/i.test(query)) {
    if (/\brunway\b/i.test(query)) return { type: "run_report", report: "runway" }
    if (/\bburn\b/i.test(query)) return { type: "run_report", report: "burn" }
    if (/\brevenue\b/i.test(query)) return { type: "run_report", report: "revenue" }
    if (/\bweek(ly)?\b/i.test(query)) return { type: "run_report", report: "week" }
    return { type: "run_report" }
  }
  if (/\bsummarize\b|\bsummary\s+(of\s+)?(my\s+)?(week|month)\b/i.test(query) || /\bhow\s+did\s+(my\s+)?(week|month)\b/i.test(query)) {
    if (/\bmonth\b/i.test(query)) return { type: "summarize", period: "month" }
    return { type: "summarize", period: "week" }
  }
  return null
}

const MARKET_INTEL_TRIGGERS: { patterns: RegExp[]; task: MarketIntelTask }[] = [
  { patterns: [/\b(run|analyze|show)\s+(market\s+)?overview\b/i, /\bmarket\s+overview\b/i], task: "overview" },
  { patterns: [/\b(run|analyze|research)\s+competitors?\b/i, /\bcompetitor\s+(research|analysis|intelligence)\b/i, /\bhow\s+(do\s+we\s+)?compare\s+to\s+competitors?\b/i], task: "competitors" },
  { patterns: [/\b(run|analyze)\s+ad\s*spend\b/i, /\bad\s*spend\s+(analysis|trends|report)\b/i, /\badvertising\s+spend\b/i], task: "ad_spend" },
  { patterns: [/\b(run|analyze)\s+seo\b/i, /\bseo\s+(visibility|analysis|report)\b/i, /\bvisibility\s+(report|analysis)\b/i], task: "seo" },
  { patterns: [/\b(run|show)\s+benchmarks?\b/i, /\bindustry\s+benchmarks?\b/i, /\bhow\s+do\s+we\s+compare\s+to\s+industry\b/i], task: "benchmarks" },
  { patterns: [/\b(run|find)\s+opportunities\b/i, /\bmarket\s+opportunities\b/i, /\bwhere\s+should\s+we\s+focus\b/i, /\bcapital\s+allocation\b/i], task: "opportunities" },
]

function detectMarketIntelAction(query: string): AgentAction | null {
  for (const { patterns, task } of MARKET_INTEL_TRIGGERS) {
    if (patterns.some((p) => p.test(query))) return { type: "run_market_intel", task }
  }
  return null
}

const EXPORT_TRIGGERS: RegExp[] = [
  /\b(export|download)\s+(my\s*)?(data|transactions|financials?)\b/i,
  /\b(export|download)\s+(transactions?|report)\b/i,
  /\bdownload\s+my\s+data\b/i,
  /\bexport\s+(to\s+)?(csv|excel)\b/i,
]

function detectExportDataAction(query: string): AgentAction | null {
  if (EXPORT_TRIGGERS.some((p) => p.test(query))) return { type: "export_data" }
  return null
}

const COMPARE_TRIGGERS: { patterns: RegExp[]; period: "month" | "quarter" }[] = [
  { patterns: [/\bcompare\s+(last\s+)?month\s+to\s+(this|current)\s*month\b/i, /\bcompare\s+this\s+month\s+to\s+last\b/i, /\bmonth\s*over\s*month\b/i], period: "month" },
  { patterns: [/\bcompare\s+(this|last)\s+quarter\b/i, /\bquarter\s*over\s*quarter\b/i, /\bcompare\s+quarters?\b/i], period: "quarter" },
]

function detectComparePeriodsAction(query: string): AgentAction | null {
  for (const { patterns, period } of COMPARE_TRIGGERS) {
    if (patterns.some((p) => p.test(query))) return { type: "compare_periods", period }
  }
  if (/\bcompare\s+(periods?|months?)\b/i.test(query)) return { type: "compare_periods", period: "month" }
  return null
}

const TOP_EXPENSES_TRIGGERS: RegExp[] = [
  /\b(what'?s|what\s+is)\s+(my\s+)?(biggest|top|largest)\s+expense\b/i,
  /\b(show|see)\s+(my\s+)?(top\s+)?expenses?\b/i,
  /\bexpense\s+breakdown\b/i,
  /\b(where|how)\s+(am\s+i|are\s+we)\s+spending\s+(the\s+most|money)\b/i,
  /\bbreak\s+down\s+(my\s+)?expenses?\b/i,
]

function detectShowTopExpensesAction(query: string): AgentAction | null {
  if (TOP_EXPENSES_TRIGGERS.some((p) => p.test(query))) return { type: "show_top_expenses" }
  return null
}

const CASH_FLOW_TRIGGERS: RegExp[] = [
  /\b(show|see)\s+(my\s+)?(cash\s+flow|burn\s+trend)\b/i,
  /\bcash\s+flow\s+(trend|chart|view)\b/i,
  /\bburn\s+trend\b/i,
  /\b(how|what)\s+is\s+(my\s+)?(cash\s+flow|burn)\s+(doing|trend)\b/i,
]

function detectShowCashFlowAction(query: string): AgentAction | null {
  if (CASH_FLOW_TRIGGERS.some((p) => p.test(query))) return { type: "show_cash_flow" }
  return null
}

/**
 * Parse LLM response for "ACTIONS: ..." or "ACTION: ..." line at the end (advanced agent output)
 */
function parseActionsFromLlmResponse(text: string): AgentAction[] {
  const actions: AgentAction[] = []
  const actionsLineMatch = text.match(/\n*ACTIONS?:\s*(.+?)\s*$/im)
  if (!actionsLineMatch) return actions
  const line = actionsLineMatch[1].trim()
  // navigate /path
  const navMatch = line.match(/navigate\s+(\/\S+|\S+)/i)
  if (navMatch) {
    const path = navMatch[1].startsWith("/") ? navMatch[1] : `/${navMatch[1]}`
    if (ALLOWED_PATHS.includes(path as any)) actions.push({ type: "navigate", path })
  }
  // create_transaction expense amount=500 category=Marketing description=Ads
  const createMatch = line.match(/create_transaction\s+(expense|revenue)\s+(?:amount=(\d+(?:\.\d+)?))?\s*(?:category=([^\s]+))?\s*(?:description=([^\s]+))?/i)
  if (createMatch) {
    const kind = createMatch[1].toLowerCase() as "expense" | "revenue"
    const amount = createMatch[2] ? parseFloat(createMatch[2]) : undefined
    if (amount != null && amount > 0)
      actions.push({
        type: "create_transaction",
        kind,
        amount: Math.abs(amount),
        category: createMatch[3]?.replace(/,/g, "") || undefined,
        description: createMatch[4]?.replace(/,/g, " ") || undefined,
      })
  }
  // add_expense amount=123 category=Marketing description=...
  const addExpMatch = line.match(/add_expense\s+(?:amount=(\d+(?:\.\d+)?))?\s*(?:category=([^\s]+))?\s*(?:description=([^\s]+))?/i)
  if (addExpMatch) {
    actions.push({
      type: "add_expense",
      amount: addExpMatch[1] ? parseFloat(addExpMatch[1]) : undefined,
      category: addExpMatch[2]?.replace(/,/g, "") || undefined,
      description: addExpMatch[3]?.replace(/,/g, " ") || undefined,
    })
  }
  const addRevMatch = line.match(/add_revenue\s+(?:amount=(\d+(?:\.\d+)?))?\s*(?:category=([^\s]+))?\s*(?:description=([^\s]+))?/i)
  if (addRevMatch) {
    actions.push({
      type: "add_revenue",
      amount: addRevMatch[1] ? parseFloat(addRevMatch[1]) : undefined,
      category: addRevMatch[2]?.replace(/,/g, "") || undefined,
      description: addRevMatch[3]?.replace(/,/g, " ") || undefined,
    })
  }
  // run_report runway|burn|revenue|week
  const reportMatch = line.match(/run_report\s+(runway|burn|revenue|week)?/i)
  if (reportMatch) actions.push({ type: "run_report", report: (reportMatch[1] as any) || undefined })
  // summarize week|month
  const sumMatch = line.match(/summarize\s+(week|month)?/i)
  if (sumMatch) actions.push({ type: "summarize", period: (sumMatch[1] as any) || "week" })
  // run_market_intel overview|competitors|ad_spend|seo|benchmarks|opportunities
  const marketIntelMatch = line.match(/run_market_intel\s+(overview|competitors|ad_spend|seo|benchmarks|opportunities)/i)
  if (marketIntelMatch) actions.push({ type: "run_market_intel", task: marketIntelMatch[1].toLowerCase() as MarketIntelTask })
  // export_data
  if (/\bexport_data\b/i.test(line)) actions.push({ type: "export_data" })
  // compare_periods month|quarter
  const compareMatch = line.match(/compare_periods\s+(month|quarter)?/i)
  if (compareMatch) actions.push({ type: "compare_periods", period: (compareMatch[1]?.toLowerCase() as "month" | "quarter") || "month" })
  // show_top_expenses
  if (/\bshow_top_expenses\b/i.test(line)) actions.push({ type: "show_top_expenses" })
  // show_cash_flow
  if (/\bshow_cash_flow\b/i.test(line)) actions.push({ type: "show_cash_flow" })
  return actions
}

/** Legacy single ACTION: navigate /path */
function parseActionFromLlmResponse(text: string): AgentAction | null {
  const parsed = parseActionsFromLlmResponse(text)
  return parsed.length > 0 ? parsed[0] : null
}

/**
 * Process user command: detect actions and build reply (with optional LLM).
 * Caller (API) will run the LLM for the main response and merge with these actions.
 */
export function detectActions(query: string): AgentAction[] {
  const actions: AgentAction[] = []
  const nav = detectNavigateAction(query)
  if (nav) actions.push(nav)
  const add = detectAddTransactionAction(query)
  if (add) actions.push(add)
  const report = detectReportOrSummarizeAction(query)
  if (report) actions.push(report)
  const marketIntel = detectMarketIntelAction(query)
  if (marketIntel) actions.push(marketIntel)
  const exportData = detectExportDataAction(query)
  if (exportData) actions.push(exportData)
  const comparePeriods = detectComparePeriodsAction(query)
  if (comparePeriods) actions.push(comparePeriods)
  const topExpenses = detectShowTopExpensesAction(query)
  if (topExpenses) actions.push(topExpenses)
  const cashFlow = detectShowCashFlowAction(query)
  if (cashFlow) actions.push(cashFlow)
  return actions
}

/**
 * Resolve referential follow-ups ("open it", "go there", "yes") using recent conversation
 */
export function resolveContextualQuery(
  query: string,
  recentMessages: { role: string; text: string }[]
): string {
  const q = query.trim().toLowerCase()
  if (!recentMessages.length) return query
  const lastAssistant = [...recentMessages].reverse().find((m) => m.role === "assistant")
  const lastUser = [...recentMessages].reverse().find((m) => m.role === "user")
  // "open it" / "go there" / "show me that" / "yes" / "do it" → repeat last user intent or last suggested page
  if (/\b(open\s+it|go\s+there|show\s*(me\s*)?that|yes|do\s+it|sure|ok(ay)?)\s*$/i.test(q)) {
    if (lastUser?.text) {
      const lower = lastUser.text.toLowerCase()
      for (const { patterns, path } of NAV_TRIGGERS) {
        if (patterns.some((p) => p.test(lastUser!.text))) return `open ${path.replace("/", "")}`
      }
      if (lower.includes("dashboard")) return "open dashboard"
      if (lower.includes("runway")) return "open runway"
      if (lower.includes("bookkeeping")) return "open bookkeeping"
      if (lower.includes("scenario") || lower.includes("what if")) return "open scenarios"
    }
  }
  return query
}

export function getAgentActions(
  query: string,
  llmResponseText: string,
  recentMessages?: { role: string; text: string }[]
): AgentAction[] {
  const resolved = recentMessages?.length ? resolveContextualQuery(query, recentMessages) : query
  const fromRules = detectActions(resolved)
  if (fromRules.length > 0) return fromRules
  const fromLlm = parseActionsFromLlmResponse(llmResponseText)
  if (fromLlm.length > 0) return fromLlm
  return []
}
