-- ============================================
-- COMPLETE DATABASE SETUP FOR AURA CFO APP
-- Run this in your Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. CREATE PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  company_name TEXT,
  role TEXT DEFAULT 'owner',
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- 2. CREATE COMPANIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  industry TEXT,
  founded_date DATE,
  team_size INTEGER,
  funding_stage TEXT,
  monthly_burn DECIMAL(15, 2),
  current_cash DECIMAL(15, 2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- RLS Policies for companies
DROP POLICY IF EXISTS "Users can view their own company" ON public.companies;
CREATE POLICY "Users can view their own company"
  ON public.companies FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own company" ON public.companies;
CREATE POLICY "Users can insert their own company"
  ON public.companies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own company" ON public.companies;
CREATE POLICY "Users can update their own company"
  ON public.companies FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own company" ON public.companies;
CREATE POLICY "Users can delete their own company"
  ON public.companies FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 3. CREATE OTHER TABLES
-- ============================================

-- Transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  category TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  payment_method TEXT,
  vendor TEXT,
  ai_confidence DECIMAL(3, 2),
  needs_review BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sales table
CREATE TABLE IF NOT EXISTS public.sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(15, 2) NOT NULL,
  total_amount DECIMAL(15, 2) NOT NULL,
  channel TEXT,
  customer_name TEXT,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Forecasts table
CREATE TABLE IF NOT EXISTS public.forecasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('baseline', 'scenario')),
  assumptions JSONB NOT NULL,
  results JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI insights table
CREATE TABLE IF NOT EXISTS public.ai_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('info', 'warning', 'critical')),
  data JSONB,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Data imports table
CREATE TABLE IF NOT EXISTS public.data_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  file_type TEXT NOT NULL,
  rows_imported INTEGER NOT NULL,
  status TEXT NOT NULL,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. ENABLE RLS ON ALL TABLES
-- ============================================
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_imports ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 5. CREATE RLS POLICIES
-- ============================================

-- Transactions policies
DROP POLICY IF EXISTS "Users can view their company transactions" ON public.transactions;
CREATE POLICY "Users can view their company transactions"
  ON public.transactions FOR SELECT
  USING (company_id IN (SELECT id FROM public.companies WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can insert their company transactions" ON public.transactions;
CREATE POLICY "Users can insert their company transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (company_id IN (SELECT id FROM public.companies WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can update their company transactions" ON public.transactions;
CREATE POLICY "Users can update their company transactions"
  ON public.transactions FOR UPDATE
  USING (company_id IN (SELECT id FROM public.companies WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can delete their company transactions" ON public.transactions;
CREATE POLICY "Users can delete their company transactions"
  ON public.transactions FOR DELETE
  USING (company_id IN (SELECT id FROM public.companies WHERE user_id = auth.uid()));

-- Sales policies
DROP POLICY IF EXISTS "Users can view their company sales" ON public.sales;
CREATE POLICY "Users can view their company sales"
  ON public.sales FOR SELECT
  USING (company_id IN (SELECT id FROM public.companies WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can insert their company sales" ON public.sales;
CREATE POLICY "Users can insert their company sales"
  ON public.sales FOR INSERT
  WITH CHECK (company_id IN (SELECT id FROM public.companies WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can update their company sales" ON public.sales;
CREATE POLICY "Users can update their company sales"
  ON public.sales FOR UPDATE
  USING (company_id IN (SELECT id FROM public.companies WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can delete their company sales" ON public.sales;
CREATE POLICY "Users can delete their company sales"
  ON public.sales FOR DELETE
  USING (company_id IN (SELECT id FROM public.companies WHERE user_id = auth.uid()));

-- Forecasts policies
DROP POLICY IF EXISTS "Users can view their company forecasts" ON public.forecasts;
CREATE POLICY "Users can view their company forecasts"
  ON public.forecasts FOR SELECT
  USING (company_id IN (SELECT id FROM public.companies WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can insert their company forecasts" ON public.forecasts;
CREATE POLICY "Users can insert their company forecasts"
  ON public.forecasts FOR INSERT
  WITH CHECK (company_id IN (SELECT id FROM public.companies WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can update their company forecasts" ON public.forecasts;
CREATE POLICY "Users can update their company forecasts"
  ON public.forecasts FOR UPDATE
  USING (company_id IN (SELECT id FROM public.companies WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can delete their company forecasts" ON public.forecasts;
CREATE POLICY "Users can delete their company forecasts"
  ON public.forecasts FOR DELETE
  USING (company_id IN (SELECT id FROM public.companies WHERE user_id = auth.uid()));

-- AI Insights policies
DROP POLICY IF EXISTS "Users can view their company insights" ON public.ai_insights;
CREATE POLICY "Users can view their company insights"
  ON public.ai_insights FOR SELECT
  USING (company_id IN (SELECT id FROM public.companies WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can insert their company insights" ON public.ai_insights;
CREATE POLICY "Users can insert their company insights"
  ON public.ai_insights FOR INSERT
  WITH CHECK (company_id IN (SELECT id FROM public.companies WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can update their company insights" ON public.ai_insights;
CREATE POLICY "Users can update their company insights"
  ON public.ai_insights FOR UPDATE
  USING (company_id IN (SELECT id FROM public.companies WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can delete their company insights" ON public.ai_insights;
CREATE POLICY "Users can delete their company insights"
  ON public.ai_insights FOR DELETE
  USING (company_id IN (SELECT id FROM public.companies WHERE user_id = auth.uid()));

-- Data imports policies
DROP POLICY IF EXISTS "Users can view their company imports" ON public.data_imports;
CREATE POLICY "Users can view their company imports"
  ON public.data_imports FOR SELECT
  USING (company_id IN (SELECT id FROM public.companies WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can insert their company imports" ON public.data_imports;
CREATE POLICY "Users can insert their company imports"
  ON public.data_imports FOR INSERT
  WITH CHECK (company_id IN (SELECT id FROM public.companies WHERE user_id = auth.uid()));

-- ============================================
-- 6. CREATE TRIGGERS FOR AUTO-CREATION
-- ============================================

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, company_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'company_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile when user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to automatically create company on user signup
CREATE OR REPLACE FUNCTION public.handle_new_company()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.companies (user_id, name, industry, founded_date, team_size, funding_stage)
  VALUES (
    NEW.id,
    COALESCE(NEW.company_name, 'My Company'),
    'Technology',
    CURRENT_DATE,
    1,
    'pre-seed'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create company when profile is created
DROP TRIGGER IF EXISTS on_profile_created ON public.profiles;
CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_company();

-- ============================================
-- 7. CREATE INDEXES
-- ============================================
DROP INDEX IF EXISTS idx_profiles_email;
CREATE INDEX idx_profiles_email ON public.profiles(email);

DROP INDEX IF EXISTS idx_transactions_company_id;
CREATE INDEX idx_transactions_company_id ON public.transactions(company_id);

DROP INDEX IF EXISTS idx_transactions_date;
CREATE INDEX idx_transactions_date ON public.transactions(date);

DROP INDEX IF EXISTS idx_sales_company_id;
CREATE INDEX idx_sales_company_id ON public.sales(company_id);

DROP INDEX IF EXISTS idx_sales_date;
CREATE INDEX idx_sales_date ON public.sales(date);

DROP INDEX IF EXISTS idx_forecasts_company_id;
CREATE INDEX idx_forecasts_company_id ON public.forecasts(company_id);

DROP INDEX IF EXISTS idx_ai_insights_company_id;
CREATE INDEX idx_ai_insights_company_id ON public.ai_insights(company_id);

DROP INDEX IF EXISTS idx_data_imports_company_id;
CREATE INDEX idx_data_imports_company_id ON public.data_imports(company_id);

-- ============================================
-- SETUP COMPLETE!
-- ============================================
