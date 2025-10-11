import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's company
    const { data: company } = await supabase.from("companies").select("id").eq("user_id", user.id).single()

    if (!company) {
      return NextResponse.json({ insights: [] })
    }

    const { data: insights, error } = await supabase
      .from("ai_insights")
      .select("*")
      .eq("company_id", company.id)
      .order("created_at", { ascending: false })
      .limit(10)

    if (error) throw error

    return NextResponse.json({ insights })
  } catch (error) {
    console.error("[v0] Error fetching insights:", error)
    return NextResponse.json({ error: "Failed to fetch insights" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's company
    const { data: company } = await supabase.from("companies").select("id").eq("user_id", user.id).single()

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 })
    }

    const body = await request.json()

    const { data: insight, error } = await supabase
      .from("ai_insights")
      .insert({
        company_id: company.id,
        ...body,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ insight })
  } catch (error) {
    console.error("[v0] Error creating insight:", error)
    return NextResponse.json({ error: "Failed to create insight" }, { status: 500 })
  }
}
