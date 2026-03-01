/**
 * Market Intelligence Agents — execute tasks: competitor research, ad spend, SEO, benchmarks, opportunities.
 * Each agent uses the LLM to produce structured reports from company context and optional params.
 */

import { getGeminiClient } from "@/lib/gemini-client"

export type MarketIntelTask =
  | "overview"
  | "competitors"
  | "ad_spend"
  | "seo"
  | "benchmarks"
  | "opportunities"

export interface MarketIntelContext {
  companyName?: string
  industry?: string
  /** Competitor domains or names (e.g. from user config) */
  competitors?: string[]
  /** Optional financial context for benchmarks/opportunities */
  monthlyRevenue?: number
  monthlyBurn?: number
  cashBalance?: number
  runwayMonths?: number
  growthRate?: number
}

export interface MarketIntelParams {
  competitors?: string[]
  /** Optional custom query or focus area */
  focus?: string
}

export interface AgentResult {
  summary: string
  bullets: string[]
  recommendations: string[]
  raw?: string
}

const TASK_PROMPTS: Record<
  MarketIntelTask,
  { system: string; buildUserPrompt: (ctx: MarketIntelContext, params: MarketIntelParams) => string }
> = {
  overview: {
    system: `You are Aura's Market Intelligence agent. Produce a brief strategic overview combining internal finance with external market context. Be specific and actionable. Output format:
SUMMARY: (2-3 sentences)
BULLETS:
- bullet 1
- bullet 2
- bullet 3
RECOMMENDATIONS:
- rec 1
- rec 2`,
    buildUserPrompt: (ctx, _params) => `
Company: ${ctx.companyName ?? "Our company"}
Industry: ${ctx.industry ?? "B2B / startup"}
Financial context: Revenue ~$${ctx.monthlyRevenue?.toLocaleString() ?? "—"}/mo, Burn ~$${ctx.monthlyBurn?.toLocaleString() ?? "—"}/mo, Runway ${ctx.runwayMonths ?? "—"} months, Growth ${ctx.growthRate ?? "—"}%.
Competitors being tracked: ${ctx.competitors?.length ? ctx.competitors.join(", ") : "None specified yet."}

Write a short Market Intelligence overview: how internal financials connect to external signals (competitors, benchmarks, opportunities). Focus on data-driven scaling and capital allocation.`,
  },
  competitors: {
    system: `You are Aura's Competitor Intelligence agent. Research public signals for the given competitors (job postings, funding, product launches, marketing presence). Be factual and cite types of signals. Output format:
SUMMARY: (2-3 sentences)
BULLETS:
- bullet 1
- bullet 2
RECOMMENDATIONS:
- rec 1
- rec 2`,
    buildUserPrompt: (ctx, params) => {
      const list = params.competitors?.length ? params.competitors : ctx.competitors ?? []
      const compList = list.length ? list.join(", ") : "No competitor list provided."
      const focusLine = params.focus ? "Focus: " + params.focus : ""
      return (
        "\nCompany: " + (ctx.companyName ?? "Our company") +
        "\nIndustry: " + (ctx.industry ?? "B2B / startup") +
        "\nCompetitors to analyze: " + compList +
        "\n" + focusLine +
        "\n\nBased on typical public signals (job postings, funding rounds, product launches, hiring, marketing channels), provide a competitor intelligence summary. Note: we do not have live API data here; give a structured template of what to look for and how to interpret signals for these competitors, plus 2-3 concrete recommendations."
      )
    },
  },
  ad_spend: {
    system: `You are Aura's Ad Spend Intelligence agent. Analyze estimated ad spend trends and benchmarks for the category. Output format:
SUMMARY: (2-3 sentences)
BULLETS:
- bullet 1
- bullet 2
RECOMMENDATIONS:
- rec 1
- rec 2`,
    buildUserPrompt: (ctx, params) => `
Company: ${ctx.companyName ?? "Our company"}
Industry: ${ctx.industry ?? "B2B / startup"}
Monthly revenue (context): $${ctx.monthlyRevenue?.toLocaleString() ?? "—"}
${params.focus ? `Focus: ${params.focus}` : ""}

Provide ad spend intelligence: typical ad spend levels for this segment (as % of revenue or absolute ranges), channel trends (Meta, Google, LinkedIn, etc.), and ROI expectations. Give actionable recommendations for budget allocation.`,
  },
  seo: {
    system: `You are Aura's SEO & Visibility agent. Focus on SEO visibility and growth patterns for the segment. Output format:
SUMMARY: (2-3 sentences)
BULLETS:
- bullet 1
- bullet 2
RECOMMENDATIONS:
- rec 1
- rec 2`,
    buildUserPrompt: (ctx, params) => `
Company: ${ctx.companyName ?? "Our company"}
Industry: ${ctx.industry ?? "B2B / startup"}
Competitors (for comparison): ${ctx.competitors?.length ? ctx.competitors.join(", ") : "Not specified"}
${params.focus ? `Focus: ${params.focus}` : ""}

Provide SEO & visibility intelligence: what to track (organic share, keywords, content gaps), how to compare with competitors, and growth pattern benchmarks. Give 2-3 concrete recommendations.`,
  },
  benchmarks: {
    system: `You are Aura's Industry Benchmarks agent. Compare metrics to industry norms. Output format:
SUMMARY: (2-3 sentences)
BULLETS:
- bullet 1
- bullet 2
RECOMMENDATIONS:
- rec 1
- rec 2`,
    buildUserPrompt: (ctx, _params) => `
Company: ${ctx.companyName ?? "Our company"}
Industry: ${ctx.industry ?? "B2B / startup"}
Current metrics: Revenue ~$${ctx.monthlyRevenue?.toLocaleString() ?? "—"}/mo, Burn ~$${ctx.monthlyBurn?.toLocaleString() ?? "—"}/mo, Runway ${ctx.runwayMonths ?? "—"} months, Growth ${ctx.growthRate ?? "—"}%.

Provide industry benchmarks for this segment: typical revenue growth, burn multiples, runway norms, margin benchmarks. Compare our numbers to these and give 2-3 recommendations to improve positioning.`,
  },
  opportunities: {
    system: `You are Aura's Market Opportunities agent. Identify opportunities and inefficiencies from unit economics and market context. Output format:
SUMMARY: (2-3 sentences)
BULLETS:
- bullet 1
- bullet 2
RECOMMENDATIONS:
- rec 1
- rec 2`,
    buildUserPrompt: (ctx, params) => `
Company: ${ctx.companyName ?? "Our company"}
Industry: ${ctx.industry ?? "B2B / startup"}
Financials: Revenue ~$${ctx.monthlyRevenue?.toLocaleString() ?? "—"}/mo, Burn ~$${ctx.monthlyBurn?.toLocaleString() ?? "—"}/mo, Runway ${ctx.runwayMonths ?? "—"} months, Growth ${ctx.growthRate ?? "—"}%.
${params.focus ? `Focus: ${params.focus}` : ""}

Identify market opportunities and inefficiencies: where to double down, where to reallocate, and smarter capital allocation. Be specific and actionable.`,
  },
}

function parseStructuredResponse(raw: string): AgentResult {
  const summaryMatch = raw.match(/SUMMARY:\s*([\s\S]*?)(?=BULLETS:|$)/i)
  const bulletsMatch = raw.match(/BULLETS:\s*([\s\S]*?)(?=RECOMMENDATIONS:|$)/i)
  const recsMatch = raw.match(/RECOMMENDATIONS:\s*([\s\S]*?)$/i)

  const summary = summaryMatch ? summaryMatch[1].replace(/\n/g, " ").trim() : raw.slice(0, 400).trim()
  const bullets = bulletsMatch
    ? bulletsMatch[1]
        .split(/\n/)
        .map((s) => s.replace(/^[\s\-*]+/, "").trim())
        .filter(Boolean)
    : []
  const recommendations = recsMatch
    ? recsMatch[1]
        .split(/\n/)
        .map((s) => s.replace(/^[\s\-*]+/, "").trim())
        .filter(Boolean)
    : []

  return { summary, bullets, recommendations, raw }
}

/** Run a single market intelligence agent task. */
export async function runMarketIntelAgent(
  task: MarketIntelTask,
  context: MarketIntelContext,
  params: MarketIntelParams = {}
): Promise<AgentResult> {
  const config = TASK_PROMPTS[task]
  const userPrompt = config.buildUserPrompt(context, params)
  const fullPrompt = `${config.system}\n\n---\n\n${userPrompt}`

  const gemini = getGeminiClient()
  const raw = await gemini.generateTextWithLimit(fullPrompt, 700)
  return parseStructuredResponse(raw)
}
