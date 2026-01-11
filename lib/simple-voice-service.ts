/**
 * Voice Service with ElevenLabs Support
 * Tries ElevenLabs first, falls back to browser TTS
 */

export class SimpleVoiceService {
  private currentUtterance: SpeechSynthesisUtterance | null = null
  private currentAudio: HTMLAudioElement | null = null
  private isPlayingAudio: boolean = false

  /**
   * Check if browser speech synthesis is supported
   */
  isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window
  }

  /**
   * Speak text - ONLY ElevenLabs (no fallback)
   */
  async speak(text: string, onEnd?: () => void, onError?: (error: Error) => void): Promise<void> {
    console.log('[Voice] 🎤 New speak request')
    
    // Check if we need to stop existing audio (need longer delay)
    const wasPlaying = this.isPlayingAudio
    
    if (wasPlaying) {
      console.log('[Voice] ⚠️ Already playing audio - stopping previous')
    }
    
    // CRITICAL: Stop ALL audio IMMEDIATELY
    this.stopSpeaking()
    
    // Mark as playing to prevent race conditions
    this.isPlayingAudio = true
    
    // Smart delay: longer if we had to stop something, shorter if starting fresh
    if (wasPlaying) {
      await new Promise(resolve => setTimeout(resolve, 150)) // Need time to stop
    } else {
      await new Promise(resolve => setTimeout(resolve, 50)) // Quick start
    }

    // Try ElevenLabs first
    const elevenLabsKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY
    
    // Debug logging
    console.log('[Voice] Checking for ElevenLabs API key...')
    console.log('[Voice] Key found:', !!elevenLabsKey)
    if (elevenLabsKey) {
      console.log('[Voice] Key prefix:', elevenLabsKey.substring(0, 8) + '...')
    } else {
      console.log('[Voice] ❌ No NEXT_PUBLIC_ELEVENLABS_API_KEY found in environment')
      console.log('[Voice] Add it to .env.local and restart server + hard refresh browser')
    }
    
    if (elevenLabsKey) {
      try {
        await this.speakWithElevenLabs(text, elevenLabsKey, onEnd, onError)
        return // Success!
      } catch (error) {
        console.error('[Voice] ❌ ElevenLabs failed:', error)
        this.isPlayingAudio = false // Clear flag on error
        // Don't fallback - user wants ElevenLabs only
        if (onError) {
          onError(error as Error)
        }
        throw error
      }
    } else {
      // No API key - inform user
      this.isPlayingAudio = false // Clear flag
      const errorMsg = 'ElevenLabs API key not configured. Add NEXT_PUBLIC_ELEVENLABS_API_KEY to .env.local'
      console.error('[Voice]', errorMsg)
      if (onError) {
        onError(new Error(errorMsg))
      }
      throw new Error(errorMsg)
    }
  }

  /**
   * Speak using ElevenLabs API
   */
  private async speakWithElevenLabs(
    text: string, 
    apiKey: string, 
    onEnd?: () => void, 
    onError?: (error: Error) => void
  ): Promise<void> {
    console.log('[Voice] 🎙️ Using ElevenLabs Rachel voice (natural, consistent, professional)')

    // Use Rachel voice - most natural, professional, consistent female voice
    const voiceId = '21m00Tcm4TlvDq8ikWAM' // Rachel - natural, warm, professional
    
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_turbo_v2_5', // Latest model - most natural and consistent
        voice_settings: {
          stability: 0.65,           // Higher stability = more consistent
          similarity_boost: 0.85,    // Very high = authentic voice
          style: 0.0,                // No extra style = pure, natural voice
          use_speaker_boost: true,   // Enhanced clarity
        },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      console.error('[ElevenLabs] API Error:', response.status, errorText)
      throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`)
    }

    // Get audio blob
    const audioBlob = await response.blob()
    console.log('[ElevenLabs] Audio blob received:', audioBlob.size, 'bytes, type:', audioBlob.type)
    
    // Validate audio blob
    if (audioBlob.size === 0) {
      throw new Error('ElevenLabs returned empty audio')
    }

    // Create object URL
    const audioUrl = URL.createObjectURL(audioBlob)
    console.log('[ElevenLabs] Audio URL created:', audioUrl.substring(0, 50) + '...')
    
    // Create audio element with proper error handling
    const audio = new Audio()
    audio.preload = 'auto'
    
    // Set up event handlers BEFORE setting src
    let hasEnded = false
    let hasErrored = false
    
    audio.onloadeddata = () => {
      console.log('[ElevenLabs] Audio loaded, duration:', audio.duration, 'seconds')
    }
    
    audio.onended = () => {
      if (hasEnded || hasErrored) return
      hasEnded = true
      URL.revokeObjectURL(audioUrl)
      if (this.currentAudio === audio) {
        this.currentAudio = null
      }
      this.isPlayingAudio = false // Clear flag
      console.log('[ElevenLabs] ✅ Audio finished playing')
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
        audioSrc: audio.src.substring(0, 50)
      }
      
      console.error('[ElevenLabs] ❌ Audio playback error:', errorDetails)
      
      URL.revokeObjectURL(audioUrl)
      if (this.currentAudio === audio) {
        this.currentAudio = null
      }
      this.isPlayingAudio = false // Clear flag
      
      // Call onError but don't fallback - user wants ElevenLabs only
      if (onError) {
        onError(new Error(`Audio playback failed: ${error?.message || 'Unknown error'}`))
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
      console.log('[ElevenLabs] ✅ Audio playing successfully')
    } catch (playError: any) {
      console.error('[ElevenLabs] ❌ Play failed:', playError.message || playError)
      URL.revokeObjectURL(audioUrl)
      this.currentAudio = null
      this.isPlayingAudio = false // Clear flag
      
      // Provide helpful error message
      if (playError.name === 'NotAllowedError') {
        throw new Error('Browser blocked audio playback. Please interact with the page first.')
      } else if (playError.name === 'NotSupportedError') {
        throw new Error('Audio format not supported by browser')
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
      console.warn('[Voice] Speech synthesis not supported in this browser')
      if (onError) {
        onError(new Error('Speech synthesis not supported'))
      }
      return
    }

    try {
      const utterance = new SpeechSynthesisUtterance(text)
      
      // Select best available voice
      const voices = window.speechSynthesis.getVoices()
      const preferredVoice = voices.find(v => 
        v.name.includes('Female') || 
        v.name.includes('Samantha') ||
        v.name.includes('Victoria') ||
        v.name.includes('Karen') ||
        v.name.includes('Google US English') ||
        v.name.includes('Microsoft Zira') ||
        v.name.includes('Fiona')
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
        console.warn('[Voice] Browser TTS error:', event.error)
        this.currentUtterance = null
        if (onEnd) onEnd() // Continue anyway
      }
      
      this.currentUtterance = utterance
      window.speechSynthesis.speak(utterance)
      
      console.log('[Voice] 🔊 Using browser TTS (fallback)')
    } catch (error) {
      console.error('[Voice] Browser TTS failed:', error)
      if (onError) {
        onError(error as Error)
      }
    }
  }

  /**
   * Stop any ongoing speech - IMMEDIATELY
   */
  stopSpeaking(): void {
    console.log('[Voice] 🛑 Stopping all audio...')
    
    // Clear the playing flag
    this.isPlayingAudio = false
    
    // Stop audio playback (ElevenLabs)
    if (this.currentAudio) {
      try {
        this.currentAudio.pause()
        this.currentAudio.currentTime = 0
        this.currentAudio.src = '' // Clear source to stop download
        this.currentAudio.load() // Force reset
        this.currentAudio = null
        console.log('[Voice] ✅ Audio stopped')
      } catch (error) {
        console.warn('[Voice] Error stopping audio:', error)
        this.currentAudio = null
      }
    }

    // Stop browser TTS
    if (this.isSupported() && window.speechSynthesis.speaking) {
      try {
        window.speechSynthesis.cancel()
        this.currentUtterance = null
        console.log('[Voice] ✅ Browser TTS stopped')
      } catch (error) {
        console.warn('[Voice] Error stopping browser TTS:', error)
      }
    }
  }

  /**
   * Check if currently speaking
   */
  isSpeaking(): boolean {
    return (
      (this.currentAudio && !this.currentAudio.paused) ||
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
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.getVoices()
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices()
      }
    }
  }
  
  return voiceService
}
