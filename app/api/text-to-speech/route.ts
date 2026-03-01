import { type NextRequest, NextResponse } from "next/server"

/** Try MiniMax T2A first, then ElevenLabs. Returns audio blob or JSON error. */
export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text is required" }, { status: 400 })
    }

    const minimaxKey = process.env.MINIMAX_API_KEY || process.env.NEXT_PUBLIC_MINIMAX_API_KEY
    const elevenLabsKey = process.env.ELEVENLABS_API_KEY || process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY

    // 1) Try MiniMax first (with timeout so slow API doesn't block response)
    if (minimaxKey) {
      try {
        const audio = await ttsMiniMax(text, minimaxKey)
        if (audio) {
          return new NextResponse(audio, {
            headers: {
              "Content-Type": "audio/mpeg",
              "Content-Length": audio.byteLength.toString(),
            },
          })
        }
      } catch (err) {
        console.warn("[TTS] MiniMax failed or timed out, falling back:", (err as Error)?.message)
      }
    }

    // 2) Fallback: ElevenLabs
    if (elevenLabsKey) {
      try {
        const blob = await ttsElevenLabs(text, elevenLabsKey)
        return new NextResponse(blob, {
          headers: {
            "Content-Type": "audio/mpeg",
            "Content-Length": blob.size.toString(),
          },
        })
      } catch (err) {
        console.error("[TTS] ElevenLabs failed:", (err as Error)?.message)
      }
    }

    return NextResponse.json(
      { error: "No TTS provider configured. Set MINIMAX_API_KEY or ELEVENLABS_API_KEY in .env.local" },
      { status: 503 }
    )
  } catch (error) {
    console.error("[TTS API] Error:", error)
    return NextResponse.json({ error: "Failed to generate speech" }, { status: 500 })
  }
}

const MINIMAX_TTS_TIMEOUT_MS = 8_000

/** MiniMax T2A v2: returns MP3 buffer or null. Times out so slow API doesn't block response. */
async function ttsMiniMax(text: string, apiKey: string): Promise<ArrayBuffer | null> {
  const url = "https://api.minimax.io/v1/t2a_v2"
  const body = {
    model: "speech-2.8-turbo",
    text,
    stream: false,
    voice_setting: {
      voice_id: "English_expressive_narrator",
      speed: 1,
      vol: 1,
      pitch: 0,
    },
    audio_setting: {
      sample_rate: 32000,
      bitrate: 128000,
      format: "mp3",
      channel: 1,
    },
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), MINIMAX_TTS_TIMEOUT_MS)

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
    signal: controller.signal,
  }).finally(() => clearTimeout(timeoutId))

  if (!res.ok) {
    const errText = await res.text().catch(() => "")
    throw new Error(`MiniMax TTS ${res.status}: ${errText}`)
  }

  const json = (await res.json()) as { data?: { audio?: string }; base_resp?: { status_code?: number } }
  const hex = json?.data?.audio
  if (!hex || typeof hex !== "string") {
    throw new Error("MiniMax returned no audio")
  }

  // Hex string -> Uint8Array -> ArrayBuffer
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
  }
  return bytes.buffer
}

/** ElevenLabs TTS: returns MP3 blob. */
async function ttsElevenLabs(text: string, apiKey: string): Promise<Blob> {
  const voiceId = "21m00Tcm4TlvDq8ikWAM"
  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: {
      Accept: "audio/mpeg",
      "Content-Type": "application/json",
      "xi-api-key": apiKey,
    },
    body: JSON.stringify({
      text,
      model_id: "eleven_turbo_v2_5",
      voice_settings: {
        stability: 0.65,
        similarity_boost: 0.85,
        style: 0.0,
        use_speaker_boost: true,
      },
    }),
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error")
    throw new Error(`ElevenLabs API ${response.status}: ${errorText}`)
  }

  return response.blob()
}
