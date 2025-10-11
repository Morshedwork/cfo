-- This script creates demo data for testing
-- Note: This will only work after a user signs up and creates a company

-- Insert sample transactions (will be associated with the first company)
INSERT INTO public.transactions (company_id, date, description, amount, category, type, payment_method, vendor, ai_confidence, needs_review)
SELECT 
  (SELECT id FROM public.companies LIMIT 1),
  CURRENT_DATE - (random() * 90)::integer,
  CASE (random() * 10)::integer
    WHEN 0 THEN 'Office Rent Payment'
    WHEN 1 THEN 'AWS Cloud Services'
    WHEN 2 THEN 'Employee Salaries'
    WHEN 3 THEN 'Marketing Campaign'
    WHEN 4 THEN 'Software Licenses'
    WHEN 5 THEN 'Client Payment Received'
    WHEN 6 THEN 'Consulting Services'
    WHEN 7 THEN 'Office Supplies'
    WHEN 8 THEN 'Travel Expenses'
    ELSE 'Miscellaneous'
  END,
  (random() * 10000 + 500)::numeric(15,2),
  CASE (random() * 5)::integer
    WHEN 0 THEN 'Operations'
    WHEN 1 THEN 'Marketing'
    WHEN 2 THEN 'Payroll'
    WHEN 3 THEN 'Technology'
    ELSE 'General'
  END,
  CASE WHEN random() > 0.7 THEN 'income' ELSE 'expense' END,
  CASE (random() * 3)::integer
    WHEN 0 THEN 'Credit Card'
    WHEN 1 THEN 'Bank Transfer'
    ELSE 'Cash'
  END,
  'Vendor ' || (random() * 20)::integer,
  (random() * 0.3 + 0.7)::numeric(3,2),
  random() > 0.9
FROM generate_series(1, 50)
WHERE EXISTS (SELECT 1 FROM public.companies LIMIT 1);

-- Insert sample sales data
INSERT INTO public.sales (company_id, date, product_name, quantity, unit_price, total_amount, channel, customer_name, status)
SELECT 
  (SELECT id FROM public.companies LIMIT 1),
  CURRENT_DATE - (random() * 90)::integer,
  CASE (random() * 5)::integer
    WHEN 0 THEN 'Premium Plan'
    WHEN 1 THEN 'Basic Plan'
    WHEN 2 THEN 'Enterprise Plan'
    WHEN 3 THEN 'Consulting Services'
    ELSE 'Custom Solution'
  END,
  (random() * 10 + 1)::integer,
  (random() * 500 + 50)::numeric(15,2),
  0,
  CASE (random() * 4)::integer
    WHEN 0 THEN 'Website'
    WHEN 1 THEN 'Direct Sales'
    WHEN 2 THEN 'Partner'
    ELSE 'Referral'
  END,
  'Customer ' || (random() * 100)::integer,
  CASE WHEN random() > 0.1 THEN 'completed' ELSE 'pending' END
FROM generate_series(1, 30)
WHERE EXISTS (SELECT 1 FROM public.companies LIMIT 1);

-- Update total_amount for sales
UPDATE public.sales SET total_amount = quantity * unit_price WHERE total_amount = 0;
