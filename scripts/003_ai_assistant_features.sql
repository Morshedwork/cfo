-- AI Assistant Enhanced Features Database Schema
-- This migration adds support for FP&A, Fundraising, Strategic Decisions, Equity, and Risk Management

-- ====================
-- 1. Financial Forecasts & Scenarios
-- ====================

CREATE TABLE IF NOT EXISTS financial_forecasts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  forecast_type TEXT NOT NULL CHECK (forecast_type IN ('revenue', 'expenses', 'cash_flow', 'runway')),
  forecast_name TEXT NOT NULL,
  time_period TEXT NOT NULL, -- e.g., '2026-Q1', '2026', 'next-12-months'
  assumptions JSONB NOT NULL DEFAULT '{}', -- Store all modeling assumptions
  forecast_data JSONB NOT NULL DEFAULT '{}', -- Monthly/quarterly projections
  baseline_data JSONB DEFAULT '{}', -- Historical data used for forecast
  confidence_score NUMERIC(3,2) DEFAULT 0.75, -- AI confidence in forecast (0-1)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS scenarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  scenario_name TEXT NOT NULL,
  scenario_type TEXT NOT NULL CHECK (scenario_type IN ('hiring', 'marketing', 'revenue', 'cost_reduction', 'fundraising', 'custom')),
  description TEXT,
  baseline_metrics JSONB NOT NULL DEFAULT '{}', -- Before scenario
  scenario_metrics JSONB NOT NULL DEFAULT '{}', -- After scenario
  changes_applied JSONB NOT NULL DEFAULT '{}', -- What changed (e.g., +2 engineers at $180k)
  impact_analysis JSONB DEFAULT '{}', -- Detailed impact breakdown
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================
-- 2. Investor KPIs & Benchmarks
-- ====================

CREATE TABLE IF NOT EXISTS investor_kpis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  metric_name TEXT NOT NULL, -- e.g., 'ARR', 'LTV:CAC', 'NRR', 'Gross Margin'
  metric_value NUMERIC NOT NULL,
  metric_unit TEXT DEFAULT 'number', -- 'number', 'percentage', 'currency', 'ratio'
  calculation_method TEXT, -- How it was calculated
  benchmark_percentile INTEGER, -- 0-100, where they rank vs peers
  benchmark_source TEXT, -- e.g., 'PitchBook', 'OpenView', 'internal'
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS data_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  room_name TEXT NOT NULL,
  fundraising_round TEXT, -- e.g., 'Series A', 'Series B'
  access_url TEXT UNIQUE NOT NULL, -- Secure shareable link
  password_protected BOOLEAN DEFAULT TRUE,
  access_password TEXT,
  documents JSONB DEFAULT '[]', -- Array of document metadata
  visitor_logs JSONB DEFAULT '[]', -- Track who accessed
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================
-- 3. Risk Management
-- ====================

CREATE TABLE IF NOT EXISTS risk_thresholds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  risk_type TEXT NOT NULL CHECK (risk_type IN ('runway', 'customer_concentration', 'vendor_payment', 'burn_rate', 'cash_balance', 'custom')),
  threshold_name TEXT NOT NULL,
  threshold_condition TEXT NOT NULL, -- e.g., 'runway_months < 9', 'customer_revenue_pct > 20'
  threshold_value NUMERIC NOT NULL,
  alert_severity TEXT NOT NULL CHECK (alert_severity IN ('low', 'medium', 'high', 'critical')),
  notification_channels JSONB DEFAULT '["chat"]', -- ['chat', 'email', 'sms']
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS risk_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  risk_threshold_id UUID REFERENCES risk_thresholds(id) ON DELETE SET NULL,
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  current_value NUMERIC,
  threshold_value NUMERIC,
  data_snapshot JSONB DEFAULT '{}', -- Full context of the alert
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved', 'snoozed')),
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  snoozed_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================
-- 4. Cap Table & Equity
-- ====================

CREATE TABLE IF NOT EXISTS cap_table_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  snapshot_name TEXT NOT NULL,
  snapshot_type TEXT NOT NULL CHECK (snapshot_type IN ('current', 'scenario', 'historical')),
  valuation_pre_money NUMERIC,
  valuation_post_money NUMERIC,
  total_shares_outstanding BIGINT NOT NULL,
  stakeholders JSONB NOT NULL DEFAULT '[]', -- Array of stakeholder objects
  option_pool_size NUMERIC, -- Percentage
  option_pool_allocated NUMERIC,
  funding_round TEXT, -- e.g., 'Seed', 'Series A'
  notes TEXT,
  is_current BOOLEAN DEFAULT FALSE,
  effective_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS equity_scenarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  scenario_name TEXT NOT NULL,
  base_cap_table_id UUID REFERENCES cap_table_snapshots(id),
  new_investment_amount NUMERIC NOT NULL,
  pre_money_valuation NUMERIC NOT NULL,
  post_money_valuation NUMERIC,
  new_option_pool_pct NUMERIC,
  dilution_analysis JSONB NOT NULL DEFAULT '{}', -- Before/after ownership
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================
-- 5. Strategic Insights
-- ====================

CREATE TABLE IF NOT EXISTS strategic_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL CHECK (insight_type IN ('profitability', 'efficiency', 'growth', 'risk', 'opportunity')),
  title TEXT NOT NULL,
  insight_text TEXT NOT NULL,
  data_points JSONB DEFAULT '{}', -- Key numbers backing the insight
  recommendations JSONB DEFAULT '[]', -- Array of actionable recommendations
  confidence_score NUMERIC(3,2) DEFAULT 0.80,
  impact_score INTEGER DEFAULT 5 CHECK (impact_score BETWEEN 1 AND 10), -- 1=low, 10=high
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'implemented', 'dismissed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================
-- 6. Chat History (Enhanced)
-- ====================

CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'insight', 'warning', 'recommendation', 'scenario_analysis', 'kpi_dashboard', 'alert', 'cap_table', 'chart')),
  structured_data JSONB DEFAULT '{}', -- For rich responses (charts, tables, actions)
  context_data JSONB DEFAULT '{}', -- Financial context at time of message
  parent_message_id UUID REFERENCES chat_messages(id), -- For threading
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================
-- Indexes for Performance
-- ====================

CREATE INDEX idx_financial_forecasts_company ON financial_forecasts(company_id, created_at DESC);
CREATE INDEX idx_scenarios_company ON scenarios(company_id, created_at DESC);
CREATE INDEX idx_investor_kpis_company ON investor_kpis(company_id, period_end DESC);
CREATE INDEX idx_risk_alerts_company_status ON risk_alerts(company_id, status, created_at DESC);
CREATE INDEX idx_risk_thresholds_company_active ON risk_thresholds(company_id, is_active);
CREATE INDEX idx_cap_table_snapshots_company ON cap_table_snapshots(company_id, is_current DESC);
CREATE INDEX idx_strategic_insights_company ON strategic_insights(company_id, status, created_at DESC);
CREATE INDEX idx_chat_messages_company ON chat_messages(company_id, created_at DESC);

-- ====================
-- Row Level Security
-- ====================

ALTER TABLE financial_forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE investor_kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_thresholds ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cap_table_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE equity_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategic_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies (users can only access their company's data)
CREATE POLICY financial_forecasts_policy ON financial_forecasts
  FOR ALL USING (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));

CREATE POLICY scenarios_policy ON scenarios
  FOR ALL USING (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));

CREATE POLICY investor_kpis_policy ON investor_kpis
  FOR ALL USING (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));

CREATE POLICY data_rooms_policy ON data_rooms
  FOR ALL USING (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));

CREATE POLICY risk_thresholds_policy ON risk_thresholds
  FOR ALL USING (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));

CREATE POLICY risk_alerts_policy ON risk_alerts
  FOR ALL USING (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));

CREATE POLICY cap_table_snapshots_policy ON cap_table_snapshots
  FOR ALL USING (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));

CREATE POLICY equity_scenarios_policy ON equity_scenarios
  FOR ALL USING (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));

CREATE POLICY strategic_insights_policy ON strategic_insights
  FOR ALL USING (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));

CREATE POLICY chat_messages_policy ON chat_messages
  FOR ALL USING (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));

-- ====================
-- Seed Default Risk Thresholds
-- ====================

-- This function creates default risk thresholds for new companies
CREATE OR REPLACE FUNCTION create_default_risk_thresholds()
RETURNS TRIGGER AS $$
BEGIN
  -- Runway threshold
  INSERT INTO risk_thresholds (company_id, risk_type, threshold_name, threshold_condition, threshold_value, alert_severity)
  VALUES (NEW.id, 'runway', 'Low Runway Alert', 'runway_months < 9', 9, 'high');
  
  -- Customer concentration threshold
  INSERT INTO risk_thresholds (company_id, risk_type, threshold_name, threshold_condition, threshold_value, alert_severity)
  VALUES (NEW.id, 'customer_concentration', 'Customer Concentration Risk', 'customer_revenue_pct > 20', 20, 'medium');
  
  -- High vendor payment threshold
  INSERT INTO risk_thresholds (company_id, risk_type, threshold_name, threshold_condition, threshold_value, alert_severity)
  VALUES (NEW.id, 'vendor_payment', 'Large Payment Alert', 'payment_amount > 10000', 10000, 'medium');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create thresholds for new companies
CREATE TRIGGER create_default_thresholds_trigger
  AFTER INSERT ON companies
  FOR EACH ROW
  EXECUTE FUNCTION create_default_risk_thresholds();

COMMENT ON TABLE financial_forecasts IS 'Stores AI-generated financial forecasts and projections';
COMMENT ON TABLE scenarios IS 'What-if scenario models for financial planning';
COMMENT ON TABLE investor_kpis IS 'Key performance indicators tracked for investor reporting';
COMMENT ON TABLE risk_alerts IS 'Automated financial risk alerts and warnings';
COMMENT ON TABLE cap_table_snapshots IS 'Company equity ownership snapshots and scenarios';
COMMENT ON TABLE strategic_insights IS 'AI-generated strategic business insights';
COMMENT ON TABLE chat_messages IS 'Enhanced chat history with rich message types';
