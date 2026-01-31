# ✅ Google OAuth Setup Checklist

Use this checklist to ensure you complete all required steps.

---

## 📋 Pre-Setup

- [ ] I have a Google account
- [ ] I have access to Google Cloud Console
- [ ] I have access to my Supabase dashboard
- [ ] I know my Supabase project URL

---

## 🔑 Google Cloud Console Setup

- [ ] **Go to:** https://console.cloud.google.com/
- [ ] **Select or create project:** "ai-cfo-2e92d"
- [ ] **Enable Google+ API:**
  - [ ] Go to "APIs & Services" > "Library"
  - [ ] Search for "Google+ API"
  - [ ] Click "Enable"
- [ ] **Create OAuth Client:**
  - [ ] Go to "APIs & Services" > "Credentials"
  - [ ] Click "Create Credentials" > "OAuth client ID"
  - [ ] Choose "Web application"
  - [ ] Name: "AI CFO App"
- [ ] **Add Redirect URIs:**
  - [ ] Add: `http://localhost:3000/auth/callback`
  - [ ] Add: `https://[your-project-ref].supabase.co/auth/v1/callback`
- [ ] **Copy credentials:**
  - [ ] Copy Client ID to clipboard
  - [ ] Copy Client Secret to clipboard

---

## 🗄️ Supabase Dashboard Setup

- [ ] **Go to:** https://supabase.com/dashboard
- [ ] **Select your project**
- [ ] **Enable Google Provider:**
  - [ ] Go to "Authentication" > "Providers"
  - [ ] Find "Google" in the list
  - [ ] Toggle to "Enabled"
  - [ ] Paste Client ID
  - [ ] Paste Client Secret
  - [ ] Click "Save"

---

## 💻 Local Environment Setup

- [ ] **Get Supabase credentials:**
  - [ ] Go to Settings > API in Supabase dashboard
  - [ ] Copy "Project URL"
  - [ ] Copy "Anon/Public key"
- [ ] **Create environment file:**
  - [ ] Copy `.env.local.template` to `.env.local`
  - [ ] Or create new `.env.local` file
- [ ] **Add to `.env.local`:**
  \`\`\`env
  NEXT_PUBLIC_SUPABASE_URL=https://[your-project-ref].supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
  \`\`\`
  - [ ] Replace `[your-project-ref]` with your actual project reference
  - [ ] Replace `[your-anon-key]` with your actual anon key

---

## 🧪 Testing

- [ ] **Start development server:**
  \`\`\`powershell
  pnpm dev
  \`\`\`
- [ ] **Test Login Page:**
  - [ ] Go to http://localhost:3000/auth/login
  - [ ] See "Continue with Google" button
  - [ ] Click the button
  - [ ] Redirected to Google sign-in page
  - [ ] Sign in with Google account
  - [ ] Redirected back to app
  - [ ] Landed on dashboard page
- [ ] **Verify in Supabase:**
  - [ ] Go to Supabase Dashboard
  - [ ] Click "Authentication" > "Users"
  - [ ] See your Google account in the list
- [ ] **Test Sign-Up Page:**
  - [ ] Go to http://localhost:3000/auth/sign-up
  - [ ] See "Continue with Google" button
  - [ ] Click and verify it works
- [ ] **Test Sign-Out:**
  - [ ] Click sign out in the app
  - [ ] Verify you're logged out
  - [ ] Try signing in again with Google

---

## 🚀 Production Deployment (Optional - for later)

- [ ] **Deploy to Vercel/Production**
- [ ] **Update Google Cloud Console:**
  - [ ] Add production redirect URI:
    \`\`\`
    https://your-domain.com/auth/callback
    \`\`\`
- [ ] **Update Vercel/Hosting Environment Variables:**
  - [ ] Add `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] Add `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] **Test on production:**
  - [ ] Visit your production site
  - [ ] Test Google sign-in
  - [ ] Verify everything works

---

## 🐛 If Something Goes Wrong

### Error: redirect_uri_mismatch
- [ ] Check redirect URIs in Google Cloud Console
- [ ] Make sure they match exactly:
  - `http://localhost:3000/auth/callback` (for local)
  - `https://[project-ref].supabase.co/auth/v1/callback`

### Error: Invalid client
- [ ] Double-check Client ID in Supabase
- [ ] Double-check Client Secret in Supabase
- [ ] Make sure there are no extra spaces

### Error: 403 or API not enabled
- [ ] Go to Google Cloud Console
- [ ] Enable Google+ API

### Users can't sign in
- [ ] Check Supabase logs: Authentication > Logs
- [ ] Check browser console (F12)
- [ ] Verify Google provider is "Enabled" in Supabase

---

## ✨ Success!

If all items are checked and tests pass:
- ✅ Google OAuth is fully set up
- ✅ Users can sign in with Google
- ✅ Users can sign up with Google
- ✅ Sessions are managed properly

---

**Questions?** Check `GOOGLE_AUTH_QUICKSTART.md` for detailed explanations!
