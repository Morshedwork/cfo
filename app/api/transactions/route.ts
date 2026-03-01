import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getAuthUser } from "@/lib/supabase/server-auth"

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
      return NextResponse.json({ transactions: [] })
    }

    const { searchParams } = new URL(request.url)
    const limit = searchParams.get("limit") ? Number.parseInt(searchParams.get("limit")!) : 100

    const { data: rows } = await supabase
      .from("transactions")
      .select("*")
      .eq("company_id", company.id)
      .order("date", { ascending: false })
      .limit(limit)

    const transactions = (rows ?? []).map((t) => ({
      id: t.id,
      companyId: t.company_id,
      date: t.date,
      description: t.description,
      amount: t.amount,
      category: t.category,
      type: t.type,
      paymentMethod: t.payment_method,
      vendor: t.vendor,
      aiConfidence: t.ai_confidence,
      needsReview: t.needs_review,
      createdAt: t.created_at,
      updatedAt: t.updated_at,
    }))

    return NextResponse.json({ transactions })
  } catch (error) {
    console.error("[API] Error fetching transactions:", error)
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 })
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
    const type = body.type === "revenue" ? "income" : (body.type || "expense")

    const { data: row, error } = await supabase
      .from("transactions")
      .insert({
        company_id: company.id,
        date: body.date,
        description: body.description,
        amount: body.amount,
        category: body.category,
        type,
        payment_method: body.paymentMethod ?? body.payment_method,
        vendor: body.vendor,
        ai_confidence: body.aiConfidence ?? body.ai_confidence,
        needs_review: body.needsReview ?? body.needs_review ?? false,
      })
      .select()
      .single()

    if (error) {
      console.error("[API] Create transaction error:", error)
      return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 })
    }

    return NextResponse.json({
      transaction: {
        id: row.id,
        companyId: row.company_id,
        date: row.date,
        description: row.description,
        amount: row.amount,
        category: row.category,
        type: row.type,
        paymentMethod: row.payment_method,
        vendor: row.vendor,
        aiConfidence: row.ai_confidence,
        needsReview: row.needs_review,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      },
    })
  } catch (error) {
    console.error("[API] Error creating transaction:", error)
    return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 })
  }
}
