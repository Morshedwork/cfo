import { getGeminiClient, isFallbackMode } from "@/lib/gemini-client"
import type { NextRequest } from "next/server"

export const runtime = "edge"
export const maxDuration = 30

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { description, amount } = body

    if (!description || typeof description !== "string") {
      return Response.json(
        { error: "Invalid request: description is required and must be a string" },
        { status: 400 }
      )
    }

    if (amount === undefined || typeof amount !== "number") {
      return Response.json(
        { error: "Invalid request: amount is required and must be a number" },
        { status: 400 }
      )
    }

    const gemini = getGeminiClient()
    const result = await gemini.categorizeTransaction(description, amount)

    return Response.json({
      ...result,
      demoMode: isFallbackMode(),
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[v0] Transaction categorization error:", error)
    return Response.json(
      {
        error: "Failed to categorize transaction",
        category: "Uncategorized",
        confidence: 50,
        type: "expense",
        demoMode: isFallbackMode(),
      },
      { status: 500 }
    )
  }
}
