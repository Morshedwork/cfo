/**
 * Voice Service with ElevenLabs Support
 * Tries ElevenLabs first, falls back to browser TTS
 */

/** Minimal silent WAV to unlock audio on user gesture (browsers block play() until then) */
const SILENT_WAV_BASE64 =
  "UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA="

export class SimpleVoiceService {
  private currentUtterance: SpeechSynthesisUtterance | null = null
  private currentAudio: HTMLAudioElement | null = null
  private audioContext: AudioContext | null = null
  private currentSource: AudioBufferSourceNode | null = null
  private isPlayingAudio = false
  private audioUnlocked = false

  /**
   * Check if browser speech synthesis is supported
   */
  isSupported(): boolean {
    return typeof window !== "undefined" && "speechSynthesis" in window
  }

  /**
   * Unlock audio playback. Must be called from a user gesture (e.g. click on mic).
   * Call this when the user first interacts so later TTS is allowed by the browser.
   */
  async unlockAudio(): Promise<void> {
    if (typeof window === "undefined" || this.audioUnlocked) return
    try {
      // 1) Play silent sound so HTMLAudioElement policy is satisfied
      const silent = new Audio("data:audio/wav;base64," + SILENT_WAV_BASE64)
      await silent.play()
      silent.pause()
      silent.src = ""
      // 2) Create and resume AudioContext so Web Audio API is allowed when we speak later
      const Ctx = window.AudioContext || (window as any).webkitAudioContext
      if (Ctx) {
        const ctx = new Ctx()
        if (ctx.state === "suspended") await ctx.resume()
        this.audioContext = ctx
      }
      this.audioUnlocked = true
      console.log("[Voice] Audio unlocked (user gesture)")
    } catch {
      // Ignore; unlock is best-effort. Next speak() may still prompt user.
    }
  }

  /**
   * Speak text - ONLY ElevenLabs (no fallback)
   */
  async speak(text: string, onEnd?: () => void, onError?: (error: Error) => void): Promise<void> {
    console.log("[Voice] 🎤 New speak request")

    // Check if we need to stop existing audio (need longer delay)
    const wasPlaying = this.isPlayingAudio

    if (wasPlaying) {
      console.log("[Voice] ⚠️ Already playing audio - stopping previous")
    }

    // CRITICAL: Stop ALL audio IMMEDIATELY
    this.stopSpeaking()

    // Mark as playing to prevent race conditions
    this.isPlayingAudio = true

    // Smart delay: longer if we had to stop something, shorter if starting fresh
    if (wasPlaying) {
      await new Promise((resolve) => setTimeout(resolve, 150)) // Need time to stop
    } else {
      await new Promise((resolve) => setTimeout(resolve, 50)) // Quick start
    }

    // Try ElevenLabs first
    const elevenLabsKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY

    // Debug logging
    console.log("[Voice] Checking for ElevenLabs API key...")
    console.log("[Voice] Key found:", !!elevenLabsKey)
    if (elevenLabsKey) {
      console.log("[Voice] Key prefix:", elevenLabsKey.substring(0, 8) + "...")
    } else {
      console.log("[Voice] ❌ No NEXT_PUBLIC_ELEVENLABS_API_KEY found in environment")
      console.log("[Voice] Add it to .env.local and restart server + hard refresh browser")
    }

    if (elevenLabsKey) {
      const preferOgg = typeof navigator !== "undefined" && this.shouldPreferOgg()
      try {
        await this.speakWithElevenLabs(text, elevenLabsKey, onEnd, onError, preferOgg ? "ogg" : "mp3")
        return // Success!
      } catch (error: any) {
        // If format/codec not supported (e.g. Safari + MP3), retry with Ogg/Opus
        const msg = error?.message ?? ""
        if (
          msg.includes("not supported") ||
          msg.includes("Decode error") ||
          msg.includes("format") ||
          msg.includes("decode")
        ) {
          try {
            console.log("[Voice] Retrying with Ogg/Opus for better browser compatibility...")
            await this.speakWithElevenLabs(text, elevenLabsKey, onEnd, onError, "ogg")
            return
          } catch (retryErr) {
            if (onError) onError(retryErr as Error)
            throw retryErr
          }
        }
        console.error("[Voice] ❌ ElevenLabs failed:", error)
        this.isPlayingAudio = false // Clear flag on error
        if (onError) onError(error as Error)
        throw error
      }
    } else {
      // No API key - inform user
      this.isPlayingAudio = false // Clear flag
      const errorMsg = "ElevenLabs API key not configured. Add NEXT_PUBLIC_ELEVENLABS_API_KEY to .env.local"
      console.error("[Voice]", errorMsg)
      if (onError) {
        onError(new Error(errorMsg))
      }
      throw new Error(errorMsg)
    }
  }

  /** Safari and some WebViews often fail to decode MP3 in Web Audio API; prefer Ogg/Opus. */
  private shouldPreferOgg(): boolean {
    const ua = navigator.userAgent
    return (
      (/Safari\//i.test(ua) && !/Chrome/i.test(ua)) ||
      /iPhone|iPad|iPod/i.test(ua) ||
      (/AppleWebKit/i.test(ua) && !/Chrome/i.test(ua))
    )
  }

  /**
   * Speak using ElevenLabs API.
   * format: "mp3" (default) or "ogg" — use "ogg" for Safari/browsers that don't decode MP3 in Web Audio.
   */
  private async speakWithElevenLabs(
    text: string,
    apiKey: string,
    onEnd?: () => void,
    onError?: (error: Error) => void,
    format: "mp3" | "ogg" = "mp3",
  ): Promise<void> {
    console.log("[Voice] 🎙️ Using ElevenLabs Rachel voice (natural, consistent, professional)")

    const voiceId = "21m00Tcm4TlvDq8ikWAM" // Rachel - natural, warm, professional

    const accept = format === "ogg" ? "audio/ogg" : "audio/mpeg"
    const url =
      format === "ogg"
        ? `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=ogg_48000_64`
        : `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Accept: accept,
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
      console.error("[ElevenLabs] API Error:", response.status, errorText)
      throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`)
    }

    const arrayBuffer = await response.arrayBuffer()
    if (arrayBuffer.byteLength === 0) {
      throw new Error("ElevenLabs returned empty audio")
    }
    console.log("[ElevenLabs] Audio received:", arrayBuffer.byteLength, "bytes")

    // Use Web Audio API for reliable playback (decodes MP3 then plays; works where <audio> + blob fails)
    const ctx = this.audioContext ?? new (window.AudioContext || (window as any).webkitAudioContext)()
    if (!this.audioContext) {
      this.audioContext = ctx
    }

    let hasEnded = false
    let hasErrored = false

    const cleanup = () => {
      if (this.currentSource === source) {
        this.currentSource = null
      }
      this.isPlayingAudio = false
    }

    const source = ctx.createBufferSource()
    this.currentSource = source
    source.onended = () => {
      if (hasEnded || hasErrored) return
      hasEnded = true
      cleanup()
      console.log("[ElevenLabs] ✅ Audio finished playing")
      if (onEnd) onEnd()
    }

    try {
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer.slice(0))
      source.buffer = audioBuffer
      source.connect(ctx.destination)
      if (ctx.state === "suspended") {
        await ctx.resume()
      }
      source.start(0)
      console.log("[ElevenLabs] ✅ Audio playing successfully")
    } catch (decodeError: any) {
      hasErrored = true
      cleanup()
      console.error("[ElevenLabs] ❌ Decode/play failed:", decodeError?.message ?? decodeError)
      if (decodeError?.name === "NotAllowedError") {
        throw new Error("Browser blocked audio playback. Please interact with the page first (e.g. click the mic).")
      }
      if (onError) {
        onError(new Error(`Audio playback failed: ${decodeError?.message ?? "Decode error"}`))
      }
      throw new Error(`Audio playback failed: ${decodeError?.message ?? "Decode error"}`)
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

    // Stop Web Audio API playback (ElevenLabs)
    if (this.currentSource) {
      try {
        this.currentSource.stop()
        this.currentSource.disconnect()
        this.currentSource = null
        console.log("[Voice] ✅ Web Audio stopped")
      } catch (error) {
        // stop() throws if already stopped
        this.currentSource = null
      }
    }

    // Legacy: stop HTML audio if ever used
    if (this.currentAudio) {
      try {
        this.currentAudio.pause()
        this.currentAudio.currentTime = 0
        this.currentAudio.src = ""
        this.currentAudio.load()
        this.currentAudio = null
      } catch (error) {
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
    return (
      this.isPlayingAudio ||
      this.currentSource != null ||
      (this.currentAudio != null && !this.currentAudio.paused) ||
      (this.isSupported() && window.speechSynthesis.speaking)
    )
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
