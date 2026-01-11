# Navbar Not Loading - Debug Guide

## Problem
The profile/sign-in buttons are not showing in the navbar.

## What I Added

I've added console logging to the AuthNavbar to help debug. 

## How to Debug

### 1. Open Browser Console (F12)

After the page loads, you should see these logs in the console:

**If Working:**
\`\`\`
[Auth] Getting initial session...
[Auth] Initial session load complete
[Navbar] Auth state - loading: false, user: false, profile: false
[Navbar] Showing unauthenticated view
\`\`\`

**If Stuck:**
\`\`\`
[Auth] Getting initial session...
... nothing else (STUCK!)
\`\`\`

### 2. Check What the Console Shows

Look for one of these patterns:

#### Pattern A: Loading Forever
\`\`\`
[Navbar] Auth state - loading: true, user: false, profile: false
[Navbar] Showing loading state
\`\`\`
**Problem:** Auth context never finishes loading  
**Solution:** Check if Supabase env vars are set correctly

#### Pattern B: Auth Context Not Initialized
\`\`\`
(No logs at all)
\`\`\`
**Problem:** AuthProvider not wrapping the app  
**Solution:** Check app/layout.tsx has `<AuthProvider>`

#### Pattern C: Rapid Re-renders
\`\`\`
[Navbar] Auth state - loading: false, user: true, profile: false
[Navbar] Auth state - loading: false, user: true, profile: false
[Navbar] Auth state - loading: false, user: true, profile: false
... (repeating)
\`\`\`
**Problem:** Infinite render loop  
**Solution:** Profile refresh causing re-renders

### 3. Quick Fixes

#### Fix 1: Hard Refresh
\`\`\`
Ctrl + Shift + R
\`\`\`

#### Fix 2: Clear Browser Data
1. F12 → Application tab
2. Clear storage → Clear site data
3. Refresh page

#### Fix 3: Check Environment Variables
Run in terminal:
\`\`\`powershell
Get-Content .env.local | Select-String "SUPABASE"
\`\`\`

Should show:
\`\`\`
NEXT_PUBLIC_SUPABASE_URL=https://...supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
\`\`\`

#### Fix 4: Restart Dev Server
\`\`\`powershell
# Stop server (Ctrl+C)
# Then restart
npm run dev
\`\`\`

### 4. Common Issues

| Console Output | Problem | Fix |
|---------------|---------|-----|
| No logs at all | AuthProvider missing | Check layout.tsx |
| Loading forever | Supabase connection issue | Check .env.local |
| Rapid re-renders | Infinite loop | Clear cache & refresh |
| Auth error | Invalid credentials | Check env vars |

### 5. Expected Behavior

**When NOT logged in:**
- Should see: `[Navbar] Showing unauthenticated view`
- Should display: "Sign In" and "Get Started" buttons

**When logged in:**
- Should see: `[Navbar] Showing authenticated view`
- Should display: User avatar with dropdown menu

### 6. If Still Not Working

Share these console logs:
1. All lines starting with `[Auth]`
2. All lines starting with `[Navbar]`
3. Any errors in red

This will help identify the exact issue!

## Quick Test

Open console and run:
\`\`\`javascript
// Check if AuthProvider is working
console.log('Auth context available:', typeof useAuth !== 'undefined')

// Check loading state
console.log('Current path:', window.location.pathname)
\`\`\`

---

**Most Common Fix:** Hard refresh (Ctrl+Shift+R) or clear browser cache
