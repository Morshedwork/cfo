# How to Add Real Data to Your Voice Assistant 📊

## Why Voice Assistant Shows "Demo Company"

Your voice assistant is correctly checking Supabase for real data, but **no data exists yet** in these tables:
- `companies` table - empty
- `transactions` table - empty
- `profiles` table - may exist but has no company data

That's why it falls back to showing "Demo Company" data.

---

## Check What Data You Have (Quick Test)

### Method 1: Check Browser Console

1. Open Voice Assistant page
2. Press **F12** (Developer Tools)
3. Go to **Console** tab
4. Ask any question
5. Look for this log:

```
[Voice API] Fetched data: {
  hasCompany: false,          ← Your company data
  transactionCount: 0,        ← Your transactions
  hasProfile: true            ← Your user profile
}
[Voice API] No real data found, using demo data
```

**If you see:**
- `hasCompany: false` = No company data
- `transactionCount: 0` = No transactions
- **Result:** Voice uses demo data

---

## How to Add Real Data (3 Options)

### Option 1: Load Real Company Data (Easiest) ⭐

**Best for:** Getting started quickly with real financial data

1. Go to **Dashboard** page
2. Click **"Load Real Company Data"** button
3. Choose a company (e.g., Apple, Microsoft, Tesla)
4. Wait for it to load (fetches from Financial Modeling Prep API)
5. Page refreshes automatically with real data
6. **Voice assistant now uses this data!**

**What it loads:**
- Company information (name, industry, etc.)
- Real transactions from income statements
- Real sales data
- Financial insights

**Requirements:**
- Need `FMP_API_KEY` in `.env.local`
- Get free key from: https://site.financialmodelingprep.com/developer/docs

### Option 2: Use Bookkeeping Page

**Best for:** Entering your own company's data

1. Go to **Bookkeeping** page
2. Click **"Add Transaction"**
3. Enter your transactions:
   - Date
   - Description
   - Amount
   - Category (Revenue/Expense)
4. Add multiple transactions
5. Go to **Settings** or **Profile**
6. Fill in company details:
   - Company name
   - Industry
   - Team size
   - Current cash balance

**Voice assistant will use this immediately!**

### Option 3: Import CSV

**Best for:** Bulk data import

1. Go to **Data Management** page
2. Upload your CSV file with transactions
3. Map columns (Date, Description, Amount, Category)
4. Import data
5. Fill in company info in Settings

---

## Quick Setup for Testing (5 Minutes)

### If You Want to Test with Real Data NOW:

1. **Get FMP API Key:**
   ```bash
   # 1. Go to https://site.financialmodelingprep.com/developer/docs
   # 2. Sign up (free tier is fine)
   # 3. Copy your API key
   ```

2. **Add to .env.local:**
   ```env
   # Financial Modeling Prep API
   FMP_API_KEY=your_fmp_key_here
   
   # Your existing keys
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
   OPENROUTER_API_KEY=your_openrouter_key
   NEXT_PUBLIC_ELEVENLABS_API_KEY=your_elevenlabs_key
   ```

3. **Restart Server:**
   ```bash
   # Stop (Ctrl+C)
   npm run dev
   ```

4. **Load Data:**
   - Go to Dashboard
   - Click "Load Real Company Data"
   - Choose any company (e.g., Apple)
   - Wait ~5 seconds
   - Page refreshes

5. **Test Voice Assistant:**
   - Go to Voice Assistant
   - Ask: "What's my runway?"
   - Check console - should now show real data!

---

## How Voice Assistant Gets Data

Here's the flow:

```
User asks question
    ↓
Voice Assistant sends userId to API
    ↓
API checks Supabase:
    - companies table (WHERE user_id = your_id)
    - transactions table (WHERE user_id = your_id)
    - profiles table (WHERE id = your_id)
    ↓
If data found:
    ✅ Calculate metrics (burn, runway, MRR, growth)
    ✅ Return REAL data to AI
    ✅ AI answers with YOUR actual numbers
    ↓
If NO data found:
    ⚠️ Return demo data
    ⚠️ AI answers with generic "Demo Company" numbers
```

---

## Verify It's Working

### After Adding Data, Check Console:

**Before (Demo Data):**
```
[Voice API] Fetched data: {
  hasCompany: false,
  transactionCount: 0,
  hasProfile: true
}
[Voice API] No real data found, using demo data
```

**After (Real Data):** ✅
```
[Voice API] Fetched data: {
  hasCompany: true,           ← ✅ Company found!
  transactionCount: 45,       ← ✅ Transactions found!
  hasProfile: true
}
```

**Ask Voice Assistant:**
```
"What's my company name?"

Demo data response: "Demo Company"
Real data response: "Apple Inc." (or your actual company)
```

---

## Database Tables Explained

### 1. `companies` table
**What:** Your company information
**Columns:**
- `id` - Unique ID
- `user_id` - Your user ID (links to your account)
- `name` - Company name
- `industry` - Industry type
- `team_size` - Number of employees
- `current_cash` - Cash balance
- `funding_stage` - Seed, Series A, etc.

### 2. `transactions` table
**What:** All your financial transactions
**Columns:**
- `id` - Unique ID
- `user_id` - Your user ID
- `date` - Transaction date
- `description` - What it was for
- `amount` - Money amount (negative = expense, positive = revenue)
- `category` - Type (Payroll, Marketing, Revenue, etc.)
- `type` - "expense" or "revenue"

### 3. `profiles` table
**What:** Your user profile
**Columns:**
- `id` - Your user ID
- `email` - Your email
- `full_name` - Your name
- Other profile info

---

## Current Dashboard Data

**Important:** The dashboard page currently shows **STATIC hardcoded data** for demo purposes. This is NOT from your database.

To see your REAL data on dashboard:
1. Load company data (Option 1 above)
2. Dashboard will need to be updated to fetch from Supabase
3. For now, voice assistant CAN access real data once you add it

---

## Summary

### Your Current Status:
- ✅ Voice assistant API - correctly configured
- ✅ Supabase connection - working
- ❌ Database tables - **EMPTY** (no data yet)
- **Result:** Falls back to demo data

### To Fix:
1. **Quick:** Load real company data (Dashboard → Load Real Company Data)
2. **Manual:** Add transactions in Bookkeeping page
3. **Bulk:** Import CSV in Data Management

### After Adding Data:
- ✅ Voice assistant uses YOUR real numbers
- ✅ Runway calculation based on YOUR burn rate
- ✅ MRR from YOUR actual revenue
- ✅ Growth from YOUR transaction history
- ✅ Expense breakdown from YOUR categories

---

## Testing Checklist

- [ ] Add `FMP_API_KEY` to `.env.local`
- [ ] Restart dev server
- [ ] Load company data from Dashboard
- [ ] Open Voice Assistant
- [ ] Open console (F12)
- [ ] Ask "What's my company name?"
- [ ] Check console logs
- [ ] Confirm it's using real data

---

## Need Help?

### Check Logs:
```bash
# In browser console (F12)
# Look for these messages:
[Voice API] Fetched data: {...}
[Voice API] No real data found, using demo data  ← This means no data yet!
```

### Common Issues:

**Issue:** Still shows demo data after loading
**Solution:** 
1. Check browser console for errors
2. Verify data loaded successfully
3. Hard refresh page (Ctrl+Shift+R)
4. Check Supabase tables directly

**Issue:** Can't load company data
**Solution:**
1. Verify `FMP_API_KEY` in `.env.local`
2. Restart server
3. Check FMP API key is active

---

Once you add data (any of the 3 options), your voice assistant will immediately start using your real financial data instead of demo data! 🎯

