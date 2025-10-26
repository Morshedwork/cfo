/**
 * Voice Assistant Service
 * Handles speech-to-text and text-to-speech functionality
 */

export class VoiceAssistantService {
  private recognition: any = null
  private synthesis: typeof window.speechSynthesis | null = null
  private isListening = false

  constructor() {
    if (typeof window !== 'undefined') {
      // Initialize Speech Recognition
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition()
        this.recognition.continuous = false
        this.recognition.interimResults = false
        this.recognition.lang = 'en-US'
        this.recognition.maxAlternatives = 1
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
   * Start listening for voice input
   */
  startListening(
    onResult: (transcript: string) => void,
    onError?: (error: string) => void
  ): void {
    if (!this.recognition) {
      onError?.('Speech recognition not supported in this browser')
      return
    }

    if (this.isListening) {
      console.log('[Voice] Already listening')
      return
    }

    this.recognition.onresult = (event: any) => {
      // Get the transcript with improved accuracy
      const result = event.results[0]
      const transcript = result[0].transcript
      const confidence = result[0].confidence
      
      console.log('[Voice] Recognized:', transcript, 'Confidence:', confidence)
      
      // Only accept high-confidence results for better accuracy
      if (confidence > 0.5 || !confidence) {
        onResult(transcript)
      } else {
        console.warn('[Voice] Low confidence result, ignoring')
        onError?.('low-confidence')
      }
      
      this.isListening = false
    }

    this.recognition.onerror = (event: any) => {
      const errorType = event.error || 'unknown'
      console.warn('[Voice] Recognition issue:', errorType)
      
      // Only report as error if it's not a common/expected error
      if (errorType !== 'no-speech' && errorType !== 'aborted') {
        console.error('[Voice] Recognition error:', errorType)
      }
      
      onError?.(errorType)
      this.isListening = false
    }

    this.recognition.onend = () => {
      this.isListening = false
    }

    try {
      this.recognition.start()
      this.isListening = true
      console.log('[Voice] Started listening')
    } catch (error) {
      console.error('[Voice] Failed to start:', error)
      onError?.('Failed to start voice recognition')
      this.isListening = false
    }
  }

  /**
   * Stop listening for voice input
   */
  stopListening(): void {
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

