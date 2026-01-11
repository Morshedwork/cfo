# Debugging "After login it just shows loading"

## The Problem

When you log in, the page gets stuck on the loading screen forever. This happens when:

1. **Database tables don't exist** - The `profiles` table query fails
2. **Auth state stuck in loading** - The AuthContext never finishes loading
3. **AuthGuard waiting forever** - The guard waits for `loading=false` which never comes

## The Fix I Just Applied

I updated the code to:
- ✅ Add better error handling in `lib/auth-context.tsx`
- ✅ Add detailed console logging to track auth flow
- ✅ Ensure `loading` always resolves even if profile fails
- ✅ Show clear error messages when tables don't exist

## How to Fix Your Issue

### Step 1: Open Browser Console
1. Press **F12** to open DevTools
2. Go to **Console** tab
3. Refresh the page after logging in
4. Look for messages starting with `[Auth]` and `[Profile]`

### Step 2: Check for This Error
If you see:
\`\`\`
[Profile] ⚠️ CRITICAL: profiles table does not exist! Run database setup SQL.
\`\`\`

**This means you haven't set up the database yet!**

### Step 3: Run Database Setup

You **MUST** run the database setup SQL:

1. Open: https://supabase.com/dashboard/project/vhshwuolgaqscgebeebb
2. Click: **SQL Editor** → **New Query**
3. Open file: `scripts/setup_database.sql` (in your project)
4. Copy **ALL contents** (342 lines)
5. Paste into SQL Editor
6. Click: **RUN**
7. Wait for: "Success. No rows returned"

### Step 4: Verify Tables Created

Run this in SQL Editor:
\`\`\`sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
\`\`\`

You should see these tables:
- ✅ `ai_insights`
- ✅ `companies`
- ✅ `data_imports`
- ✅ `forecasts`
- ✅ `profiles` ← **CRITICAL!**
- ✅ `sales`
- ✅ `transactions`

### Step 5: Disable Email Confirmation

1. Go to: **Authentication** → **Providers** → **Email**
2. Scroll to: "Confirm email"
3. **UNCHECK**: "Enable email confirmations"
4. Click: **Save**

### Step 6: Clear and Test

1. **Clear browser data:**
   - Press F12
   - Application tab → Clear storage → Clear site data
   
2. **Close all tabs** with your app

3. **Open fresh tab** and try:
   - Sign up with a new account
   - Should redirect to `/onboarding`
   - Then navigate to `/dashboard`
   - Should see dashboard (not loading screen)

## What the Console Logs Mean

### ✅ Good Flow (Working):
\`\`\`
[Auth] Getting initial session...
[Auth] Loading profile for user: abc123...
[Profile] No user logged in
[Auth] Profile loaded: { email: "...", full_name: "..." }
[Auth] Initial session load complete
\`\`\`

### ❌ Bad Flow (Database Not Set Up):
\`\`\`
[Auth] Getting initial session...
[Auth] Loading profile for user: abc123...
[Profile] Database error: relation "public.profiles" does not exist
[Profile] ⚠️ CRITICAL: profiles table does not exist! Run database setup SQL.
[Auth] Profile loaded: null
[Auth] Initial session load complete
\`\`\`

### ❌ Bad Flow (Stuck Loading):
\`\`\`
[Auth] Getting initial session...
... nothing else (stuck!)
\`\`\`

## Quick Test Without Database

If you want to test auth without the database setup:

1. The app will still work BUT:
   - ✅ User login/logout works
   - ❌ Profile will be `null`
   - ❌ Company data won't work
   - ❌ Most features won't work

2. You'll see in navbar:
   - Email will show (from auth.user)
   - But no full name or company

## Final Checklist

- [ ] Database setup SQL executed successfully
- [ ] All 7 tables created (check with SQL query above)
- [ ] Email confirmation disabled in Supabase settings
- [ ] Browser cache cleared
- [ ] Console shows `[Auth] Initial session load complete`
- [ ] Dashboard loads without infinite loading screen

## Still Stuck?

Check the browser console and share the logs. Look for:
- Any errors in red
- What happens after `[Auth] Getting initial session...`
- Whether you see `[Profile] ⚠️ CRITICAL` message

---

**Most Common Cause:** Not running the database setup SQL!  
**Quick Fix:** Run `scripts/setup_database.sql` in Supabase SQL Editor
