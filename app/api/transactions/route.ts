import { NextResponse } from "next/server"
import { getUserCompanies, getCompanyTransactions, createTransaction } from "@/lib/firebase/db"
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
      return NextResponse.json({ transactions: [] })
    }

    const companyId = companies[0].id
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get("limit") ? Number.parseInt(searchParams.get("limit")!) : 100

    const transactions = await getCompanyTransactions(companyId, limit)

    return NextResponse.json({ transactions })
  } catch (error) {
    console.error("[Firebase] Error fetching transactions:", error)
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 })
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

    const transactionId = await createTransaction({
      companyId,
      date: body.date,
      description: body.description,
      amount: body.amount,
      category: body.category,
      type: body.type,
      paymentMethod: body.paymentMethod,
      vendor: body.vendor,
      aiConfidence: body.aiConfidence,
      needsReview: body.needsReview || false,
    })

    return NextResponse.json({ transaction: { id: transactionId, ...body } })
  } catch (error) {
    console.error("[Firebase] Error creating transaction:", error)
    return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 })
  }
}
