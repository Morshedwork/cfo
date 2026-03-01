/**
 * MiniMax TTS configuration (from env or defaults).
 * Set NEXT_PUBLIC_MINIMAX_API_KEY to use MiniMax as the voice agent.
 */
export type MiniMaxConfig = {
  apiKey: string
  model: string
  voiceId: string
}

const DEFAULT_MINIMAX_MODEL = "speech-2.6-turbo"
const DEFAULT_MINIMAX_VOICE_ID = "English_Graceful_Lady"

function getMiniMaxConfig(): MiniMaxConfig | null {
  if (typeof window === "undefined") return null
  const apiKey = process.env.NEXT_PUBLIC_MINIMAX_API_KEY?.trim()
  if (!apiKey || apiKey.startsWith("your_")) return null
  return {
    apiKey,
    model: process.env.NEXT_PUBLIC_MINIMAX_MODEL?.trim() || DEFAULT_MINIMAX_MODEL,
    voiceId: process.env.NEXT_PUBLIC_MINIMAX_VOICE_ID?.trim() || DEFAULT_MINIMAX_VOICE_ID,
  }
}

/** Which TTS provider is active: MiniMax (voice agent), ElevenLabs, or none. */
export function getTTSProvider(): "minimax" | "elevenlabs" | null {
  if (typeof window === "undefined") return null
  if (getMiniMaxConfig()) return "minimax"
  const key = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY?.trim()
  if (key && !key.startsWith("your_")) return "elevenlabs"
  return null
}

/**
 * Voice Service with MiniMax and ElevenLabs Support.
 * Voice agent uses MiniMax when NEXT_PUBLIC_MINIMAX_API_KEY is set.
 */
export class SimpleVoiceService {
  private currentUtterance: SpeechSynthesisUtterance | null = null
  private currentAudio: HTMLAudioElement | null = null
  private isPlayingAudio = false

  /**
   * Check if browser speech synthesis is supported
   */
  isSupported(): boolean {
    return typeof window !== "undefined" && "speechSynthesis" in window
  }

  /**
   * Speak text - MiniMax (if key set) or ElevenLabs (no browser fallback)
   */
  async speak(text: string, onEnd?: () => void, onError?: (error: Error) => void): Promise<void> {
    console.log("[Voice] 🎤 New speak request")

    const wasPlaying = this.isPlayingAudio
    if (wasPlaying) {
      console.log("[Voice] ⚠️ Already playing audio - stopping previous")
    }

    this.stopSpeaking()
    this.isPlayingAudio = true

    if (wasPlaying) {
      await new Promise((resolve) => setTimeout(resolve, 150))
    } else {
      await new Promise((resolve) => setTimeout(resolve, 50))
    }

    const minimaxConfig = getMiniMaxConfig()
    const elevenLabsKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY?.trim()
    const hasElevenLabs = elevenLabsKey && !elevenLabsKey.startsWith("your_")

    if (minimaxConfig) {
      try {
        await this.speakWithMiniMax(text, minimaxConfig, onEnd, onError)
        return
      } catch (error) {
        console.error("[Voice] ❌ MiniMax failed:", error)
        this.isPlayingAudio = false
        if (onError) onError(error as Error)
        throw error
      }
    }

    if (hasElevenLabs && elevenLabsKey) {
      try {
        await this.speakWithElevenLabs(text, elevenLabsKey, onEnd, onError)
        return
      } catch (error) {
        console.error("[Voice] ❌ ElevenLabs failed:", error)
        this.isPlayingAudio = false
        if (onError) onError(error as Error)
        throw error
      }
    }

    this.isPlayingAudio = false
    const errorMsg =
      "No TTS API key configured. Add NEXT_PUBLIC_MINIMAX_API_KEY or NEXT_PUBLIC_ELEVENLABS_API_KEY to .env.local"
    console.error("[Voice]", errorMsg)
    if (onError) onError(new Error(errorMsg))
    throw new Error(errorMsg)
  }

  /**
   * Speak using MiniMax T2A API (voice agent – natural TTS, 300+ voices, 40+ languages)
   * Docs: https://platform.minimax.io/docs/api-reference/speech-t2a-intro
   */
  private async speakWithMiniMax(
    text: string,
    config: MiniMaxConfig,
    onEnd?: () => void,
    onError?: (error: Error) => void,
  ): Promise<void> {
    console.log("[Voice] 🎙️ Using MiniMax voice agent:", config.model, config.voiceId)

    const url = "https://api.minimax.io/v1/t2a_v2"
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: config.model,
        text,
        stream: false,
        output_format: "hex",
        voice_setting: {
          voice_id: config.voiceId,
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
      }),
    })

    const json = await response.json().catch(() => ({}))
    const statusCode = json?.base_resp?.status_code

    if (!response.ok || statusCode !== 0) {
      const msg = json?.base_resp?.status_msg || response.statusText || "Unknown error"
      console.error("[MiniMax] API Error:", response.status, msg)
      throw new Error(`MiniMax API error: ${response.status} - ${msg}`)
    }

    const hexAudio = json?.data?.audio
    if (!hexAudio || typeof hexAudio !== "string") {
      throw new Error("MiniMax returned no audio data")
    }

    const bytes = this.hexToBytes(hexAudio)
    const blob = new Blob([new Uint8Array(bytes)], { type: "audio/mpeg" })
    if (blob.size === 0) throw new Error("MiniMax returned empty audio")

    const audioUrl = URL.createObjectURL(blob)
    const audio = new Audio()
    audio.preload = "auto"

    let hasEnded = false
    let hasErrored = false

    audio.onended = () => {
      if (hasEnded || hasErrored) return
      hasEnded = true
      URL.revokeObjectURL(audioUrl)
      if (this.currentAudio === audio) this.currentAudio = null
      this.isPlayingAudio = false
      if (onEnd) onEnd()
    }

    audio.onerror = () => {
      if (hasErrored) return
      hasErrored = true
      URL.revokeObjectURL(audioUrl)
      if (this.currentAudio === audio) this.currentAudio = null
      this.isPlayingAudio = false
      const msg = (audio.error?.message) || "Playback failed"
      if (onError) onError(new Error(msg))
      else if (onEnd) onEnd()
    }

    this.currentAudio = audio
    audio.src = audioUrl
    await audio.play()
  }

  private hexToBytes(hex: string): Uint8Array {
    const len = hex.length
    const out = new Uint8Array(len >> 1)
    for (let i = 0; i < len; i += 2) {
      out[i >> 1] = parseInt(hex.slice(i, i + 2), 16)
    }
    return out
  }

  /**
   * Speak using ElevenLabs API
   */
  private async speakWithElevenLabs(
    text: string,
    apiKey: string,
    onEnd?: () => void,
    onError?: (error: Error) => void,
  ): Promise<void> {
    console.log("[Voice] 🎙️ Using ElevenLabs Rachel voice (natural, consistent, professional)")

    // Use Rachel voice - most natural, professional, consistent female voice
    const voiceId = "21m00Tcm4TlvDq8ikWAM" // Rachel - natural, warm, professional

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: {
        Accept: "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_turbo_v2_5", // Latest model - most natural and consistent
        voice_settings: {
          stability: 0.65, // Higher stability = more consistent
          similarity_boost: 0.85, // Very high = authentic voice
          style: 0.0, // No extra style = pure, natural voice
          use_speaker_boost: true, // Enhanced clarity
        },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error")
      console.error("[ElevenLabs] API Error:", response.status, errorText)
      throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`)
    }

    // Get audio blob
    const audioBlob = await response.blob()
    console.log("[ElevenLabs] Audio blob received:", audioBlob.size, "bytes, type:", audioBlob.type)

    // Validate audio blob
    if (audioBlob.size === 0) {
      throw new Error("ElevenLabs returned empty audio")
    }

    // Create object URL
    const audioUrl = URL.createObjectURL(audioBlob)
    console.log("[ElevenLabs] Audio URL created:", audioUrl.substring(0, 50) + "...")

    // Create audio element with proper error handling
    const audio = new Audio()
    audio.preload = "auto"

    // Set up event handlers BEFORE setting src
    let hasEnded = false
    let hasErrored = false

    audio.onloadeddata = () => {
      console.log("[ElevenLabs] Audio loaded, duration:", audio.duration, "seconds")
    }

    audio.onended = () => {
      if (hasEnded || hasErrored) return
      hasEnded = true
      URL.revokeObjectURL(audioUrl)
      if (this.currentAudio === audio) {
        this.currentAudio = null
      }
      this.isPlayingAudio = false // Clear flag
      console.log("[ElevenLabs] ✅ Audio finished playing")
      if (onEnd) onEnd()
    }

    audio.onerror = (event: any) => {
      if (hasErrored) return
      hasErrored = true

      const error = event?.target?.error
      const errorDetails = {
        code: error?.code,
        message: error?.message,
        type: event?.type,
        audioSrc: audio.src.substring(0, 50),
      }

      console.error("[ElevenLabs] ❌ Audio playback error:", errorDetails)

      URL.revokeObjectURL(audioUrl)
      if (this.currentAudio === audio) {
        this.currentAudio = null
      }
      this.isPlayingAudio = false // Clear flag

      // Call onError but don't fallback - user wants ElevenLabs only
      if (onError) {
        onError(new Error(`Audio playback failed: ${error?.message || "Unknown error"}`))
      } else if (onEnd) {
        // If no error handler, at least call onEnd to continue conversation
        onEnd()
      }
    }

    // Store reference
    this.currentAudio = audio

    // Set source and play
    audio.src = audioUrl

    try {
      // Try to play
      await audio.play()
      console.log("[ElevenLabs] ✅ Audio playing successfully")
    } catch (playError: any) {
      console.error("[ElevenLabs] ❌ Play failed:", playError.message || playError)
      URL.revokeObjectURL(audioUrl)
      this.currentAudio = null
      this.isPlayingAudio = false // Clear flag

      // Provide helpful error message
      if (playError.name === "NotAllowedError") {
        throw new Error("Browser blocked audio playback. Please interact with the page first.")
      } else if (playError.name === "NotSupportedError") {
        throw new Error("Audio format not supported by browser")
      } else {
        throw new Error(`Failed to play audio: ${playError.message}`)
      }
    }
  }

  /**
   * Speak using browser TTS (fallback)
   */
  private speakWithBrowser(text: string, onEnd?: () => void, onError?: (error: Error) => void): void {
    if (!this.isSupported()) {
      console.warn("[Voice] Speech synthesis not supported in this browser")
      if (onError) {
        onError(new Error("Speech synthesis not supported"))
      }
      return
    }

    try {
      const utterance = new SpeechSynthesisUtterance(text)

      // Select best available voice
      const voices = window.speechSynthesis.getVoices()
      const preferredVoice = voices.find(
        (v) =>
          v.name.includes("Female") ||
          v.name.includes("Samantha") ||
          v.name.includes("Victoria") ||
          v.name.includes("Karen") ||
          v.name.includes("Google US English") ||
          v.name.includes("Microsoft Zira") ||
          v.name.includes("Fiona"),
      )

      if (preferredVoice) {
        utterance.voice = preferredVoice
      }

      // Natural settings
      utterance.rate = 0.95
      utterance.pitch = 1.1
      utterance.volume = 1.0

      utterance.onend = () => {
        this.currentUtterance = null
        if (onEnd) onEnd()
      }

      utterance.onerror = (event) => {
        console.warn("[Voice] Browser TTS error:", event.error)
        this.currentUtterance = null
        if (onEnd) onEnd() // Continue anyway
      }

      this.currentUtterance = utterance
      window.speechSynthesis.speak(utterance)

      console.log("[Voice] 🔊 Using browser TTS (fallback)")
    } catch (error) {
      console.error("[Voice] Browser TTS failed:", error)
      if (onError) {
        onError(error as Error)
      }
    }
  }

  /**
   * Stop any ongoing speech - IMMEDIATELY
   */
  stopSpeaking(): void {
    console.log("[Voice] 🛑 Stopping all audio...")

    // Clear the playing flag
    this.isPlayingAudio = false

    // Stop audio playback (ElevenLabs)
    if (this.currentAudio) {
      try {
        this.currentAudio.pause()
        this.currentAudio.currentTime = 0
        this.currentAudio.src = "" // Clear source to stop download
        this.currentAudio.load() // Force reset
        this.currentAudio = null
        console.log("[Voice] ✅ Audio stopped")
      } catch (error) {
        console.warn("[Voice] Error stopping audio:", error)
        this.currentAudio = null
      }
    }

    // Stop browser TTS
    if (this.isSupported() && window.speechSynthesis.speaking) {
      try {
        window.speechSynthesis.cancel()
        this.currentUtterance = null
        console.log("[Voice] ✅ Browser TTS stopped")
      } catch (error) {
        console.warn("[Voice] Error stopping browser TTS:", error)
      }
    }
  }

  /**
   * Check if currently speaking
   */
  isSpeaking(): boolean {
    return (this.currentAudio && !this.currentAudio.paused) || (this.isSupported() && window.speechSynthesis.speaking)
  }
}

// Singleton instance
let voiceService: SimpleVoiceService | null = null

/**
 * Get or create voice service instance
 */
export function getVoiceService(): SimpleVoiceService {
  if (!voiceService) {
    voiceService = new SimpleVoiceService()

    // Load voices (some browsers need this)
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.getVoices()
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices()
      }
    }
  }

  return voiceService
}
