/**
 * Transform real company financial data into our database format
 */

import type { IncomeStatement, CashFlowStatement, CompanyProfile } from './financial-data-api';

export interface TransactionData {
  date: string;
  description: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  payment_method: string;
  vendor: string;
  ai_confidence: number;
  needs_review: boolean;
}

export interface SalesData {
  date: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  channel: string;
  customer_name: string;
  status: string;
}

/**
 * Convert income statements to transactions
 * Creates realistic expense and income transactions based on financial statements
 */
export function incomeStatementToTransactions(
  incomeStatements: IncomeStatement[]
): TransactionData[] {
  const transactions: TransactionData[] = [];

  incomeStatements.forEach((statement) => {
    const date = statement.date;

    // Revenue as income transaction
    if (statement.revenue > 0) {
      transactions.push({
        date,
        description: 'Revenue - Product Sales',
        amount: Math.abs(statement.revenue),
        category: 'Revenue',
        type: 'income',
        payment_method: 'Bank Transfer',
        vendor: 'Various Customers',
        ai_confidence: 1.0,
        needs_review: false,
      });
    }

    // Cost of Revenue as expense
    if (statement.costOfRevenue > 0) {
      transactions.push({
        date,
        description: 'Cost of Goods Sold',
        amount: Math.abs(statement.costOfRevenue),
        category: 'Cost of Revenue',
        type: 'expense',
        payment_method: 'Bank Transfer',
        vendor: 'Suppliers',
        ai_confidence: 1.0,
        needs_review: false,
      });
    }

    // Operating expenses
    if (statement.operatingExpenses > 0) {
      const opex = Math.abs(statement.operatingExpenses);
      
      // Split operating expenses into categories
      transactions.push(
        {
          date,
          description: 'Employee Salaries & Benefits',
          amount: opex * 0.4, // ~40% personnel
          category: 'Payroll',
          type: 'expense',
          payment_method: 'Bank Transfer',
          vendor: 'Payroll Services',
          ai_confidence: 0.95,
          needs_review: false,
        },
        {
          date,
          description: 'Marketing & Advertising',
          amount: opex * 0.2, // ~20% marketing
          category: 'Marketing',
          type: 'expense',
          payment_method: 'Credit Card',
          vendor: 'Marketing Agencies',
          ai_confidence: 0.95,
          needs_review: false,
        },
        {
          date,
          description: 'Technology & Software',
          amount: opex * 0.15, // ~15% tech
          category: 'Technology',
          type: 'expense',
          payment_method: 'Credit Card',
          vendor: 'Cloud Services',
          ai_confidence: 0.95,
          needs_review: false,
        },
        {
          date,
          description: 'General & Administrative',
          amount: opex * 0.15, // ~15% G&A
          category: 'Operations',
          type: 'expense',
          payment_method: 'Bank Transfer',
          vendor: 'Various Vendors',
          ai_confidence: 0.90,
          needs_review: false,
        },
        {
          date,
          description: 'Office & Facilities',
          amount: opex * 0.1, // ~10% facilities
          category: 'Operations',
          type: 'expense',
          payment_method: 'Bank Transfer',
          vendor: 'Property Management',
          ai_confidence: 0.90,
          needs_review: false,
        }
      );
    }
  });

  return transactions;
}

/**
 * Convert revenue data to sales records
 */
export function incomeStatementToSales(
  incomeStatements: IncomeStatement[]
): SalesData[] {
  const salesData: SalesData[] = [];

  incomeStatements.forEach((statement) => {
    if (statement.revenue > 0) {
      const date = statement.date;
      const totalRevenue = statement.revenue;

      // Create product mix based on revenue
      const products = [
        { name: 'Enterprise Plan', percentage: 0.4, channel: 'Direct Sales' },
        { name: 'Professional Plan', percentage: 0.3, channel: 'Website' },
        { name: 'Starter Plan', percentage: 0.15, channel: 'Partner' },
        { name: 'Consulting Services', percentage: 0.1, channel: 'Direct Sales' },
        { name: 'Custom Solutions', percentage: 0.05, channel: 'Referral' },
      ];

      products.forEach((product, index) => {
        const productRevenue = totalRevenue * product.percentage;
        const quantity = Math.floor(Math.random() * 50) + 10;
        const unitPrice = productRevenue / quantity;

        salesData.push({
          date,
          product_name: product.name,
          quantity,
          unit_price: unitPrice,
          total_amount: productRevenue,
          channel: product.channel,
          customer_name: `Customer ${index + 1}`,
          status: 'completed',
        });
      });
    }
  });

  return salesData;
}

/**
 * Generate company metadata from profile
 */
export function profileToCompanyData(profile: CompanyProfile) {
  return {
    name: profile.companyName,
    industry: profile.industry,
    team_size: profile.employees,
    description: profile.description,
    website: profile.website,
    location: `${profile.city}, ${profile.state}, ${profile.country}`,
  };
}

/**
 * Calculate financial metrics from statements
 */
export function calculateFinancialMetrics(
  incomeStatements: IncomeStatement[],
  cashFlowStatements: CashFlowStatement[]
) {
  if (incomeStatements.length === 0) {
    return null;
  }

  const latestIncome = incomeStatements[0];
  const latestCashFlow = cashFlowStatements[0] || null;

  // Calculate monthly averages (assuming quarterly data)
  const monthlyRevenue = latestIncome.revenue / 3;
  const monthlyExpenses = (latestIncome.operatingExpenses + latestIncome.costOfRevenue) / 3;
  const monthlyBurn = monthlyExpenses;

  // Estimate cash from free cash flow
  let estimatedCash = 0;
  if (latestCashFlow) {
    // Estimate: 6 months of operating cash flow
    estimatedCash = Math.abs(latestCashFlow.operatingCashFlow) * 2;
  }

  // Calculate runway (months)
  const runway = monthlyBurn > 0 ? estimatedCash / monthlyBurn : 0;

  return {
    monthly_burn: monthlyBurn,
    current_cash: estimatedCash,
    monthly_revenue: monthlyRevenue,
    runway_months: Math.floor(runway),
  };
}

/**
 * Distribute transactions across the quarter to make data more realistic
 */
export function distributeTransactionsAcrossQuarter(
  transactions: TransactionData[]
): TransactionData[] {
  return transactions.flatMap((transaction) => {
    const baseDate = new Date(transaction.date);
    const distributed: TransactionData[] = [];

    // Split large transactions into weekly occurrences over the quarter
    const weeks = 12; // ~3 months
    const weeklyAmount = transaction.amount / weeks;

    for (let week = 0; week < weeks; week++) {
      const weekDate = new Date(baseDate);
      weekDate.setDate(weekDate.getDate() - (week * 7));

      distributed.push({
        ...transaction,
        date: weekDate.toISOString().split('T')[0],
        amount: weeklyAmount,
        description: `${transaction.description} (Week ${week + 1})`,
      });
    }

    return distributed;
  });
}

