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
      return NextResponse.json({ sales: [] })
    }

    const { searchParams } = new URL(request.url)
    const limit = searchParams.get("limit") ? Number.parseInt(searchParams.get("limit")!) : 100

    const { data: rows } = await supabase
      .from("sales")
      .select("*")
      .eq("company_id", company.id)
      .order("date", { ascending: false })
      .limit(limit)

    const sales = (rows ?? []).map((s) => ({
      id: s.id,
      companyId: s.company_id,
      date: s.date,
      productName: s.product_name,
      quantity: s.quantity,
      unitPrice: s.unit_price,
      totalAmount: s.total_amount,
      channel: s.channel,
      customerName: s.customer_name,
      status: s.status,
      createdAt: s.created_at,
      updatedAt: s.updated_at,
    }))

    return NextResponse.json({ sales })
  } catch (error) {
    console.error("[API] Error fetching sales:", error)
    return NextResponse.json({ error: "Failed to fetch sales" }, { status: 500 })
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
      .from("sales")
      .insert({
        company_id: company.id,
        date: body.date,
        product_name: body.productName ?? body.product_name,
        quantity: body.quantity,
        unit_price: body.unitPrice ?? body.unit_price,
        total_amount: body.totalAmount ?? body.total_amount,
        channel: body.channel,
        customer_name: body.customerName ?? body.customer_name,
        status: body.status ?? "completed",
      })
      .select()
      .single()

    if (error) {
      console.error("[API] Create sale error:", error)
      return NextResponse.json({ error: "Failed to create sale" }, { status: 500 })
    }

    return NextResponse.json({
      sale: {
        id: row.id,
        companyId: row.company_id,
        date: row.date,
        productName: row.product_name,
        quantity: row.quantity,
        unitPrice: row.unit_price,
        totalAmount: row.total_amount,
        channel: row.channel,
        customerName: row.customer_name,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      },
    })
  } catch (error) {
    console.error("[API] Error creating sale:", error)
    return NextResponse.json({ error: "Failed to create sale" }, { status: 500 })
  }
}
