import { NextResponse } from "next/server"
import { getUserCompanies, createCompany, updateCompany, getCompanyById } from "@/lib/firebase/db"
import { getAuthUser } from "@/lib/firebase/server-auth"

export async function GET(request: Request) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const companies = await getUserCompanies(user.uid)
    const company = companies.length > 0 ? companies[0] : null

    return NextResponse.json({ company })
  } catch (error) {
    console.error("[Firebase] Error fetching company:", error)
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

    const companyId = await createCompany({
      userId: user.uid,
      name: body.name || 'My Company',
      industry: body.industry,
      foundedDate: body.foundedDate,
      teamSize: body.teamSize,
      fundingStage: body.fundingStage,
      monthlyBurn: body.monthlyBurn,
      currentCash: body.currentCash,
    })

    const company = await getCompanyById(companyId)

    return NextResponse.json({ company })
  } catch (error) {
    console.error("[Firebase] Error creating company:", error)
    return NextResponse.json({ error: "Failed to create company" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    
    // Get user's company
    const companies = await getUserCompanies(user.uid)
    if (companies.length === 0) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 })
    }

    const companyId = companies[0].id
    await updateCompany(companyId, body)
    
    const company = await getCompanyById(companyId)

    return NextResponse.json({ company })
  } catch (error) {
    console.error("[Firebase] Error updating company:", error)
    return NextResponse.json({ error: "Failed to update company" }, { status: 500 })
  }
}
