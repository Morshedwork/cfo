# 🚨 URGENT: Set Up Your Environment Variables

## ❌ The Problem

You're seeing:
```
This site can't be reached: placeholder.supabase.co
DNS_PROBE_FINISHED_NXDOMAIN
```

This means **you haven't created your `.env.local` file yet!**

The app is trying to use placeholder values instead of your real Supabase credentials.

---

## ✅ The Solution (2 Minutes)

### Step 1: Get Your Supabase Credentials

1. **Go to Supabase Dashboard:**
   - Visit: https://supabase.com/dashboard

2. **Select your project** (or create one if you haven't)

3. **Get your credentials:**
   - Click **Settings** (⚙️ in left sidebar)
   - Click **API**
   - You'll see two important values:

   **Copy these:**
   - **Project URL** (looks like: `https://abcdefghijklm.supabase.co`)
   - **anon/public key** (looks like: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

---

### Step 2: Create `.env.local` File

**In your project root folder** (where `package.json` is), create a new file named **`.env.local`**

**On Windows PowerShell:**
```powershell
New-Item .env.local -ItemType File
```

**Or just:** Right-click in your project folder → New → Text Document → Rename to `.env.local`

---

### Step 3: Add Your Credentials

Open `.env.local` and paste this:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR-ANON-KEY-HERE
```

**Replace:**
- `YOUR-PROJECT-REF` with your actual project URL from Step 1
- `YOUR-ANON-KEY-HERE` with your actual anon key from Step 1

**Example:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG0iLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzMTIzNDU2NywiZXhwIjoxOTQ2ODEwNTY3fQ.xyz123abc456
```

---

### Step 4: Restart Your Dev Server

**Stop the server** (Ctrl+C in terminal)

**Start it again:**
```powershell
pnpm dev
```

---

### Step 5: Test Again

Visit: http://localhost:3000/auth/login

The error should be gone! ✅

---

## 📋 Quick Checklist

- [ ] Went to https://supabase.com/dashboard
- [ ] Selected my project (or created one)
- [ ] Copied Project URL from Settings > API
- [ ] Copied anon/public key from Settings > API
- [ ] Created `.env.local` file in project root
- [ ] Pasted both values into `.env.local`
- [ ] Saved the file
- [ ] Restarted dev server (`pnpm dev`)
- [ ] Tested the app

---

## 🎯 Where to Find Your Supabase Credentials

**Visual Guide:**

1. **Supabase Dashboard** → https://supabase.com/dashboard
2. Click your project name
3. Left sidebar → **Settings** (⚙️)
4. Click **API**
5. Look for:

```
Configuration
─────────────────────────────────────

Project URL
┌─────────────────────────────────────┐
│ https://abcdefg.supabase.co         │ ← COPY THIS
└─────────────────────────────────────┘

Project API keys
┌─────────────────────────────────────┐
│ anon / public                        │
│ eyJhbGciOiJIUzI1NiIsInR5cCI...      │ ← COPY THIS
└─────────────────────────────────────┘
```

---

## 🔒 Security Note

**⚠️ Important:** 
- `.env.local` is already in `.gitignore` (won't be committed to Git)
- Never share your environment variables publicly
- The `anon` key is safe for client-side use

---

## 🐛 Still Having Issues?

### Error: Can't find `.env.local`
**Solution:** Make sure the file is in the **root folder** (same level as `package.json`)

### Error: Still seeing `placeholder.supabase.co`
**Solution:** 
1. Make sure you saved the `.env.local` file
2. Restart the dev server (Ctrl+C, then `pnpm dev`)
3. Clear browser cache or try incognito mode

### Error: Invalid API key
**Solution:** Double-check you copied the full anon key (it's very long!)

---

## ❓ Don't Have a Supabase Project Yet?

If you haven't created a Supabase project:

1. **Go to:** https://supabase.com/
2. Click **"Start your project"**
3. Sign in with GitHub (or create account)
4. Click **"New project"**
5. Fill in:
   - **Name:** AI CFO App
   - **Database Password:** (create a strong password)
   - **Region:** (choose closest to you)
6. Click **"Create new project"**
7. Wait 2-3 minutes for project to be ready
8. Then follow steps above to get your credentials

---

## ✅ After This Works

Once you have your `.env.local` set up and the app is connecting:

**Next steps:**
1. Set up Google OAuth (follow `GOOGLE_AUTH_CHECKLIST.md`)
2. Run database migrations (if needed)
3. Test authentication

---

**This is the FIRST step before anything else will work!** 🚀

