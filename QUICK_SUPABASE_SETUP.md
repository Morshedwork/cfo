# Quick Supabase Setup Guide

## 🚀 Quick Start (5 Minutes)

### 1. Install SQL Scripts in Supabase

Go to your Supabase project → **SQL Editor** → Run these scripts **in order**:

```bash
1. scripts/000_create_profiles.sql  ← Run this FIRST
2. scripts/001_create_schema.sql   ← Run this SECOND
```

### 2. Configure Authentication

Go to **Authentication** → **Settings**:

- ✅ Enable **Email Auth Provider**
- ✅ Set **Site URL**: `http://localhost:3000` (or your domain)
- ✅ Add **Redirect URLs**:
  - `http://localhost:3000/auth/callback`
  - `http://localhost:3000/**`

### 3. Set Environment Variables

Create/update `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Test It!

1. **Sign Up**: Go to `/auth/sign-up`
   - Enter email, password, company name
   - Click "Create Account"
   - ✅ Should redirect to `/onboarding`

2. **Verify in Supabase**:
   - Go to **Table Editor** → `profiles`
   - Go to **Table Editor** → `companies`
   - ✅ Both should have your data

3. **Sign In**: Go to `/auth/login`
   - Use same credentials
   - ✅ Should redirect to `/dashboard`

## 🎯 What Gets Created Automatically

When a user signs up:

```
User Signs Up
    ↓
Auth User Created (auth.users)
    ↓
Profile Created (profiles) ← Automatic via trigger
    ↓
Company Created (companies) ← Automatic via trigger
    ↓
Redirect to Onboarding
```

## 📊 Database Tables

| Table | Purpose | Auto-Created? |
|-------|---------|---------------|
| `profiles` | User profile info | ✅ Yes (via trigger) |
| `companies` | Company info | ✅ Yes (via trigger) |
| `transactions` | Financial transactions | ❌ No (manual) |
| `sales` | Sales data | ❌ No (manual) |
| `forecasts` | Runway forecasts | ❌ No (manual) |
| `ai_insights` | AI insights | ❌ No (auto-generated) |

## 🔧 Troubleshooting

### Profile not created?
```sql
-- Check if trigger exists
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';

-- If not, re-run scripts/000_create_profiles.sql
```

### Company not created?
```sql
-- Check if trigger exists
SELECT * FROM pg_trigger WHERE tgname = 'on_profile_created';

-- If not, re-run scripts/000_create_profiles.sql
```

### "Not authenticated" error?
1. Check `.env.local` has correct values
2. Restart dev server: `npm run dev`
3. Clear browser cache and try again

### RLS blocking access?
```sql
-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- All should show 'true'
```

## 🛠️ Manual Commands

### Check if user has profile:
```typescript
import { getCurrentUserProfile } from '@/lib/supabase/profile-utils'

const profile = await getCurrentUserProfile()
console.log('Profile:', profile)
```

### Check if user has company:
```typescript
import { getCurrentUserCompany } from '@/lib/supabase/profile-utils'

const company = await getCurrentUserCompany()
console.log('Company:', company)
```

### Ensure profile exists (creates if missing):
```typescript
import { ensureUserProfile } from '@/lib/supabase/profile-utils'

const { profile, company, error } = await ensureUserProfile()
if (error) console.error('Error:', error)
```

## 📝 What's Different Now?

### Before:
- ❌ No automatic profile creation
- ❌ Manual company setup required
- ❌ Users could sign in without profile

### After:
- ✅ Automatic profile creation on sign-up
- ✅ Automatic company creation on sign-up
- ✅ Profile/company verification on sign-in
- ✅ Fallback creation if missing
- ✅ Database triggers handle everything

## 🎉 You're Done!

Your Supabase authentication is now fully set up with:
- ✅ Automatic profile creation
- ✅ Automatic company creation
- ✅ Row Level Security (RLS)
- ✅ Proper relationships
- ✅ Error handling

Start building! 🚀

## 📚 Full Documentation

For detailed setup instructions, see:
- `SUPABASE_PROFILE_SETUP.md` - Complete guide
- `SUPABASE_SETUP.md` - General Supabase setup
- `SUPABASE_SETUP_GUIDE.md` - Alternative guide

