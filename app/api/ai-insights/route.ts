import { NextResponse } from "next/server"
import { getUserCompanies, getCompanyInsights, createAIInsight } from "@/lib/firebase/db"
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
      return NextResponse.json({ insights: [] })
    }

    const companyId = companies[0].id
    const insights = await getCompanyInsights(companyId, 10)

    return NextResponse.json({ insights })
  } catch (error) {
    console.error("[Firebase] Error fetching insights:", error)
    return NextResponse.json({ error: "Failed to fetch insights" }, { status: 500 })
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

    const insightId = await createAIInsight({
      companyId,
      type: body.type,
      title: body.title,
      description: body.description,
      severity: body.severity || 'info',
      data: body.data,
      isRead: false,
    })

    return NextResponse.json({ insight: { id: insightId, ...body } })
  } catch (error) {
    console.error("[Firebase] Error creating insight:", error)
    return NextResponse.json({ error: "Failed to create insight" }, { status: 500 })
  }
}
