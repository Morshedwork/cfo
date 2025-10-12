import { getAICFOClient } from "@/lib/ai-cfo-client"
import { isFallbackMode } from "@/lib/gemini-client"
import type { NextRequest } from "next/server"
import type { FinancialMetrics } from "@/lib/financial-engine"

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

    console.log("[AI Chat API] Processing message:", message)

    const aiCFO = getAICFOClient()
    const useFallback = isFallbackMode()

    // Build financial context with defaults
    const financialContext: FinancialMetrics = {
      cashBalance: context?.cashBalance || 70000,
      monthlyBurn: context?.monthlyBurn || 82000,
      monthlyRevenue: context?.monthlyRevenue || context?.mrr || 35000,
      runway: context?.runway || 0.9,
      mrr: context?.mrr || 35000,
      arr: context?.arr || (context?.mrr || 35000) * 12,
      growthRate: context?.growthRate || context?.growth || 25,
      grossMargin: context?.grossMargin || 70,
      burnMultiple: context?.burnMultiple || 2.3,
    }

    // Process message with enhanced AI CFO client
    const response = await aiCFO.processMessage(message, financialContext)

    console.log("[AI Chat API] Response type:", response.type)

    // Return enhanced response with rich data
    return Response.json({
      type: response.type,
      message: response.message,
      data: response.data,
      chart: response.chart,
      actions: response.actions,
      timestamp: new Date().toISOString(),
      demoMode: useFallback,
    })
  } catch (error) {
    console.error("[AI Chat API] Error:", error)
    return Response.json(
      {
        type: "text",
        error: "Failed to process message",
        message: "I'm having trouble processing your request right now. Please try again in a moment.",
        demoMode: isFallbackMode(),
      },
      { status: 500 }
    )
  }
}
