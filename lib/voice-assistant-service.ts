/**
 * Voice Assistant Service
 * Handles speech-to-text and text-to-speech functionality
 */

/** Pause (silence) after speech to treat as "I'm done" — no manual stop needed. */
const SILENCE_AFTER_SPEECH_MS = 1300

export class VoiceAssistantService {
  private recognition: any = null
  private synthesis: typeof window.speechSynthesis | null = null
  private isListening = false
  private silenceTimeoutId: ReturnType<typeof setTimeout> | null = null

  constructor() {
    if (typeof window !== 'undefined') {
      // Initialize Speech Recognition
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition()
        this.recognition.continuous = true
        this.recognition.interimResults = true
        this.recognition.lang = 'en-US'
        this.recognition.maxAlternatives = 3
      }

      // Initialize Speech Synthesis and load voices
      this.synthesis = window.speechSynthesis
      
      // Ensure voices are loaded (some browsers need this)
      if (this.synthesis) {
        // Load voices immediately if available
        this.synthesis.getVoices()
        
        // Also listen for voiceschanged event (needed in some browsers)
        if ('onvoiceschanged' in this.synthesis) {
          this.synthesis.onvoiceschanged = () => {
            console.log('[Voice] Voices loaded:', this.synthesis?.getVoices().length)
          }
        }
      }
    }
  }

  /**
   * Check if browser supports speech recognition
   */
  isSupported(): boolean {
    const supported = this.recognition !== null && this.synthesis !== null
    if (!supported) {
      console.warn('[Voice] Browser does not support speech features')
      console.log('[Voice] Recognition:', !!this.recognition, 'Synthesis:', !!this.synthesis)
    }
    return supported
  }

  /**
   * Start listening for voice input.
   * Uses continuous mode and accumulates all final segments so multi-sentence or longer utterances are captured in one result.
   * @param onResult - called with final transcript when user stops speaking (may be multiple sentences, accumulated)
   * @param onError - called on recognition error
   * @param onInterimResult - optional; called with live transcript while user is still speaking (real-time)
   */
  startListening(
    onResult: (transcript: string) => void,
    onError?: (error: string) => void,
    onInterimResult?: (transcript: string) => void
  ): void {
    if (!this.recognition) {
      onError?.('Speech recognition not supported in this browser')
      return
    }

    if (this.isListening) {
      console.log('[Voice] Already listening')
      return
    }

    this.recognition.continuous = true
    this.recognition.interimResults = true
    this.recognition.maxAlternatives = 3

    const accumulated: string[] = []
    const MIN_CONFIDENCE = 0.4

    const clearSilenceTimer = () => {
      if (this.silenceTimeoutId != null) {
        clearTimeout(this.silenceTimeoutId)
        this.silenceTimeoutId = null
      }
    }

    // After user has spoken, a short pause = "I'm done" — we stop and process automatically (no button).
    const scheduleSilenceEnd = () => {
      clearSilenceTimer()
      this.silenceTimeoutId = setTimeout(() => {
        this.silenceTimeoutId = null
        if (this.recognition && this.isListening) {
          console.log('[Voice] Silence after speech — ending turn automatically')
          this.recognition.stop()
        }
      }, SILENCE_AFTER_SPEECH_MS)
    }

    this.recognition.onresult = (event: any) => {
      const results = event.results
      for (let i = 0; i < results.length; i++) {
        const item = results[i]
        const isFinal = item.isFinal
        type Alt = { transcript: string; confidence?: number }
        const alternatives: Alt[] = Array.from(item as Iterable<Alt>)
        const best: Alt | undefined = alternatives[0]
          ? alternatives.reduce((a, b) => (b.confidence ?? 1) >= (a.confidence ?? 1) ? b : a)
          : undefined
        const transcript = (best?.transcript ?? '').trim()
        const confidence = best?.confidence

        if (isFinal && transcript) {
          const accept = confidence == null || confidence >= MIN_CONFIDENCE
          if (accept) {
            // Dedupe: avoid same phrase repeated (browser often re-sends same segment)
            const last = accumulated[accumulated.length - 1]
            const isDuplicate = last != null && (
              last === transcript ||
              last.toLowerCase() === transcript.toLowerCase() ||
              (transcript.length <= 20 && last.toLowerCase().includes(transcript.toLowerCase()))
            )
            if (!isDuplicate) {
              accumulated.push(transcript)
              console.log('[Voice] Segment:', transcript, 'Confidence:', confidence)
              // User said something; pause after this = end of turn (auto, no button)
              scheduleSilenceEnd()
            }
          } else {
            console.warn('[Voice] Low confidence segment ignored:', transcript, confidence)
          }
        } else if (!isFinal && onInterimResult) {
          const interimFull = accumulated.length > 0
            ? accumulated.join(' ') + ' ' + transcript
            : transcript
          onInterimResult(interimFull)
        }
      }
    }

    this.recognition.onerror = (event: any) => {
      clearSilenceTimer()
      const errorType = event.error || 'unknown'
      console.warn('[Voice] Recognition issue:', errorType)
      if (errorType !== 'no-speech' && errorType !== 'aborted') {
        console.error('[Voice] Recognition error:', errorType)
      }
      onError?.(errorType)
      this.isListening = false
    }

    this.recognition.onend = () => {
      clearSilenceTimer()
      this.isListening = false
      const fullTranscript = accumulated.join(' ').replace(/\s+/g, ' ').trim()
      if (fullTranscript) {
        console.log('[Voice] Final accumulated:', fullTranscript)
        onResult(fullTranscript)
      }
    }

    try {
      this.recognition.start()
      this.isListening = true
      console.log('[Voice] Started listening (continuous, depth mode)')
    } catch (error) {
      console.error('[Voice] Failed to start:', error)
      onError?.('Failed to start voice recognition')
      this.isListening = false
    }
  }

  /**
   * Stop listening for voice input (e.g. user said "stop" or clicked Stop to cancel)
   */
  stopListening(): void {
    if (this.silenceTimeoutId != null) {
      clearTimeout(this.silenceTimeoutId)
      this.silenceTimeoutId = null
    }
    if (this.recognition && this.isListening) {
      this.recognition.stop()
      this.isListening = false
      console.log('[Voice] Stopped listening')
    }
  }

  /**
   * Get best available female voice
   */
  private getBestFemaleVoice(): SpeechSynthesisVoice | null {
    if (!this.synthesis) return null

    const voices = this.synthesis.getVoices()
    
    // Priority list of high-quality female voices
    const preferredVoices = [
      'Google US English Female',
      'Microsoft Zira - English (United States)',
      'Samantha',
      'Karen',
      'Victoria',
      'Fiona',
      'Moira',
      'Tessa',
      'Google UK English Female',
      'Microsoft Hazel - English (Great Britain)',
    ]

    // Try to find exact match
    for (const preferred of preferredVoices) {
      const voice = voices.find(v => v.name === preferred)
      if (voice) {
        console.log('[Voice] Using preferred voice:', voice.name)
        return voice
      }
    }

    // Fallback: find any female voice
    const femaleVoice = voices.find(voice => 
      voice.name.toLowerCase().includes('female') ||
      voice.name.toLowerCase().includes('woman') ||
      ['samantha', 'karen', 'victoria', 'fiona', 'moira', 'tessa', 'zira', 'hazel']
        .some(name => voice.name.toLowerCase().includes(name))
    )

    if (femaleVoice) {
      console.log('[Voice] Using female voice:', femaleVoice.name)
      return femaleVoice
    }

    // Last resort: use any available voice
    console.log('[Voice] Using default voice')
    return voices[0] || null
  }

  /**
   * Speak text using text-to-speech with enhanced female voice
   */
  speak(text: string, onEnd?: () => void): void {
    if (!this.synthesis) {
      console.warn('[Voice] Speech synthesis not supported')
      onEnd?.()
      return
    }

    // Cancel any ongoing speech safely
    try {
      this.synthesis.cancel()
    } catch (error) {
      console.warn('[Voice] Error canceling previous speech:', error)
    }

    // Small delay to ensure cancel completes
    setTimeout(() => {
      const synthesis = this.synthesis
      if (!synthesis) {
        onEnd?.()
        return
      }

      const utterance = new SpeechSynthesisUtterance(text)
      
      // Enhanced voice settings for more natural, pleasant female voice
      utterance.lang = 'en-US'
      utterance.rate = 0.95      // Slightly slower for clarity and elegance
      utterance.pitch = 1.15     // Higher pitch for feminine voice
      utterance.volume = 1.0     // Full volume

      // Set the best female voice
      const femaleVoice = this.getBestFemaleVoice()
      if (femaleVoice) {
        utterance.voice = femaleVoice
      }

      utterance.onend = () => {
        console.log('[Voice] Finished speaking')
        onEnd?.()
      }

      utterance.onerror = (event: any) => {
        // Speech synthesis errors are often not critical and can be ignored
        // Common errors: interrupted, canceled, or network issues
        console.warn('[Voice] Speech synthesis issue:', event.error || event.type || 'unknown')
        
        // Don't treat errors as fatal - just call onEnd to continue
        onEnd?.()
      }

      utterance.onstart = () => {
        console.log('[Voice] Started speaking')
      }

      console.log('[Voice] Speaking with voice:', utterance.voice?.name || 'default')
      console.log('[Voice] Text preview:', text.substring(0, 50) + '...')
      
      try {
        synthesis.speak(utterance)
      } catch (error) {
        console.warn('[Voice] Failed to speak:', error)
        onEnd?.()
      }
    }, 100)
  }

  /**
   * Stop speaking
   */
  stopSpeaking(): void {
    if (this.synthesis) {
      try {
        this.synthesis.cancel()
        console.log('[Voice] Stopped speaking')
      } catch (error) {
        console.warn('[Voice] Error stopping speech:', error)
      }
    }
  }

  /**
   * Check if currently speaking
   */
  isSpeaking(): boolean {
    return this.synthesis?.speaking || false
  }

  /**
   * Check if currently listening
   */
  getIsListening(): boolean {
    return this.isListening
  }

  /**
   * Get available voices for debugging
   */
  getAvailableVoices(): string[] {
    if (!this.synthesis) return []
    return this.synthesis.getVoices().map(v => v.name)
  }
}

// Singleton instance
let voiceService: VoiceAssistantService | null = null

export function getVoiceService(): VoiceAssistantService {
  if (typeof window === 'undefined') {
    // Return a dummy service on server - create a minimal instance
    const dummyService = new VoiceAssistantService()
    return dummyService
  }

  if (!voiceService) {
    voiceService = new VoiceAssistantService()
  }
  return voiceService
}
