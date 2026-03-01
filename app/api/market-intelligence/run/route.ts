import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getAuthUser } from "@/lib/supabase/server-auth"
import {
  runMarketIntelAgent,
  type MarketIntelTask,
  type MarketIntelContext,
  type MarketIntelParams,
} from "@/lib/market-intelligence-agents"

const VALID_TASKS: MarketIntelTask[] = [
  "overview",
  "competitors",
  "ad_spend",
  "seo",
  "benchmarks",
  "opportunities",
]

export async function POST(request: Request) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const task = body.task as string
    const params = (body.params ?? {}) as MarketIntelParams

    if (!task || !VALID_TASKS.includes(task as MarketIntelTask)) {
      return NextResponse.json(
        { error: "Invalid or missing task. Use one of: " + VALID_TASKS.join(", ") },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const { data: company } = await supabase
      .from("companies")
      .select("name, industry, monthly_burn, current_cash")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle()

    const burn = company?.monthly_burn != null ? Number(company.monthly_burn) : undefined
    const cash = company?.current_cash != null ? Number(company.current_cash) : undefined
    const runwayMonths =
      burn != null && burn > 0 && cash != null ? Math.round((cash / burn) * 10) / 10 : undefined

    const context: MarketIntelContext = {
      companyName: company?.name ?? undefined,
      industry: company?.industry ?? undefined,
      competitors: Array.isArray(params.competitors) ? params.competitors : [],
      monthlyBurn: burn,
      cashBalance: cash,
      runwayMonths,
    }

    const result = await runMarketIntelAgent(task as MarketIntelTask, context, params)
    return NextResponse.json({ ok: true, result })
  } catch (error) {
    console.error("[API] Market intelligence run error:", error)
    return NextResponse.json(
      { error: "Failed to run market intelligence agent" },
      { status: 500 }
    )
  }
}
