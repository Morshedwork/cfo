import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getAuthUser } from "@/lib/supabase/server-auth"

function toCompanyJson(row: any) {
  if (!row) return null
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    industry: row.industry,
    foundedDate: row.founded_date,
    teamSize: row.team_size,
    fundingStage: row.funding_stage,
    monthlyBurn: row.monthly_burn,
    currentCash: row.current_cash,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function GET(request: Request) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = await createClient()
    const { data: company } = await supabase
      .from("companies")
      .select("*")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle()

    return NextResponse.json({ company: toCompanyJson(company) })
  } catch (error) {
    console.error("[API] Error fetching company:", error)
    return NextResponse.json({ error: "Failed to fetch company" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const supabase = await createClient()

    const { data: row, error } = await supabase
      .from("companies")
      .insert({
        user_id: user.id,
        name: body.name ?? "My Company",
        industry: body.industry,
        founded_date: body.foundedDate ?? body.founded_date,
        team_size: body.teamSize ?? body.team_size,
        funding_stage: body.fundingStage ?? body.funding_stage,
        monthly_burn: body.monthlyBurn ?? body.monthly_burn,
        current_cash: body.currentCash ?? body.current_cash,
      })
      .select()
      .single()

    if (error) {
      console.error("[API] Create company error:", error)
      return NextResponse.json({ error: "Failed to create company" }, { status: 500 })
    }

    return NextResponse.json({ company: toCompanyJson(row) })
  } catch (error) {
    console.error("[API] Error creating company:", error)
    return NextResponse.json({ error: "Failed to create company" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = await createClient()
    const { data: company } = await supabase
      .from("companies")
      .select("id")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle()

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 })
    }

    const body = await request.json()
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (body.name != null) updates.name = body.name
    if (body.industry != null) updates.industry = body.industry
    if (body.foundedDate != null) updates.founded_date = body.foundedDate
    if (body.teamSize != null) updates.team_size = body.teamSize
    if (body.fundingStage != null) updates.funding_stage = body.fundingStage
    if (body.monthlyBurn != null) updates.monthly_burn = body.monthlyBurn
    if (body.currentCash != null) updates.current_cash = body.currentCash

    const { data: row, error } = await supabase
      .from("companies")
      .update(updates)
      .eq("id", company.id)
      .select()
      .single()

    if (error) {
      console.error("[API] Update company error:", error)
      return NextResponse.json({ error: "Failed to update company" }, { status: 500 })
    }

    return NextResponse.json({ company: toCompanyJson(row) })
  } catch (error) {
    console.error("[API] Error updating company:", error)
    return NextResponse.json({ error: "Failed to update company" }, { status: 500 })
  }
}
