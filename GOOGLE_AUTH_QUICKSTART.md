# 🚀 Google OAuth Quick Start Guide

## ✅ What I've Set Up For You

I've successfully integrated Google OAuth authentication into your CFO app. Here's what's been added:

### 📁 New Files Created:
1. **`app/auth/callback/page.tsx`** - Handles OAuth redirects from Google
2. **`GOOGLE_OAUTH_SETUP.md`** - Detailed setup instructions
3. **`.env.local.template`** - Environment variables template

### 🔄 Updated Files:
1. **`app/auth/login/page.tsx`** - Added "Continue with Google" button
2. **`app/auth/sign-up/page.tsx`** - Added "Continue with Google" button

### 📦 Installed Packages:
- `react-icons` - For the Google icon

---

## 🎯 What You Need To Do

### Step 1: Get Your Google OAuth Credentials

1. **Go to Google Cloud Console:**
   - Visit: https://console.cloud.google.com/
   - Select your project "ai-cfo-2e92d" (or create a new one)

2. **Enable Google+ API:**
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API"
   - Click "Enable"

3. **Create OAuth Credentials:**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application"
   - Name it: "AI CFO App"

4. **Add Authorized Redirect URIs:**
   \`\`\`
   http://localhost:3000/auth/callback
   https://your-project-ref.supabase.co/auth/v1/callback
   \`\`\`
   ⚠️ Replace `your-project-ref` with your actual Supabase project reference

5. **Save Your Credentials:**
   - Copy the **Client ID**
   - Copy the **Client Secret**

---

### Step 2: Set Up Supabase

1. **Go to Supabase Dashboard:**
   - Visit: https://supabase.com/dashboard
   - Select your project

2. **Configure Google Provider:**
   - Go to "Authentication" > "Providers"
   - Find "Google" in the list
   - Toggle it to "Enabled"
   - Paste your **Client ID**
   - Paste your **Client Secret**
   - Click "Save"

---

### Step 3: Create Your Environment File

1. **Copy the template:**
   \`\`\`powershell
   # On Windows PowerShell:
   Copy-Item .env.local.template .env.local
   \`\`\`

2. **Edit `.env.local`** with your Supabase credentials:
   \`\`\`env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   \`\`\`

   **Where to find these:**
   - Supabase Dashboard > Settings > API
   - Copy "Project URL" and "Anon/Public key"

---

### Step 4: Test Your Setup

1. **Start the development server:**
   \`\`\`powershell
   pnpm dev
   \`\`\`

2. **Test Google Sign-In:**
   - Go to http://localhost:3000/auth/login
   - Click "Continue with Google"
   - Sign in with your Google account
   - You should be redirected to the dashboard

3. **Verify User Creation:**
   - Go to Supabase Dashboard > Authentication > Users
   - Your Google account should appear

---

## 🎨 What The User Sees

### Login Page
- Beautiful "Continue with Google" button with Google logo
- Clean "Or continue with email" divider
- Traditional email/password form below

### Sign-Up Page
- Same Google OAuth button
- Company name field
- Email and password fields

---

## 🔒 Security Notes

### Important:
- ✅ `.env.local` is automatically gitignored (your secrets are safe)
- ✅ Never commit sensitive credentials to Git
- ✅ Use environment variables for all API keys

### For Production:
When deploying to Vercel/production:
1. Add environment variables in your hosting platform
2. Update Google Cloud Console redirect URIs to include your production domain:
   \`\`\`
   https://your-domain.com/auth/callback
   \`\`\`

---

## 🐛 Troubleshooting

### Error: "redirect_uri_mismatch"
**Cause:** Redirect URI in Google Console doesn't match Supabase callback URL

**Solution:**
1. Go to Google Cloud Console > Credentials
2. Edit your OAuth client
3. Add this exact URI:
   \`\`\`
   https://your-project-ref.supabase.co/auth/v1/callback
   \`\`\`

### Error: "Invalid client"
**Cause:** Client ID or Secret is incorrect in Supabase

**Solution:**
1. Double-check credentials in Google Cloud Console
2. Copy-paste them carefully into Supabase (no extra spaces)
3. Click "Save" in Supabase

### Error: 403 Forbidden
**Cause:** Google+ API is not enabled

**Solution:**
1. Go to Google Cloud Console
2. APIs & Services > Library
3. Search "Google+ API"
4. Click "Enable"

### Users can't sign in
**Check these:**
1. Supabase Dashboard > Authentication > Logs (for errors)
2. Browser console (F12) for JavaScript errors
3. Verify Google provider is "Enabled" in Supabase
4. Confirm redirect URIs match exactly

---

## 📚 How It Works

### Authentication Flow:

1. **User clicks "Continue with Google"**
   - App calls `supabase.auth.signInWithOAuth({ provider: 'google' })`
   - User is redirected to Google's sign-in page

2. **User signs in with Google**
   - Google authenticates the user
   - Google redirects back to: `http://localhost:3000/auth/callback`

3. **Callback page processes the response**
   - Exchanges the authorization code for a session
   - Creates user profile and company (if they don't exist)
   - Redirects to dashboard

4. **User is authenticated**
   - Session is stored in browser cookies
   - User can access protected routes

---

## 🎉 What's Next?

After setting up Google OAuth, you can:

1. **Test the complete flow:**
   - Sign up with Google
   - Sign out
   - Sign in again with Google

2. **Customize the experience:**
   - Add more OAuth providers (GitHub, Apple, etc.)
   - Customize the profile creation logic
   - Add onboarding steps for new users

3. **Deploy to production:**
   - Deploy to Vercel
   - Update environment variables
   - Update Google OAuth redirect URIs

---

## 📖 Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase Google OAuth Guide](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Google Cloud Console](https://console.cloud.google.com/)
- [OAuth 2.0 Overview](https://developers.google.com/identity/protocols/oauth2)

---

## ❓ Need Help?

If you encounter any issues:

1. Check the browser console (F12) for errors
2. Check Supabase logs: Authentication > Logs
3. Verify all credentials are correct
4. Make sure Google+ API is enabled
5. Confirm redirect URIs match exactly

---

## 📝 Important Note About Firebase

**You don't need Firebase for this project!**

Your app uses **Supabase** for authentication, database, and backend services. The Firebase config you provided is for a different type of setup.

### Supabase vs Firebase:
- **Supabase**: Open-source, PostgreSQL database, simpler auth
- **Firebase**: Google's platform, NoSQL database, different approach

**Stick with Supabase** - it's already integrated and working great! 🎉

---

**Ready to test?** Follow the steps above and you'll have Google OAuth working in minutes! 🚀
