import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getAuthUser } from "@/lib/supabase/server-auth"

function toInsightJson(row: any) {
  if (!row) return null
  return {
    id: row.id,
    companyId: row.company_id,
    type: row.type,
    title: row.title,
    description: row.description,
    severity: row.severity,
    data: row.data,
    isRead: row.is_read,
    createdAt: row.created_at,
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
      .select("id")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle()

    if (!company) {
      return NextResponse.json({ insights: [] })
    }

    const { data: rows } = await supabase
      .from("ai_insights")
      .select("*")
      .eq("company_id", company.id)
      .order("created_at", { ascending: false })
      .limit(10)

    const insights = (rows ?? []).map(toInsightJson)

    return NextResponse.json({ insights })
  } catch (error) {
    console.error("[API] Error fetching insights:", error)
    return NextResponse.json({ error: "Failed to fetch insights" }, { status: 500 })
  }
}

export async function POST(request: Request) {
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

    const { data: row, error } = await supabase
      .from("ai_insights")
      .insert({
        company_id: company.id,
        type: body.type,
        title: body.title,
        description: body.description,
        severity: body.severity ?? "info",
        data: body.data ?? null,
        is_read: body.isRead ?? false,
      })
      .select()
      .single()

    if (error) {
      console.error("[API] Create insight error:", error)
      return NextResponse.json({ error: "Failed to create insight" }, { status: 500 })
    }

    return NextResponse.json({ insight: toInsightJson(row) })
  } catch (error) {
    console.error("[API] Error creating insight:", error)
    return NextResponse.json({ error: "Failed to create insight" }, { status: 500 })
  }
}
