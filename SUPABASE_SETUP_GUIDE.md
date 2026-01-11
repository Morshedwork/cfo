# 🚀 Complete Supabase Setup Guide

## ✅ Step 1: Environment Variables (DONE!)

Your `.env.local` file has been created with:
- ✅ Supabase URL: `https://vhshwuolgaqscgebeebb.supabase.co`
- ✅ Anon Key configured
- ✅ Service Role Key configured

---

## 📊 Step 2: Set Up Database Schema

### Go to Supabase SQL Editor

1. **Open your Supabase dashboard:**
   \`\`\`
   https://app.supabase.com/project/vhshwuolgaqscgebeebb
   \`\`\`

2. **Click on "SQL Editor" in the left sidebar**

3. **Click "New Query"**

### Run Each SQL Script (in order):

#### A. **Create Schema** (Core Tables)

Copy and paste the contents of `scripts/001_create_schema.sql` and run it.

This creates:
- ✅ `companies` table
- ✅ `transactions` table  
- ✅ `sales` table
- ✅ `forecasts` table
- ✅ `ai_insights` table
- ✅ `data_imports` table
- ✅ Row Level Security (RLS) policies
- ✅ Performance indexes

**Expected Result:** "Success. No rows returned"

---

#### B. **AI Assistant Features** (Optional but Recommended)

Copy and paste the contents of `scripts/003_ai_assistant_features.sql` and run it.

This creates:
- ✅ `financial_forecasts` table
- ✅ `scenarios` table
- ✅ `scenario_changes` table
- ✅ `investor_kpis` table
- ✅ `kpi_benchmarks` table
- ✅ `risk_thresholds` table
- ✅ `risk_alerts` table
- ✅ `cap_table_snapshots` table
- ✅ `cap_table_stakeholders` table
- ✅ `data_room_documents` table

**Expected Result:** "Success. No rows returned"

---

#### C. **Demo Data** (Optional - for testing)

Copy and paste the contents of `scripts/002_seed_demo_data.sql` and run it.

This creates:
- ✅ Demo company
- ✅ Sample transactions
- ✅ Sample sales data
- ✅ Sample forecasts

**Expected Result:** "Success. 1 rows affected" (or similar)

---

## 🔐 Step 3: Disable Email Confirmation (IMPORTANT!)

This allows users to sign up and log in instantly without email verification.

### Option A: Via Dashboard (Easiest)

1. **Go to Authentication → Providers:**
   \`\`\`
   https://app.supabase.com/project/vhshwuolgaqscgebeebb/auth/providers
   \`\`\`

2. **Find "Email" provider and click on it**

3. **Disable "Confirm email":**
   - Look for **"Confirm email"** toggle
   - **Turn it OFF** (disable it)
   - Click **"Save"**

### Option B: Via SQL (Alternative)

Run this in the SQL Editor:

\`\`\`sql
-- Auto-confirm all new users
CREATE OR REPLACE FUNCTION public.auto_confirm_user()
RETURNS TRIGGER AS $$
BEGIN
  NEW.email_confirmed_at = NOW();
  NEW.confirmed_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_confirm_user();
\`\`\`

---

## 🔄 Step 4: Restart Your Dev Server

**Stop the current server** (Ctrl+C) and start fresh:

\`\`\`bash
pnpm dev
\`\`\`

The server will now use the new Supabase credentials from `.env.local`.

---

## 🧪 Step 5: Test the Setup

### Test Sign Up:

1. **Go to:**
   \`\`\`
   http://localhost:3000/auth/sign-up
   \`\`\`

2. **Fill in:**
   - Company Name: `Test Company`
   - Email: `test@test.com`
   - Password: `password123`
   - Confirm Password: `password123`

3. **Click "Create Account"**

4. **Expected Result:** 
   - ✅ Immediately redirected to `/onboarding`
   - ✅ No "check your email" message
   - ✅ User is logged in

### Test Login:

1. **Go to:**
   \`\`\`
   http://localhost:3000/auth/login
   \`\`\`

2. **Enter credentials:**
   - Email: `test@test.com`
   - Password: `password123`

3. **Click "Sign In"**

4. **Expected Result:**
   - ✅ Immediately redirected to `/dashboard`
   - ✅ User is logged in

---

## 🎯 Step 6: Verify Database

### Check if your user was created:

1. **Go to Authentication → Users:**
   \`\`\`
   https://app.supabase.com/project/vhshwuolgaqscgebeebb/auth/users
   \`\`\`

2. **You should see:**
   - ✅ Your test user (`test@test.com`)
   - ✅ `email_confirmed_at` has a timestamp (not null)
   - ✅ User ID (UUID)

### Check if company was created:

1. **Go to Table Editor → companies:**
   \`\`\`
   https://app.supabase.com/project/vhshwuolgaqscgebeebb/editor
   \`\`\`

2. **Click on the `companies` table**

3. **You should see:**
   - ✅ A row with `Test Company`
   - ✅ `user_id` matches your auth user's ID

---

## 🐛 Troubleshooting

### Problem: "Failed to fetch" error

**Solution:**
1. Check `.env.local` exists and has correct values
2. Restart dev server: `pnpm dev`
3. Clear browser cache and cookies
4. Check Supabase project is not paused

### Problem: "Invalid API key" error

**Solution:**
1. Verify keys in `.env.local` match your Supabase dashboard
2. Make sure there are no extra spaces or quotes around the keys
3. Restart dev server

### Problem: "Email not confirmed" error

**Solution:**
1. Make sure you disabled "Confirm email" in Step 3
2. Or run the SQL trigger from Option B
3. Manually confirm existing users:
   \`\`\`sql
   UPDATE auth.users 
   SET email_confirmed_at = NOW(),
       confirmed_at = NOW()
   WHERE email = 'test@test.com';
   \`\`\`

### Problem: "Row Level Security" blocking access

**Solution:**
- Make sure you ran `001_create_schema.sql` completely
- Check policies were created:
  \`\`\`sql
  SELECT * FROM pg_policies WHERE schemaname = 'public';
  \`\`\`

### Problem: Tables don't exist

**Solution:**
1. Go to SQL Editor
2. Run `scripts/001_create_schema.sql` again
3. Check for error messages
4. Make sure you're in the correct project

---

## ✨ Next Steps

### Add Demo Data (Optional)

If you want to test with pre-populated data:
1. Run `scripts/002_seed_demo_data.sql`
2. This creates a demo company with transactions and sales

### Configure Google Gemini AI (Optional)

For AI features to work:
1. Get API key from: https://makersuite.google.com/app/apikey
2. Add to `.env.local`:
   \`\`\`
   GOOGLE_AI_API_KEY=your_key_here
   \`\`\`
3. Restart dev server

### Configure OneSignal Push Notifications (Optional)

For push notifications:
1. Sign up at: https://onesignal.com
2. Create a new app
3. Get App ID and REST API Key
4. Add to `.env.local`:
   \`\`\`
   NEXT_PUBLIC_ONESIGNAL_APP_ID=your_app_id
   ONESIGNAL_REST_API_KEY=your_rest_api_key
   \`\`\`
5. Restart dev server

---

## 📚 Useful Links

- **Supabase Dashboard:** https://app.supabase.com/project/vhshwuolgaqscgebeebb
- **SQL Editor:** https://app.supabase.com/project/vhshwuolgaqscgebeebb/sql
- **Table Editor:** https://app.supabase.com/project/vhshwuolgaqscgebeebb/editor
- **Authentication:** https://app.supabase.com/project/vhshwuolgaqscgebeebb/auth/users
- **Supabase Docs:** https://supabase.com/docs

---

## ✅ Checklist

- [ ] `.env.local` file created with Supabase keys
- [ ] Ran `001_create_schema.sql` (core tables)
- [ ] Ran `003_ai_assistant_features.sql` (AI features)
- [ ] Disabled email confirmation in Supabase dashboard
- [ ] Restarted dev server
- [ ] Successfully signed up with test account
- [ ] Successfully logged in
- [ ] Verified user exists in Supabase dashboard
- [ ] Verified company was created in database

---

**🎉 Once all steps are complete, your Aura CFO app is fully set up and ready to use!**
