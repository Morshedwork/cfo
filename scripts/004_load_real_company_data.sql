-- Script to load real company financial data
-- This SQL script demonstrates the data structure that gets populated
-- when you use the Real Company Data Loader feature

-- Note: This is a reference/documentation script
-- Actual data loading is done via the API route /api/load-real-company

-- Example: After loading Apple (AAPL) data, you would see:

-- 1. Updated company information
-- UPDATE companies SET
--   name = 'Apple Inc.',
--   industry = 'Technology',
--   team_size = 164000,
--   monthly_burn = 89500000000 / 12,  -- Annual OpEx divided by 12
--   current_cash = 62640000000,        -- Cash and equivalents
--   updated_at = NOW()
-- WHERE user_id = auth.uid();

-- 2. Transactions created from income statements (300-600 records)
-- Categories include:
--   - Revenue (income)
--   - Cost of Revenue (expense)
--   - Payroll (expense)
--   - Marketing (expense)
--   - Technology (expense)
--   - Operations (expense)

-- 3. Sales records from revenue breakdown (50-100 records)
-- Product mix:
--   - Enterprise Plan (40% of revenue)
--   - Professional Plan (30% of revenue)
--   - Starter Plan (15% of revenue)
--   - Consulting Services (10% of revenue)
--   - Custom Solutions (5% of revenue)

-- 4. AI Insights generated from financial analysis (3-5 insights)
-- Types:
--   - Revenue growth analysis
--   - Profitability assessment
--   - Runway calculations
--   - Expense optimization suggestions

-- ========================================
-- USAGE INSTRUCTIONS
-- ========================================

-- Option 1: Use the Dashboard UI
-- 1. Go to /dashboard
-- 2. Click "Load Real Company Data"
-- 3. Select a company
-- 4. Wait for data to load

-- Option 2: Use the API directly
-- POST /api/load-real-company
-- {
--   "symbol": "AAPL",
--   "clearExisting": true
-- }

-- Option 3: Use curl from command line
-- curl -X POST http://localhost:3000/api/load-real-company \
--   -H "Content-Type: application/json" \
--   -d '{"symbol":"AAPL","clearExisting":true}'

-- ========================================
-- AVAILABLE COMPANIES (Sample)
-- ========================================

-- Technology:
--   AAPL - Apple Inc.
--   MSFT - Microsoft Corporation
--   GOOGL - Alphabet Inc.
--   META - Meta Platforms Inc.
--   NVDA - NVIDIA Corporation
--   INTC - Intel Corporation
--   AMD - Advanced Micro Devices

-- E-commerce:
--   AMZN - Amazon.com Inc.
--   SHOP - Shopify Inc.
--   EBAY - eBay Inc.

-- Automotive:
--   TSLA - Tesla Inc.
--   F - Ford Motor Company
--   GM - General Motors

-- Entertainment:
--   NFLX - Netflix Inc.
--   DIS - The Walt Disney Company
--   SPOT - Spotify Technology

-- Retail:
--   NKE - Nike Inc.
--   HD - The Home Depot
--   WMT - Walmart Inc.

-- Food & Beverage:
--   SBUX - Starbucks Corporation
--   MCD - McDonald's Corporation
--   KO - The Coca-Cola Company

-- Finance:
--   JPM - JPMorgan Chase & Co.
--   BAC - Bank of America Corp
--   GS - Goldman Sachs Group

-- Healthcare:
--   UNH - UnitedHealth Group
--   JNJ - Johnson & Johnson
--   PFE - Pfizer Inc.

-- Aerospace:
--   BA - Boeing Company
--   LMT - Lockheed Martin
--   RTX - Raytheon Technologies

-- And 400+ more public companies!

-- ========================================
-- DATA VOLUME ESTIMATES
-- ========================================

-- Small Company (< $1B revenue):
--   - Transactions: ~200-300
--   - Sales: ~40-60
--   - Insights: 3-4

-- Medium Company ($1B - $50B revenue):
--   - Transactions: ~300-450
--   - Sales: ~50-80
--   - Insights: 4-5

-- Large Company (> $50B revenue):
--   - Transactions: ~450-600
--   - Sales: ~80-120
--   - Insights: 5-6

-- ========================================
-- REQUIREMENTS
-- ========================================

-- 1. Environment variable set:
--    FMP_API_KEY=your_api_key

-- 2. Completed onboarding:
--    Must have a company record in the database

-- 3. API rate limits (Free tier):
--    - 250 requests per day
--    - Each company load uses ~5 requests
--    - Can load ~50 companies per day

-- ========================================
-- TROUBLESHOOTING
-- ========================================

-- Error: "API key not set"
-- Solution: Add FMP_API_KEY to .env.local

-- Error: "Company not found"
-- Solution: Ensure onboarding is completed first

-- Error: "Rate limit exceeded"
-- Solution: Wait 24 hours or upgrade API plan

-- ========================================
-- CLEANUP (if needed)
-- ========================================

-- To remove all transactions and sales:
-- DELETE FROM transactions WHERE company_id = (
--   SELECT id FROM companies WHERE user_id = auth.uid()
-- );
-- DELETE FROM sales WHERE company_id = (
--   SELECT id FROM companies WHERE user_id = auth.uid()
-- );

-- To reset company to demo state:
-- Run scripts/002_seed_demo_data.sql again


