import { getGeminiClient } from "@/lib/gemini-client"
import type { NextRequest } from "next/server"

export const runtime = "edge"
export const maxDuration = 30

export async function POST(req: NextRequest) {
  try {
    const { message, context } = await req.json()

    const gemini = getGeminiClient()

    // Build financial context
    const financialContext = {
      cashBalance: context?.cashBalance || 70000,
      monthlyBurn: context?.monthlyBurn || 82000,
      runway: context?.runway || 0.9,
      mrr: context?.mrr || 35000,
      growth: context?.growth || 25,
      ...context,
    }

    const response = await gemini.analyzeFinancialData(financialContext, message)

    return Response.json({
      message: response.text,
      insights: response.insights,
      recommendations: response.recommendations,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[v0] AI Chat API error:", error)
    return Response.json({ error: "Failed to process message" }, { status: 500 })
  }
}
