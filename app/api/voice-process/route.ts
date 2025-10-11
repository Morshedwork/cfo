import { getGeminiClient } from "@/lib/gemini-client"
import type { NextRequest } from "next/server"

export const runtime = "edge"
export const maxDuration = 30

export async function POST(req: NextRequest) {
  try {
    const { command, currentData } = await req.json()

    const gemini = getGeminiClient()
    const result = await gemini.processVoiceCommand(command, currentData)

    return Response.json(result)
  } catch (error) {
    console.error("[v0] Voice processing error:", error)
    return Response.json({ error: "Failed to process voice command" }, { status: 500 })
  }
}
