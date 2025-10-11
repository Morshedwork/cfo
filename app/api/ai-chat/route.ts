import { getGeminiClient, isFallbackMode } from "@/lib/gemini-client"
import type { NextRequest } from "next/server"

export const runtime = "edge"
export const maxDuration = 30

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { message, context } = body

    if (!message || typeof message !== "string") {
      return Response.json(
        { error: "Invalid request: message is required and must be a string" },
        { status: 400 }
      )
    }

    const gemini = getGeminiClient()
    const useFallback = isFallbackMode()

    // Build financial context with defaults
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
      demoMode: useFallback,
    })
  } catch (error) {
    console.error("[v0] AI Chat API error:", error)
    return Response.json(
      {
        error: "Failed to process message",
        message: "I'm having trouble processing your request right now. Please try again in a moment.",
        demoMode: isFallbackMode(),
      },
      { status: 500 }
    )
  }
}
