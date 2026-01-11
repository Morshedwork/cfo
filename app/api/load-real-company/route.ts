/**
 * API Route to load real company financial data
 * Fetches data from Financial Modeling Prep API and populates the database
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  getCompanyFinancialData,
  DEMO_COMPANIES,
} from '@/lib/financial-data-api';
import {
  incomeStatementToTransactions,
  incomeStatementToSales,
  profileToCompanyData,
  calculateFinancialMetrics,
  distributeTransactionsAcrossQuarter,
} from '@/lib/financial-data-transformer';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get company symbol from request
    const body = await request.json();
    const { symbol, clearExisting = true } = body;

    if (!symbol) {
      return NextResponse.json(
        { error: 'Company symbol is required' },
        { status: 400 }
      );
    }

    // Fetch real financial data
    console.log(`Fetching financial data for ${symbol}...`);
    const financialData = await getCompanyFinancialData(symbol);

    if (!financialData) {
      return NextResponse.json(
        { error: 'Failed to fetch company data. Check if API key is set.' },
        { status: 500 }
      );
    }

    // Get user's company
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (companyError || !company) {
      return NextResponse.json(
        { error: 'Company not found. Please complete onboarding first.' },
        { status: 404 }
      );
    }

    const companyId = company.id;

    // Clear existing data if requested
    if (clearExisting) {
      console.log('Clearing existing transactions and sales...');
      await Promise.all([
        supabase.from('transactions').delete().eq('company_id', companyId),
        supabase.from('sales').delete().eq('company_id', companyId),
      ]);
    }

    // Update company profile with real data
    const companyData = profileToCompanyData(financialData.profile);
    const metrics = calculateFinancialMetrics(
      financialData.incomeStatements,
      financialData.cashFlowStatements
    );

    console.log('Updating company profile...');
    await supabase
      .from('companies')
      .update({
        name: companyData.name,
        industry: companyData.industry,
        team_size: companyData.team_size,
        monthly_burn: metrics?.monthly_burn || company.monthly_burn,
        current_cash: metrics?.current_cash || company.current_cash,
        updated_at: new Date().toISOString(),
      })
      .eq('id', companyId);

    // Transform financial statements to transactions
    console.log('Transforming income statements to transactions...');
    const transactions = incomeStatementToTransactions(
      financialData.incomeStatements
    );

    // Distribute transactions across the quarter for realism
    const distributedTransactions = distributeTransactionsAcrossQuarter(transactions);

    // Add company_id to all transactions
    const transactionsToInsert = distributedTransactions.map((t) => ({
      ...t,
      company_id: companyId,
    }));

    // Insert transactions in batches (Supabase has a limit)
    const batchSize = 100;
    let insertedTransactions = 0;

    console.log(`Inserting ${transactionsToInsert.length} transactions...`);
    for (let i = 0; i < transactionsToInsert.length; i += batchSize) {
      const batch = transactionsToInsert.slice(i, i + batchSize);
      const { error: txError } = await supabase
        .from('transactions')
        .insert(batch);

      if (txError) {
        console.error('Error inserting transactions batch:', txError);
      } else {
        insertedTransactions += batch.length;
      }
    }

    // Transform revenue to sales records
    console.log('Transforming revenue to sales records...');
    const sales = incomeStatementToSales(financialData.incomeStatements);
    const salesToInsert = sales.map((s) => ({
      ...s,
      company_id: companyId,
    }));

    console.log(`Inserting ${salesToInsert.length} sales records...`);
    const { error: salesError } = await supabase
      .from('sales')
      .insert(salesToInsert);

    if (salesError) {
      console.error('Error inserting sales:', salesError);
    }

    // Generate AI insights based on the data
    console.log('Generating AI insights...');
    const insights = generateInsights(
      financialData,
      metrics
    );

    // Insert insights
    const insightsToInsert = insights.map((insight) => ({
      ...insight,
      company_id: companyId,
    }));

    await supabase.from('ai_insights').insert(insightsToInsert);

    return NextResponse.json({
      success: true,
      message: `Successfully loaded data for ${financialData.profile.companyName}`,
      data: {
        company: companyData,
        metrics,
        transactionsInserted: insertedTransactions,
        salesInserted: salesToInsert.length,
        insightsGenerated: insights.length,
        periodsLoaded: financialData.incomeStatements.length,
      },
    });
  } catch (error) {
    console.error('Error loading company data:', error);
    return NextResponse.json(
      { error: 'Failed to load company data', details: String(error) },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to list available companies
 */
export async function GET() {
  return NextResponse.json({
    availableCompanies: DEMO_COMPANIES,
    instructions: 'POST to this endpoint with { symbol: "AAPL" } to load data',
    apiKeyRequired: 'Set FMP_API_KEY in your .env.local',
    getFreeKey: 'https://site.financialmodelingprep.com/developer/docs',
  });
}

/**
 * Generate insights from financial data
 */
function generateInsights(financialData: any, metrics: any) {
  const insights = [];
  const latestIncome = financialData.incomeStatements[0];

  // Revenue growth insight
  if (financialData.incomeStatements.length >= 2) {
    const currentRevenue = financialData.incomeStatements[0].revenue;
    const previousRevenue = financialData.incomeStatements[1].revenue;
    const growth = ((currentRevenue - previousRevenue) / previousRevenue) * 100;

    insights.push({
      type: 'revenue',
      title: growth > 0 ? 'Revenue Growth Detected' : 'Revenue Decline Alert',
      description: `Revenue ${growth > 0 ? 'increased' : 'decreased'} by ${Math.abs(growth).toFixed(1)}% compared to previous quarter. ${
        growth > 10 ? 'Strong performance!' : growth < -10 ? 'Requires attention.' : 'Moderate change.'
      }`,
      severity: growth < -15 ? 'critical' : growth < 0 ? 'warning' : 'info',
      data: { growth, currentRevenue, previousRevenue },
      is_read: false,
    });
  }

  // Profitability insight
  if (latestIncome.netIncome !== undefined) {
    const profitMargin = (latestIncome.netIncome / latestIncome.revenue) * 100;
    insights.push({
      type: 'profitability',
      title: profitMargin > 0 ? 'Profitable Operations' : 'Operating at Loss',
      description: `Net profit margin is ${profitMargin.toFixed(1)}%. ${
        profitMargin > 20
          ? 'Excellent profitability!'
          : profitMargin > 10
          ? 'Good profit margins.'
          : profitMargin > 0
          ? 'Break-even territory.'
          : 'Focus on cost optimization.'
      }`,
      severity: profitMargin < 0 ? 'warning' : 'info',
      data: { profitMargin, netIncome: latestIncome.netIncome },
      is_read: false,
    });
  }

  // Runway insight
  if (metrics?.runway_months) {
    insights.push({
      type: 'runway',
      title: `${metrics.runway_months} Months Runway`,
      description: `Based on current cash and burn rate, estimated runway is ${metrics.runway_months} months. ${
        metrics.runway_months < 6
          ? 'Consider fundraising or cost reduction.'
          : metrics.runway_months < 12
          ? 'Monitor cash flow closely.'
          : 'Healthy runway position.'
      }`,
      severity: metrics.runway_months < 6 ? 'critical' : metrics.runway_months < 12 ? 'warning' : 'info',
      data: metrics,
      is_read: false,
    });
  }

  return insights;
}
