# Voice Setup - ElevenLabs (Optional) 🎙️

## How It Works

Your voice assistant now automatically uses:
1. **ElevenLabs** (if API key is set) - Natural, human-like voice ✨
2. **Browser TTS** (fallback) - Built-in browser voice 🔊

No configuration needed! It just works.

---

## Option 1: Use Browser Voice (FREE, No Setup)

**Nothing to do!** Just use the Voice Assistant page and it will work with your browser's built-in voice.

✅ Free
✅ No API keys needed
✅ Works immediately

---

## Option 2: Add ElevenLabs for Natural Voice (Recommended)

### Quick Setup (2 Minutes)

**1. Get ElevenLabs API Key**
- Go to: https://elevenlabs.io/
- Sign up (FREE tier: 10,000 characters/month)
- Go to **Profile → API Keys**
- Click **Create** and copy your key

**2. Add to `.env.local`**

Add this line to your `.env.local` file in the project root:

\`\`\`env
NEXT_PUBLIC_ELEVENLABS_API_KEY=sk_your_key_here
\`\`\`

**3. Restart Server**

\`\`\`bash
# Stop server (Ctrl+C)
# Start again
npx --yes next@15.2.4 dev
\`\`\`

**4. Hard Refresh Browser**

Press `Ctrl+Shift+R` to clear cache

**That's it!** Now your voice will sound natural and human-like! 🎉

---

## Testing

Open Voice Assistant page and click the mic. Check browser console (F12):

**✅ ElevenLabs Working:**
\`\`\`
[Voice] 🎙️ Using ElevenLabs Rachel voice (natural)
[Voice] ✅ ElevenLabs playing
\`\`\`

**🔊 Browser Fallback:**
\`\`\`
[Voice] 🔊 Using browser TTS (fallback)
\`\`\`

---

## Troubleshooting

### Still hearing robotic voice?

1. Check `.env.local` has `NEXT_PUBLIC_ELEVENLABS_API_KEY=sk_...`
2. Restart server
3. Hard refresh browser (`Ctrl+Shift+R`)
4. Check browser console (F12) for errors

### API key not working?

1. Get a **NEW** key from: https://elevenlabs.io/app/settings/api-keys
2. Make sure key starts with `sk_`
3. No spaces or quotes in `.env.local`
4. Make sure you have free credits left

### Voice cuts off or errors?

- Check internet connection (ElevenLabs streams from cloud)
- Check you haven't exceeded free tier (10,000 chars/month)
- System will automatically fall back to browser voice if ElevenLabs fails

---

## What You Get

**With ElevenLabs:**
- 🎙️ Natural, human-like voice (Bella - young, friendly female)
- 💫 Realistic pauses and rhythm
- ✨ Sounds like a real person
- 🌟 Conversational, warm tone

**Browser Fallback:**
- 🔊 Basic computer voice
- ✅ Works offline
- 💰 Free forever
- 📱 Works on all devices

---

## Want a Different Voice?

All these voices are **FREE** on ElevenLabs! Edit `lib/simple-voice-service.ts` line 51:

**Current (Bella - young, friendly girl):**
\`\`\`typescript
const voiceId = 'EXAVITQu4vr4xnSDxMaL' // Bella
\`\`\`

**Other FREE options:**
\`\`\`typescript
// Rachel - Mature, warm, professional female
const voiceId = '21m00Tcm4TlvDq8ikWAM'

// Elli - Young, energetic, upbeat female  
const voiceId = 'MF3mGyEYCl7XYWbV9V6O'

// Charlotte - Smooth, clear, professional female
const voiceId = 'XB0fDUnXU5powFXDhCwa'

// Dorothy - Calm, mature, pleasant female
const voiceId = 'ThT5KcBeYPX3keUQqHPh'
\`\`\`

Just change the voice ID and refresh your browser!

---

## Cost

**FREE Tier:**
- 10,000 characters/month
- ~1,000 voice responses
- Perfect for testing and light use

**If you need more:**
- Starter: $5/month (30,000 chars)
- Creator: $22/month (100,000 chars)

---

## Summary

✅ **No setup needed** - browser voice works immediately
✅ **Optional ElevenLabs** - just add API key for natural voice
✅ **Auto fallback** - uses browser voice if ElevenLabs fails
✅ **Simple** - one file, no complex setup
✅ **Free tier available** - 10,000 chars/month

Just add your API key to `.env.local` and enjoy natural voice! 🎯
