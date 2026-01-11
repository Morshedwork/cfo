# Supabase Profile Setup Guide

This guide explains how to set up Supabase authentication with automatic profile and company creation.

## Overview

When users sign up or sign in, the system automatically:
1. Creates a **profile** in the `profiles` table
2. Creates a **company** in the `companies` table
3. Links everything together with proper relationships

## Database Setup

### Step 1: Run the SQL Scripts

Run these SQL scripts in order in your Supabase SQL Editor:

1. **`scripts/000_create_profiles.sql`** - Creates the profiles table and triggers
2. **`scripts/001_create_schema.sql`** - Creates the main schema (companies, transactions, etc.)

### Step 2: Verify Tables Created

After running the scripts, you should see these tables:
- `profiles` - User profile information
- `companies` - Company information (linked to profiles)
- `transactions` - Financial transactions
- `sales` - Sales data
- `forecasts` - Runway forecasts
- `ai_insights` - AI-generated insights
- `data_imports` - Data import history

### Step 3: Configure Supabase Authentication

1. Go to **Authentication** → **Settings** in your Supabase dashboard
2. Enable **Email Auth Provider**
3. Set **Site URL** to your app URL (e.g., `http://localhost:3000`)
4. Add redirect URLs:
   - `http://localhost:3000/auth/callback` (for development)
   - `https://yourdomain.com/auth/callback` (for production)

### Step 4: Configure Email Templates (Optional)

If you want to disable email confirmation (for development):

1. Go to **Authentication** → **Email Templates**
2. For **Confirm signup**, you can customize the template
3. Or disable email confirmation in **Authentication** → **Settings** → **Email Auth** → **Enable email confirmations** (turn OFF for development)

## How It Works

### Automatic Profile Creation

When a user signs up:

1. **User signs up** → Supabase Auth creates user in `auth.users`
2. **Database trigger fires** → `handle_new_user()` function creates profile in `profiles` table
3. **Profile trigger fires** → `handle_new_company()` function creates company in `companies` table
4. **User is redirected** → To onboarding page

### Sign-Up Flow

\`\`\`typescript
// User fills form with:
// - Email
// - Password
// - Company Name

// System automatically:
// 1. Creates auth user
// 2. Creates profile (via trigger)
// 3. Creates company (via trigger)
// 4. Redirects to onboarding
\`\`\`

### Sign-In Flow

\`\`\`typescript
// User signs in with email/password

// System automatically:
// 1. Authenticates user
// 2. Checks if profile exists (creates if missing)
// 3. Checks if company exists (creates if missing)
// 4. Redirects to dashboard
\`\`\`

## Database Triggers

### Trigger 1: `on_auth_user_created`

**When:** New user signs up
**What:** Creates profile in `profiles` table
**Function:** `handle_new_user()`

\`\`\`sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
\`\`\`

### Trigger 2: `on_profile_created`

**When:** New profile is created
**What:** Creates company in `companies` table
**Function:** `handle_new_company()`

\`\`\`sql
CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_company();
\`\`\`

## Environment Variables

Make sure these are set in your `.env.local`:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
\`\`\`

## Testing the Setup

### Test 1: Sign Up

1. Go to `/auth/sign-up`
2. Fill in the form:
   - Company Name: "Test Company"
   - Email: "test@example.com"
   - Password: "password123"
3. Click "Create Account"
4. You should be redirected to `/onboarding`

**Verify in Supabase:**
- Go to **Table Editor** → `profiles`
- You should see a new profile with your email
- Go to **Table Editor** → `companies`
- You should see a new company named "Test Company"

### Test 2: Sign In

1. Go to `/auth/login`
2. Sign in with the same credentials
3. You should be redirected to `/dashboard`

**Verify:**
- Check browser console for any errors
- Profile and company should exist

### Test 3: Check Profile Data

\`\`\`typescript
import { getCurrentUserProfile, getCurrentUserCompany } from '@/lib/supabase/profile-utils'

// Get current user's profile
const profile = await getCurrentUserProfile()
console.log('Profile:', profile)

// Get current user's company
const company = await getCurrentUserCompany()
console.log('Company:', company)
\`\`\`

## Troubleshooting

### Issue: Profile not created

**Solution:**
1. Check if triggers are installed: Run `SELECT * FROM pg_trigger WHERE tgname LIKE '%user%';`
2. Check Supabase logs for errors
3. Manually create profile if needed

### Issue: Company not created

**Solution:**
1. Check if `on_profile_created` trigger exists
2. Check if `handle_new_company()` function exists
3. Manually create company if needed

### Issue: "Not authenticated" error

**Solution:**
1. Check if user is logged in
2. Check if session is valid
3. Try logging out and logging back in

### Issue: RLS (Row Level Security) blocking access

**Solution:**
1. Check RLS policies are enabled
2. Verify policies allow user to access their own data
3. Check Supabase logs for RLS errors

## Manual Profile Creation (If Needed)

If triggers fail, you can manually create profiles:

\`\`\`sql
-- Create profile
INSERT INTO public.profiles (id, email, full_name, company_name)
VALUES (
  'user-uuid-here',
  'user@example.com',
  'John Doe',
  'My Company'
);

-- Create company
INSERT INTO public.companies (user_id, name, industry, founded_date, team_size, funding_stage)
VALUES (
  'user-uuid-here',
  'My Company',
  'Technology',
  CURRENT_DATE,
  1,
  'pre-seed'
);
\`\`\`

## Utility Functions

The `lib/supabase/profile-utils.ts` file provides helper functions:

\`\`\`typescript
// Ensure user has profile and company
const { profile, company, error } = await ensureUserProfile()

// Get current user's profile
const profile = await getCurrentUserProfile()

// Get current user's company
const company = await getCurrentUserCompany()

// Update profile
const { profile, error } = await updateUserProfile({
  full_name: 'New Name',
  company_name: 'New Company'
})
\`\`\`

## Security

- All tables have **Row Level Security (RLS)** enabled
- Users can only access their own data
- Triggers use `SECURITY DEFINER` for elevated privileges
- All user data is isolated per user ID

## Next Steps

1. ✅ Run the SQL scripts
2. ✅ Configure Supabase authentication
3. ✅ Test sign-up and sign-in
4. ✅ Verify profiles and companies are created
5. 🎉 Start building your app!

## Support

If you encounter issues:
1. Check Supabase logs
2. Check browser console for errors
3. Verify environment variables are set
4. Check RLS policies
5. Check trigger functions exist
