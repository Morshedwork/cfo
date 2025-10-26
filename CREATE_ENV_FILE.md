# 📝 Create Your .env.local File (Step-by-Step)

## 🎯 What You Need

This guide will help you create the `.env.local` file that your app needs to work.

**Time needed:** 5 minutes

---

## 📋 Step-by-Step Instructions

### Step 1: Do You Have a Supabase Account?

**No?** 
1. Go to https://supabase.com/
2. Click **"Start your project"**
3. Sign up (use GitHub, Google, or email)
4. Skip to **Step 2**

**Yes?**
1. Go to https://supabase.com/dashboard
2. Continue to **Step 2**

---

### Step 2: Create or Select Your Project

**Don't have a project yet?**
1. Click **"New project"**
2. Fill in:
   - **Name:** `AI CFO App` (or any name you like)
   - **Database Password:** Create a strong password (save it somewhere!)
   - **Region:** Select closest region to you
3. Click **"Create new project"**
4. ⏱️ Wait 2-3 minutes for setup to complete

**Already have a project?**
1. Click on your project name to open it

---

### Step 3: Get Your Supabase Credentials

1. **In your Supabase project dashboard:**
   - Click **⚙️ Settings** (bottom left sidebar)
   - Click **API**

2. **You'll see two important things:**

   **A) Project URL**
   ```
   URL: https://abcdefghijklmnop.supabase.co
   ```
   ↑ Copy this entire URL

   **B) Project API keys → anon / public**
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFz...
   ```
   ↑ Click the copy icon to copy this (it's very long!)

3. **Keep these somewhere safe** (you'll need them in the next step)

---

### Step 4: Create the .env.local File

**Option A: Using Windows File Explorer**
1. Open your project folder (`D:\AI AND PSD\cfo`)
2. Right-click in empty space
3. New → Text Document
4. Name it exactly: `.env.local` (including the dot at the start!)
5. Windows might warn you about changing extension - click **Yes**

**Option B: Using PowerShell**
```powershell
cd "D:\AI AND PSD\cfo"
New-Item .env.local -ItemType File
notepad .env.local
```

---

### Step 5: Add Your Credentials to .env.local

Open the `.env.local` file and paste this:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=PASTE_YOUR_PROJECT_URL_HERE
NEXT_PUBLIC_SUPABASE_ANON_KEY=PASTE_YOUR_ANON_KEY_HERE
```

**Now replace the placeholders:**

1. Replace `PASTE_YOUR_PROJECT_URL_HERE` with your Project URL from Step 3
2. Replace `PASTE_YOUR_ANON_KEY_HERE` with your anon/public key from Step 3

**Example of what it should look like:**
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzMTIzNDU2NywiZXhwIjoxOTQ2ODEwNTY3fQ.xyz123abc456def789
```

**⚠️ Make sure:**
- No spaces around the `=` sign
- No quotes around the values
- The URL starts with `https://`
- The anon key is one long line (no line breaks)

**Save the file!** (Ctrl+S)

---

### Step 6: Verify Your Setup

Run this command to check if everything is correct:

```powershell
node check-env.js
```

You should see:
```
✅ .env.local file exists
✅ NEXT_PUBLIC_SUPABASE_URL is set
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY is set
🎉 Environment variables are configured!
```

If you see any ❌ errors, follow the instructions to fix them.

---

### Step 7: Restart Your Dev Server

**In your terminal:**
1. Press **Ctrl+C** to stop the dev server
2. Run: `pnpm dev`
3. Wait for it to start

---

### Step 8: Test It!

**Open your browser:**
- Go to: http://localhost:3000/auth/login

**You should see:**
- ✅ The login page loads without errors
- ✅ No more "placeholder.supabase.co" error
- ✅ Beautiful login form with Google button

---

## ✅ Success Checklist

- [ ] Created Supabase account
- [ ] Created or selected a project
- [ ] Copied Project URL from Settings > API
- [ ] Copied anon/public key from Settings > API
- [ ] Created `.env.local` file in project root
- [ ] Pasted both credentials into `.env.local`
- [ ] Saved the file
- [ ] Ran `node check-env.js` (all checks passed)
- [ ] Restarted dev server with `pnpm dev`
- [ ] Visited http://localhost:3000/auth/login (page loads!)

---

## 🎉 What's Next?

Now that your environment is set up:

1. **Set up Google OAuth** - Follow: `GOOGLE_AUTH_CHECKLIST.md`
2. **Set up database** - Run the SQL scripts in `/scripts`
3. **Test authentication** - Try logging in!

---

## 🐛 Troubleshooting

### Issue: Can't create file starting with dot

**On Windows:**
- Use PowerShell: `New-Item .env.local -ItemType File`
- Or create as `.env.local.` (with dot at end) - Windows will auto-fix it

### Issue: "placeholder.supabase.co" still appears

**Solution:**
1. Check that `.env.local` is in the root folder (next to `package.json`)
2. Make sure you saved the file after editing
3. Restart the dev server completely
4. Clear browser cache or use incognito mode

### Issue: check-env.js shows warnings

**Solution:**
- Follow the instructions in the warning
- Make sure you replaced ALL placeholder text
- Check for typos in variable names

---

## 📞 Need Help?

If you're stuck:
1. Run: `node check-env.js` to see what's wrong
2. Check the detailed guide: `QUICK_FIX_ENV.md`
3. Make sure your Supabase project is fully created (not still loading)

---

**Ready?** Follow the steps above and you'll be up and running in 5 minutes! 🚀

