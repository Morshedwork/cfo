import { getGeminiClient } from "@/lib/gemini-client"
import type { NextRequest } from "next/server"

export const runtime = "edge"
export const maxDuration = 30

export async function POST(req: NextRequest) {
  try {
    const { description, amount } = await req.json()

    const gemini = getGeminiClient()
    const result = await gemini.categorizeTransaction(description, amount)

    return Response.json(result)
  } catch (error) {
    console.error("[v0] Transaction categorization error:", error)
    return Response.json({ error: "Failed to categorize transaction" }, { status: 500 })
  }
}
