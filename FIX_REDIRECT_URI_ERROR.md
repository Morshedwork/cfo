# 🔧 Fix: redirect_uri_mismatch Error

## ❌ The Problem

You're seeing this error:
\`\`\`
Error 400: redirect_uri_mismatch
\`\`\`

This happens because Google Cloud Console doesn't have the correct redirect URI.

---

## ✅ The Solution

You need to add your **Supabase callback URL** to Google Cloud Console.

### Step 1: Find Your Supabase Project URL

1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** > **API**
4. Copy your **Project URL** (looks like: `https://xxxxx.supabase.co`)

### Step 2: Add Redirect URI to Google Cloud Console

1. **Go to Google Cloud Console:**
   - Visit: https://console.cloud.google.com/

2. **Navigate to Credentials:**
   - Click **APIs & Services** (left sidebar)
   - Click **Credentials**

3. **Edit Your OAuth Client:**
   - Find your OAuth 2.0 Client ID (the one you created for this app)
   - Click the edit icon (pencil) ✏️

4. **Add Authorized Redirect URI:**
   
   Under "Authorized redirect URIs", add this **EXACT** URL:
   \`\`\`
   https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback
   \`\`\`
   
   **⚠️ Important:** Replace `YOUR-PROJECT-REF` with your actual Supabase project reference!
   
   **Example:**
   If your Supabase URL is: `https://abcdefghijklmnop.supabase.co`
   
   Then add: `https://abcdefghijklmnop.supabase.co/auth/v1/callback`

5. **Also add (for local development):**
   \`\`\`
   http://localhost:3000/auth/callback
   \`\`\`
   
   **Note:** This one is optional but good to have.

6. **Click "SAVE"** at the bottom

---

## 🎯 What Your Redirect URIs Should Look Like

In Google Cloud Console, you should have:

\`\`\`
Authorized redirect URIs:
✅ https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback
✅ http://localhost:3000/auth/callback (optional)
\`\`\`

---

## 📝 Common Mistakes to Avoid

### ❌ Wrong:
\`\`\`
http://YOUR-PROJECT-REF.supabase.co/auth/v1/callback  (missing 's' in https)
https://YOUR-PROJECT-REF.supabase.co/auth/callback    (missing /v1/)
https://localhost:3000/auth/callback                   (localhost should be http)
\`\`\`

### ✅ Correct:
\`\`\`
https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback
http://localhost:3000/auth/callback
\`\`\`

---

## 🔍 How to Find Your Exact Redirect URI

If you're not sure what your Supabase project reference is:

### Method 1: From Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** > **API**
4. Look at the "Project URL" field
5. Copy everything (e.g., `https://abcdefg.supabase.co`)
6. Add `/auth/v1/callback` to the end

### Method 2: From Supabase Authentication Settings
1. Go to Supabase Dashboard > **Authentication** > **Providers**
2. Click on **Google**
3. Look for the "Callback URL" field
4. Copy that exact URL

---

## ⏱️ How Long Does It Take?

After saving the redirect URI in Google Cloud Console:
- **Immediate:** Usually works right away
- **Up to 5 minutes:** In some cases, Google may take a few minutes to propagate

---

## 🧪 Test Again

After adding the redirect URI:

1. **Wait 1-2 minutes** (just to be safe)

2. **Try signing in again:**
   - Go to http://localhost:3000/auth/login
   - Click "Continue with Google"
   - Should work now! ✅

---

## 🐛 Still Not Working?

### Check These:

1. **Spelling and Typos:**
   - Make sure there are no typos in the redirect URI
   - Check for extra spaces at the beginning or end
   - Ensure it's `https://` (not `http://`) for Supabase

2. **Correct OAuth Client:**
   - Make sure you edited the correct OAuth client in Google Console
   - The Client ID should match what's in your Supabase settings

3. **Saved Changes:**
   - Ensure you clicked "Save" in Google Cloud Console
   - Refresh the page to verify the URI is there

4. **Browser Cache:**
   - Try in an incognito/private window
   - Or clear your browser cache

---

## 📋 Quick Checklist

- [ ] Found my Supabase Project URL
- [ ] Went to Google Cloud Console > Credentials
- [ ] Edited the correct OAuth client
- [ ] Added: `https://MY-PROJECT.supabase.co/auth/v1/callback`
- [ ] Verified no typos or extra spaces
- [ ] Clicked "Save"
- [ ] Waited 1-2 minutes
- [ ] Tested sign-in again

---

## 🎉 Success!

Once you've added the correct redirect URI, the error will disappear and Google sign-in will work perfectly!

---

## 📸 Visual Guide

**What it should look like in Google Cloud Console:**

\`\`\`
OAuth 2.0 Client ID
─────────────────────────────────────

Name: AI CFO App

Authorized redirect URIs:
┌─────────────────────────────────────────────────────┐
│ 1. https://abcdefg.supabase.co/auth/v1/callback    │
│ 2. http://localhost:3000/auth/callback              │
└─────────────────────────────────────────────────────┘

               [ Cancel ]  [ SAVE ]
\`\`\`

---

**Need more help?** Check the browser console (F12) for additional error details.
