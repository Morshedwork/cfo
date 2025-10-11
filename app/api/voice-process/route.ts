import { getGeminiClient, isFallbackMode } from "@/lib/gemini-client"
import type { NextRequest } from "next/server"

export const runtime = "edge"
export const maxDuration = 30

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { command, currentData } = body

    if (!command || typeof command !== "string") {
      return Response.json(
        { error: "Invalid request: command is required and must be a string" },
        { status: 400 }
      )
    }

    const gemini = getGeminiClient()
    const result = await gemini.processVoiceCommand(command, currentData || {})

    return Response.json({
      ...result,
      demoMode: isFallbackMode(),
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[v0] Voice processing error:", error)
    return Response.json(
      {
        error: "Failed to process voice command",
        action: "query_data",
        data: {},
        message: "I'm having trouble processing your voice command right now. Please try again.",
        demoMode: isFallbackMode(),
      },
      { status: 500 }
    )
  }
}
