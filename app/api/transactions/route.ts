import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
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
      return NextResponse.json({ transactions: [] })
    }

    const { searchParams } = new URL(request.url)
    const limit = searchParams.get("limit") ? Number.parseInt(searchParams.get("limit")!) : 100

    const { data: transactions, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("company_id", company.id)
      .order("date", { ascending: false })
      .limit(limit)

    if (error) throw error

    return NextResponse.json({ transactions })
  } catch (error) {
    console.error("[v0] Error fetching transactions:", error)
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 })
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

    const { data: transaction, error } = await supabase
      .from("transactions")
      .insert({
        company_id: company.id,
        ...body,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ transaction })
  } catch (error) {
    console.error("[v0] Error creating transaction:", error)
    return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 })
  }
}
