import { NextResponse } from "next/server"
import { getUserCompanies, getCompanySales, createSale } from "@/lib/firebase/db"
import { getAuthUser } from "@/lib/firebase/server-auth"

export async function GET(request: Request) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's company
    const companies = await getUserCompanies(user.uid)
    if (companies.length === 0) {
      return NextResponse.json({ sales: [] })
    }

    const companyId = companies[0].id
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get("limit") ? Number.parseInt(searchParams.get("limit")!) : 100

    const sales = await getCompanySales(companyId, limit)

    return NextResponse.json({ sales })
  } catch (error) {
    console.error("[Firebase] Error fetching sales:", error)
    return NextResponse.json({ error: "Failed to fetch sales" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's company
    const companies = await getUserCompanies(user.uid)
    if (companies.length === 0) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 })
    }

    const companyId = companies[0].id
    const body = await request.json()

    const saleId = await createSale({
      companyId,
      date: body.date,
      productName: body.productName || body.product_name,
      quantity: body.quantity,
      unitPrice: body.unitPrice || body.unit_price,
      totalAmount: body.totalAmount || body.total_amount,
      channel: body.channel,
      customerName: body.customerName || body.customer_name,
      status: body.status || 'completed',
    })

    return NextResponse.json({ sale: { id: saleId, ...body } })
  } catch (error) {
    console.error("[Firebase] Error creating sale:", error)
    return NextResponse.json({ error: "Failed to create sale" }, { status: 500 })
  }
}
