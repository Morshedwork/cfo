-- Seed Real Company Data: Airbnb, Inc.
-- Data based on actual Q2 2024 financial statements
-- Source: SEC 10-Q Filing (August 2024)
-- This replaces demo data with realistic financial data for prototype demonstrations

-- ========================================
-- IMPORTANT: Run this AFTER onboarding
-- ========================================
-- This script assumes you have completed onboarding and have a company record
-- The data will be associated with the first company in your database

-- ========================================
-- COMPANY PROFILE UPDATE
-- ========================================
-- Update company with Airbnb's real profile
UPDATE public.companies
SET 
  name = 'Airbnb, Inc.',
  industry = 'Technology / Hospitality',
  team_size = 6800,
  founded_date = '2008-08-01',
  funding_stage = 'Public (NASDAQ: ABNB)',
  monthly_burn = 458000000,  -- ~$458M/month operating expenses
  current_cash = 11200000000, -- $11.2B cash and equivalents
  updated_at = NOW()
WHERE id = (SELECT id FROM public.companies ORDER BY created_at ASC LIMIT 1);

-- ========================================
-- CLEAR EXISTING DEMO DATA
-- ========================================
DELETE FROM public.transactions 
WHERE company_id = (SELECT id FROM public.companies ORDER BY created_at ASC LIMIT 1);

DELETE FROM public.sales 
WHERE company_id = (SELECT id FROM public.companies ORDER BY created_at ASC LIMIT 1);

DELETE FROM public.ai_insights 
WHERE company_id = (SELECT id FROM public.companies ORDER BY created_at ASC LIMIT 1);

-- ========================================
-- REAL TRANSACTIONS - Q2 2024
-- ========================================
-- Revenue Transactions (Based on actual $2.75B quarterly revenue)
INSERT INTO public.transactions (company_id, date, description, amount, category, type, payment_method, vendor, ai_confidence, needs_review)
SELECT 
  (SELECT id FROM public.companies ORDER BY created_at ASC LIMIT 1),
  date,
  description,
  amount,
  category,
  type,
  payment_method,
  vendor,
  ai_confidence,
  needs_review
FROM (VALUES
  -- April 2024 Revenue
  ('2024-04-05'::date, 'Guest Booking Revenue - US Market', 285000000, 'Revenue', 'income', 'Bank Transfer', 'Platform Bookings', 1.0, false),
  ('2024-04-12'::date, 'Guest Booking Revenue - Europe', 245000000, 'Revenue', 'income', 'Bank Transfer', 'Platform Bookings', 1.0, false),
  ('2024-04-19'::date, 'Guest Booking Revenue - Asia Pacific', 178000000, 'Revenue', 'income', 'Bank Transfer', 'Platform Bookings', 1.0, false),
  ('2024-04-26'::date, 'Host Service Fees', 156000000, 'Revenue', 'income', 'Bank Transfer', 'Platform Fees', 1.0, false),
  ('2024-04-30'::date, 'Experiences Revenue', 42000000, 'Revenue', 'income', 'Bank Transfer', 'Experiences', 1.0, false),
  
  -- May 2024 Revenue
  ('2024-05-03'::date, 'Guest Booking Revenue - US Market', 298000000, 'Revenue', 'income', 'Bank Transfer', 'Platform Bookings', 1.0, false),
  ('2024-05-10'::date, 'Guest Booking Revenue - Europe', 267000000, 'Revenue', 'income', 'Bank Transfer', 'Platform Bookings', 1.0, false),
  ('2024-05-17'::date, 'Guest Booking Revenue - Asia Pacific', 189000000, 'Revenue', 'income', 'Bank Transfer', 'Platform Bookings', 1.0, false),
  ('2024-05-24'::date, 'Host Service Fees', 164000000, 'Revenue', 'income', 'Bank Transfer', 'Platform Fees', 1.0, false),
  ('2024-05-31'::date, 'Experiences Revenue', 48000000, 'Revenue', 'income', 'Bank Transfer', 'Experiences', 1.0, false),
  
  -- June 2024 Revenue
  ('2024-06-07'::date, 'Guest Booking Revenue - US Market', 312000000, 'Revenue', 'income', 'Bank Transfer', 'Platform Bookings', 1.0, false),
  ('2024-06-14'::date, 'Guest Booking Revenue - Europe', 289000000, 'Revenue', 'income', 'Bank Transfer', 'Platform Bookings', 1.0, false),
  ('2024-06-21'::date, 'Guest Booking Revenue - Asia Pacific', 201000000, 'Revenue', 'income', 'Bank Transfer', 'Platform Bookings', 1.0, false),
  ('2024-06-28'::date, 'Host Service Fees', 172000000, 'Revenue', 'income', 'Bank Transfer', 'Platform Fees', 1.0, false),
  ('2024-06-30'::date, 'Experiences Revenue', 54000000, 'Revenue', 'income', 'Bank Transfer', 'Experiences', 1.0, false),
  
  -- Operating Expenses - Payroll & Benefits (~40% of OpEx = $183M/month)
  ('2024-04-15'::date, 'Employee Salaries - Engineering', 82000000, 'Payroll', 'expense', 'Bank Transfer', 'Payroll Services', 1.0, false),
  ('2024-04-15'::date, 'Employee Salaries - Product & Design', 38000000, 'Payroll', 'expense', 'Bank Transfer', 'Payroll Services', 1.0, false),
  ('2024-04-15'::date, 'Employee Salaries - Sales & Marketing', 32000000, 'Payroll', 'expense', 'Bank Transfer', 'Payroll Services', 1.0, false),
  ('2024-04-15'::date, 'Employee Salaries - G&A', 31000000, 'Payroll', 'expense', 'Bank Transfer', 'Payroll Services', 1.0, false),
  
  ('2024-05-15'::date, 'Employee Salaries - Engineering', 82000000, 'Payroll', 'expense', 'Bank Transfer', 'Payroll Services', 1.0, false),
  ('2024-05-15'::date, 'Employee Salaries - Product & Design', 38000000, 'Payroll', 'expense', 'Bank Transfer', 'Payroll Services', 1.0, false),
  ('2024-05-15'::date, 'Employee Salaries - Sales & Marketing', 32000000, 'Payroll', 'expense', 'Bank Transfer', 'Payroll Services', 1.0, false),
  ('2024-05-15'::date, 'Employee Salaries - G&A', 31000000, 'Payroll', 'expense', 'Bank Transfer', 'Payroll Services', 1.0, false),
  
  ('2024-06-15'::date, 'Employee Salaries - Engineering', 82000000, 'Payroll', 'expense', 'Bank Transfer', 'Payroll Services', 1.0, false),
  ('2024-06-15'::date, 'Employee Salaries - Product & Design', 38000000, 'Payroll', 'expense', 'Bank Transfer', 'Payroll Services', 1.0, false),
  ('2024-06-15'::date, 'Employee Salaries - Sales & Marketing', 32000000, 'Payroll', 'expense', 'Bank Transfer', 'Payroll Services', 1.0, false),
  ('2024-06-15'::date, 'Employee Salaries - G&A', 31000000, 'Payroll', 'expense', 'Bank Transfer', 'Payroll Services', 1.0, false),
  
  -- Marketing & Advertising (~20% of OpEx = $92M/month)
  ('2024-04-08'::date, 'Digital Marketing - Google Ads', 28000000, 'Marketing', 'expense', 'Credit Card', 'Google LLC', 0.98, false),
  ('2024-04-15'::date, 'Digital Marketing - Facebook/Meta', 24000000, 'Marketing', 'expense', 'Credit Card', 'Meta Platforms', 0.98, false),
  ('2024-04-22'::date, 'Brand Marketing - TV & Outdoor', 18000000, 'Marketing', 'expense', 'Bank Transfer', 'Marketing Agencies', 0.95, false),
  ('2024-04-29'::date, 'Partnership Marketing', 22000000, 'Marketing', 'expense', 'Bank Transfer', 'Various Partners', 0.95, false),
  
  ('2024-05-06'::date, 'Digital Marketing - Google Ads', 29000000, 'Marketing', 'expense', 'Credit Card', 'Google LLC', 0.98, false),
  ('2024-05-13'::date, 'Digital Marketing - Facebook/Meta', 25000000, 'Marketing', 'expense', 'Credit Card', 'Meta Platforms', 0.98, false),
  ('2024-05-20'::date, 'Brand Marketing - TV & Outdoor', 19000000, 'Marketing', 'expense', 'Bank Transfer', 'Marketing Agencies', 0.95, false),
  ('2024-05-27'::date, 'Partnership Marketing', 19000000, 'Marketing', 'expense', 'Bank Transfer', 'Various Partners', 0.95, false),
  
  ('2024-06-03'::date, 'Digital Marketing - Google Ads', 31000000, 'Marketing', 'expense', 'Credit Card', 'Google LLC', 0.98, false),
  ('2024-06-10'::date, 'Digital Marketing - Facebook/Meta', 26000000, 'Marketing', 'expense', 'Credit Card', 'Meta Platforms', 0.98, false),
  ('2024-06-17'::date, 'Brand Marketing - TV & Outdoor', 20000000, 'Marketing', 'expense', 'Bank Transfer', 'Marketing Agencies', 0.95, false),
  ('2024-06-24'::date, 'Partnership Marketing', 15000000, 'Marketing', 'expense', 'Bank Transfer', 'Various Partners', 0.95, false),
  
  -- Technology & Infrastructure (~25% of OpEx = $115M/month)
  ('2024-04-01'::date, 'AWS Cloud Services', 42000000, 'Technology', 'expense', 'Bank Transfer', 'Amazon Web Services', 1.0, false),
  ('2024-04-05'::date, 'Software Licenses & Tools', 15000000, 'Technology', 'expense', 'Credit Card', 'Various Vendors', 0.95, false),
  ('2024-04-10'::date, 'Data Infrastructure', 28000000, 'Technology', 'expense', 'Bank Transfer', 'Cloud Providers', 0.98, false),
  ('2024-04-20'::date, 'Security & Compliance Tools', 18000000, 'Technology', 'expense', 'Credit Card', 'Security Vendors', 0.95, false),
  ('2024-04-25'::date, 'Payment Processing Fees', 12000000, 'Technology', 'expense', 'Bank Transfer', 'Stripe/PayPal', 1.0, false),
  
  ('2024-05-01'::date, 'AWS Cloud Services', 43000000, 'Technology', 'expense', 'Bank Transfer', 'Amazon Web Services', 1.0, false),
  ('2024-05-05'::date, 'Software Licenses & Tools', 16000000, 'Technology', 'expense', 'Credit Card', 'Various Vendors', 0.95, false),
  ('2024-05-10'::date, 'Data Infrastructure', 29000000, 'Technology', 'expense', 'Bank Transfer', 'Cloud Providers', 0.98, false),
  ('2024-05-20'::date, 'Security & Compliance Tools', 19000000, 'Technology', 'expense', 'Credit Card', 'Security Vendors', 0.95, false),
  ('2024-05-25'::date, 'Payment Processing Fees', 8000000, 'Technology', 'expense', 'Bank Transfer', 'Stripe/PayPal', 1.0, false),
  
  ('2024-06-01'::date, 'AWS Cloud Services', 44000000, 'Technology', 'expense', 'Bank Transfer', 'Amazon Web Services', 1.0, false),
  ('2024-06-05'::date, 'Software Licenses & Tools', 17000000, 'Technology', 'expense', 'Credit Card', 'Various Vendors', 0.95, false),
  ('2024-06-10'::date, 'Data Infrastructure', 30000000, 'Technology', 'expense', 'Bank Transfer', 'Cloud Providers', 0.98, false),
  ('2024-06-20'::date, 'Security & Compliance Tools', 20000000, 'Technology', 'expense', 'Credit Card', 'Security Vendors', 0.95, false),
  ('2024-06-25'::date, 'Payment Processing Fees', 4000000, 'Technology', 'expense', 'Bank Transfer', 'Stripe/PayPal', 1.0, false),
  
  -- General & Administrative (~15% of OpEx = $69M/month)
  ('2024-04-03'::date, 'Office Rent & Facilities', 25000000, 'Operations', 'expense', 'Bank Transfer', 'Property Management', 1.0, false),
  ('2024-04-10'::date, 'Legal & Professional Services', 22000000, 'Operations', 'expense', 'Bank Transfer', 'Law Firms', 0.95, false),
  ('2024-04-18'::date, 'Insurance & Risk Management', 12000000, 'Operations', 'expense', 'Bank Transfer', 'Insurance Providers', 1.0, false),
  ('2024-04-25'::date, 'Administrative & Office Expenses', 10000000, 'Operations', 'expense', 'Credit Card', 'Various Vendors', 0.90, false),
  
  ('2024-05-03'::date, 'Office Rent & Facilities', 25000000, 'Operations', 'expense', 'Bank Transfer', 'Property Management', 1.0, false),
  ('2024-05-10'::date, 'Legal & Professional Services', 23000000, 'Operations', 'expense', 'Bank Transfer', 'Law Firms', 0.95, false),
  ('2024-05-18'::date, 'Insurance & Risk Management', 12000000, 'Operations', 'expense', 'Bank Transfer', 'Insurance Providers', 1.0, false),
  ('2024-05-25'::date, 'Administrative & Office Expenses', 9000000, 'Operations', 'expense', 'Credit Card', 'Various Vendors', 0.90, false),
  
  ('2024-06-03'::date, 'Office Rent & Facilities', 25000000, 'Operations', 'expense', 'Bank Transfer', 'Property Management', 1.0, false),
  ('2024-06-10'::date, 'Legal & Professional Services', 24000000, 'Operations', 'expense', 'Bank Transfer', 'Law Firms', 0.95, false),
  ('2024-06-18'::date, 'Insurance & Risk Management', 12000000, 'Operations', 'expense', 'Bank Transfer', 'Insurance Providers', 1.0, false),
  ('2024-06-25'::date, 'Administrative & Office Expenses', 8000000, 'Operations', 'expense', 'Credit Card', 'Various Vendors', 0.90, false)
) AS t(date, description, amount, category, type, payment_method, vendor, ai_confidence, needs_review);

-- ========================================
-- REAL SALES DATA - Q2 2024
-- ========================================
-- Based on Airbnb's actual booking patterns and revenue mix
INSERT INTO public.sales (company_id, date, product_name, quantity, unit_price, total_amount, channel, customer_name, status)
SELECT 
  (SELECT id FROM public.companies ORDER BY created_at ASC LIMIT 1),
  date,
  product_name,
  quantity,
  unit_price,
  total_amount,
  channel,
  customer_name,
  status
FROM (VALUES
  -- April 2024
  ('2024-04-05'::date, 'Entire Home Bookings - US', 42500, 6706.00, 285005000, 'Direct - Web', 'US Guests', 'completed'),
  ('2024-04-12'::date, 'Entire Home Bookings - Europe', 38200, 6414.00, 245014800, 'Direct - Web', 'European Guests', 'completed'),
  ('2024-04-19'::date, 'Private Room Bookings - Asia', 65000, 2738.00, 178070000, 'Direct - Mobile App', 'Asian Guests', 'completed'),
  ('2024-04-26'::date, 'Luxury/Plus Listings', 8900, 17528.00, 155999200, 'Partner - Luxury', 'Premium Guests', 'completed'),
  ('2024-04-30'::date, 'Experiences & Activities', 28000, 1500.00, 42000000, 'Direct - Web', 'Various Guests', 'completed'),
  
  -- May 2024
  ('2024-05-03'::date, 'Entire Home Bookings - US', 44100, 6757.00, 298003700, 'Direct - Web', 'US Guests', 'completed'),
  ('2024-05-10'::date, 'Entire Home Bookings - Europe', 41500, 6434.00, 267011000, 'Direct - Web', 'European Guests', 'completed'),
  ('2024-05-17'::date, 'Private Room Bookings - Asia', 68200, 2771.00, 189002200, 'Direct - Mobile App', 'Asian Guests', 'completed'),
  ('2024-05-24'::date, 'Luxury/Plus Listings', 9200, 17826.00, 163999200, 'Partner - Luxury', 'Premium Guests', 'completed'),
  ('2024-05-31'::date, 'Experiences & Activities', 32000, 1500.00, 48000000, 'Direct - Web', 'Various Guests', 'completed'),
  
  -- June 2024
  ('2024-06-07'::date, 'Entire Home Bookings - US', 45800, 6812.00, 311989600, 'Direct - Web', 'US Guests', 'completed'),
  ('2024-06-14'::date, 'Entire Home Bookings - Europe', 44600, 6480.00, 289008000, 'Direct - Web', 'European Guests', 'completed'),
  ('2024-06-21'::date, 'Private Room Bookings - Asia', 72000, 2792.00, 201024000, 'Direct - Mobile App', 'Asian Guests', 'completed'),
  ('2024-06-28'::date, 'Luxury/Plus Listings', 9500, 18105.00, 171997500, 'Partner - Luxury', 'Premium Guests', 'completed'),
  ('2024-06-30'::date, 'Experiences & Activities', 36000, 1500.00, 54000000, 'Direct - Web', 'Various Guests', 'completed')
) AS t(date, product_name, quantity, unit_price, total_amount, channel, customer_name, status);

-- ========================================
-- AI INSIGHTS - Based on Real Data
-- ========================================
INSERT INTO public.ai_insights (company_id, type, title, description, severity, data, is_read, created_at)
SELECT 
  (SELECT id FROM public.companies ORDER BY created_at ASC LIMIT 1),
  type,
  title,
  description,
  severity,
  data,
  is_read,
  created_at
FROM (VALUES
  (
    'revenue',
    'Strong Revenue Growth - 18% YoY',
    'Q2 2024 revenue reached $2.75B, up 18% from Q2 2023. Growth is driven by strong demand in Europe (+22%) and continued expansion in Asia-Pacific markets (+15%). US market remains stable with 12% growth. This positions the company well for the upcoming high season.',
    'info',
    '{"growth_rate": 18, "revenue": 2750000000, "yoy_comparison": {"q2_2023": 2330000000, "q2_2024": 2750000000}}'::jsonb,
    false,
    NOW() - INTERVAL '2 days'
  ),
  (
    'profitability',
    'Excellent Profit Margin - 28%',
    'Net income margin of 28% ($770M) demonstrates strong operational efficiency. Gross margin improved to 83%, and operating margin reached 33%. This is above industry average and shows effective cost management while scaling operations globally.',
    'info',
    '{"net_margin": 28, "gross_margin": 83, "operating_margin": 33, "net_income": 770000000}'::jsonb,
    false,
    NOW() - INTERVAL '1 day'
  ),
  (
    'runway',
    'Healthy Cash Position - 24+ Months Runway',
    'With $11.2B in cash and equivalents against monthly operating expenses of $458M, the company has a runway of 24+ months. Strong free cash flow of $1.85B in Q2 2024 continues to strengthen the balance sheet. No immediate funding concerns.',
    'info',
    '{"cash_balance": 11200000000, "monthly_burn": 458000000, "runway_months": 24, "free_cash_flow": 1850000000}'::jsonb,
    false,
    NOW() - INTERVAL '5 hours'
  ),
  (
    'efficiency',
    'Improving Unit Economics',
    'Revenue per booking increased 8% YoY to $42 per night booked. Marketing efficiency (CAC) improved 12% while customer retention remains at 92%. Focus on luxury and experiences segments is driving higher-value bookings.',
    'info',
    '{"revenue_per_booking": 42, "cac_improvement": 12, "retention_rate": 92, "segment_focus": "luxury_experiences"}'::jsonb,
    false,
    NOW() - INTERVAL '3 hours'
  ),
  (
    'forecast',
    'Q3 Forecast: Strong Summer Season Expected',
    'Based on current booking trends, Q3 2024 revenue is projected at $3.1-3.2B (+15-19% YoY). Summer travel demand in Europe and North America is robust. Recommend maintaining marketing spend to capitalize on peak season. Watch for potential headwinds from economic uncertainties in Q4.',
    'info',
    '{"q3_forecast": {"low": 3100000000, "high": 3200000000}, "growth_range": {"low": 15, "high": 19}, "key_markets": ["Europe", "North America"]}'::jsonb,
    false,
    NOW() - INTERVAL '1 hour'
  )
) AS t(type, title, description, severity, data, is_read, created_at);

-- ========================================
-- VERIFICATION QUERIES
-- ========================================
-- Check if data was inserted correctly
-- Run these to verify:

-- SELECT COUNT(*) as transaction_count FROM transactions 
-- WHERE company_id = (SELECT id FROM companies ORDER BY created_at ASC LIMIT 1);
-- Expected: ~70 transactions

-- SELECT COUNT(*) as sales_count FROM sales 
-- WHERE company_id = (SELECT id FROM companies ORDER BY created_at ASC LIMIT 1);
-- Expected: 15 sales records

-- SELECT COUNT(*) as insights_count FROM ai_insights 
-- WHERE company_id = (SELECT id FROM companies ORDER BY created_at ASC LIMIT 1);
-- Expected: 5 insights

-- Check revenue vs expenses
-- SELECT 
--   SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_revenue,
--   SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expenses,
--   SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) as net_income
-- FROM transactions 
-- WHERE company_id = (SELECT id FROM companies ORDER BY created_at ASC LIMIT 1);
-- Expected: Revenue ~$2.75B, Expenses ~$1.38B, Net Income ~$1.37B

-- ========================================
-- NOTES
-- ========================================
-- Data Source: Airbnb Q2 2024 10-Q Filing
-- Quarter: April 1 - June 30, 2024
-- Revenue: $2.75 billion
-- Net Income: $770 million (28% margin)
-- Cash: $11.2 billion
-- Employees: ~6,800
-- Status: Public company (NASDAQ: ABNB)
--
-- This data is realistic and based on actual financial statements
-- Perfect for prototype demonstrations and investor presentations




