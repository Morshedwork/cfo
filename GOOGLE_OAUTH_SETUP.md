# Google OAuth Setup Guide for Supabase

## 🎯 Overview
This guide will help you set up Google OAuth authentication with Supabase for your CFO app.

---

## 📝 Step 1: Get Google OAuth Credentials

### 1.1 Go to Google Cloud Console
Visit: https://console.cloud.google.com/

### 1.2 Create or Select a Project
- Click on the project dropdown at the top
- Either select your existing project "ai-cfo-2e92d" or create a new one

### 1.3 Enable Google+ API
1. Go to "APIs & Services" > "Library"
2. Search for "Google+ API"
3. Click "Enable"

### 1.4 Create OAuth Credentials
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Choose "Web application"
4. Name it: "AI CFO App"

### 1.5 Set Authorized Redirect URIs
Add these redirect URIs (replace with your actual Supabase project URL):
\`\`\`
https://your-project-ref.supabase.co/auth/v1/callback
http://localhost:3000/auth/callback
\`\`\`

**Find your Supabase project URL:**
- Go to https://supabase.com/dashboard
- Select your project
- Go to Settings > API
- Copy the "Project URL"

### 1.6 Save Your Credentials
After creating, you'll get:
- **Client ID** (looks like: `xxxxx.apps.googleusercontent.com`)
- **Client Secret** (a random string)

⚠️ **Keep these secure!** Don't commit them to Git.

---

## 🔧 Step 2: Configure Supabase

### 2.1 Go to Supabase Dashboard
Visit: https://supabase.com/dashboard

### 2.2 Navigate to Authentication Settings
1. Select your project
2. Go to "Authentication" (left sidebar)
3. Click "Providers"
4. Find "Google"

### 2.3 Configure Google Provider
Enable Google and enter:
- **Client ID**: Your Google OAuth Client ID
- **Client Secret**: Your Google OAuth Client Secret
- **Authorized Client IDs**: (leave empty or add your client ID)

### 2.4 Save Configuration
Click "Save" at the bottom

---

## 💻 Step 3: Set Up Your Local Environment

### 3.1 Create `.env.local` file
Copy `.env.local.template` to `.env.local`:

\`\`\`bash
# On Windows PowerShell:
Copy-Item .env.local.template .env.local

# On macOS/Linux:
cp .env.local.template .env.local
\`\`\`

### 3.2 Add Your Supabase Credentials
Edit `.env.local` and add:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
\`\`\`

**Where to find these:**
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to Settings > API
4. Copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - Anon/Public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 🎨 Step 4: Add Google Sign-In Button

I've already prepared the code for you. The Google sign-in button will appear on your login page automatically.

---

## 🧪 Step 5: Test Your Setup

### 5.1 Start Development Server
\`\`\`bash
pnpm dev
\`\`\`

### 5.2 Test Google Login
1. Go to http://localhost:3000/auth/login
2. Click "Continue with Google"
3. Sign in with your Google account
4. You should be redirected back to the app

### 5.3 Verify User Created
1. Go to Supabase Dashboard
2. Click "Authentication" > "Users"
3. Your Google account should appear in the list

---

## 🚨 Troubleshooting

### Error: "redirect_uri_mismatch"
**Solution:** Make sure your redirect URI in Google Cloud Console matches:
\`\`\`
https://your-project-ref.supabase.co/auth/v1/callback
\`\`\`

### Error: "Invalid client"
**Solution:** Double-check that:
- Client ID is correct in Supabase
- Client Secret is correct in Supabase
- Google+ API is enabled in Google Cloud Console

### Users can't sign in
**Solution:**
1. Check Supabase logs: Authentication > Logs
2. Check browser console for errors
3. Make sure Google provider is enabled in Supabase

---

## 📌 Important Notes

### About Firebase
**You don't need Firebase for this project!** Your app already uses Supabase for authentication. The Firebase config you provided is for a different setup.

### Security
- Never commit `.env.local` to Git
- Keep your Google Client Secret secure
- Use environment variables for all sensitive data

### Production Deployment
When deploying to Vercel/production:
1. Add environment variables in your hosting platform
2. Update authorized redirect URIs in Google Cloud Console:
   \`\`\`
   https://your-domain.com/auth/callback
   https://your-project-ref.supabase.co/auth/v1/callback
   \`\`\`

---

## ✅ Next Steps

After setting up Google OAuth:
1. Test the login flow
2. Verify user profile creation
3. Test sign-out functionality
4. Deploy to production

---

## 📚 Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase Google OAuth Guide](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Google Cloud Console](https://console.cloud.google.com/)

---

**Need help?** Check the Supabase logs or browser console for specific error messages.
