/**
 * Financial Data API Client
 * Fetches real company financial data from Financial Modeling Prep API
 * Free tier: 250 requests/day
 * Sign up at: https://site.financialmodelingprep.com/developer/docs
 */

const FMP_API_KEY = process.env.FMP_API_KEY || '';
const FMP_BASE_URL = 'https://financialmodelingprep.com/api/v3';

export interface CompanyProfile {
  symbol: string;
  companyName: string;
  industry: string;
  description: string;
  ceo: string;
  employees: number;
  city: string;
  state: string;
  country: string;
  website: string;
}

export interface IncomeStatement {
  date: string;
  revenue: number;
  costOfRevenue: number;
  grossProfit: number;
  operatingExpenses: number;
  netIncome: number;
  period: string;
}

export interface CashFlowStatement {
  date: string;
  operatingCashFlow: number;
  capitalExpenditure: number;
  freeCashFlow: number;
  dividendsPaid: number;
}

export interface FinancialData {
  profile: CompanyProfile;
  incomeStatements: IncomeStatement[];
  cashFlowStatements: CashFlowStatement[];
}

/**
 * Fetch company profile
 */
export async function getCompanyProfile(symbol: string): Promise<CompanyProfile | null> {
  try {
    if (!FMP_API_KEY) {
      console.warn('FMP_API_KEY not set, using demo mode');
      return null;
    }

    const response = await fetch(
      `${FMP_BASE_URL}/profile/${symbol}?apikey=${FMP_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch company profile: ${response.statusText}`);
    }

    const data = await response.json();
    return data[0] || null;
  } catch (error) {
    console.error('Error fetching company profile:', error);
    return null;
  }
}

/**
 * Fetch income statements (quarterly)
 */
export async function getIncomeStatements(
  symbol: string,
  period: 'quarter' | 'annual' = 'quarter',
  limit: number = 12
): Promise<IncomeStatement[]> {
  try {
    if (!FMP_API_KEY) {
      console.warn('FMP_API_KEY not set, using demo mode');
      return [];
    }

    const response = await fetch(
      `${FMP_BASE_URL}/income-statement/${symbol}?period=${period}&limit=${limit}&apikey=${FMP_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch income statements: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching income statements:', error);
    return [];
  }
}

/**
 * Fetch cash flow statements
 */
export async function getCashFlowStatements(
  symbol: string,
  period: 'quarter' | 'annual' = 'quarter',
  limit: number = 12
): Promise<CashFlowStatement[]> {
  try {
    if (!FMP_API_KEY) {
      console.warn('FMP_API_KEY not set, using demo mode');
      return [];
    }

    const response = await fetch(
      `${FMP_BASE_URL}/cash-flow-statement/${symbol}?period=${period}&limit=${limit}&apikey=${FMP_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch cash flow statements: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching cash flow statements:', error);
    return [];
  }
}

/**
 * Get comprehensive financial data for a company
 */
export async function getCompanyFinancialData(
  symbol: string
): Promise<FinancialData | null> {
  try {
    const [profile, incomeStatements, cashFlowStatements] = await Promise.all([
      getCompanyProfile(symbol),
      getIncomeStatements(symbol),
      getCashFlowStatements(symbol),
    ]);

    if (!profile) {
      return null;
    }

    return {
      profile,
      incomeStatements,
      cashFlowStatements,
    };
  } catch (error) {
    console.error('Error fetching company financial data:', error);
    return null;
  }
}

/**
 * Search for companies by name or symbol
 */
export async function searchCompanies(query: string): Promise<Array<{ symbol: string; name: string }>> {
  try {
    if (!FMP_API_KEY) {
      console.warn('FMP_API_KEY not set, using demo mode');
      return [];
    }

    const response = await fetch(
      `${FMP_BASE_URL}/search?query=${encodeURIComponent(query)}&limit=10&apikey=${FMP_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`Failed to search companies: ${response.statusText}`);
    }

    const data = await response.json();
    return data.map((item: any) => ({
      symbol: item.symbol,
      name: item.name,
    }));
  } catch (error) {
    console.error('Error searching companies:', error);
    return [];
  }
}

/**
 * Popular companies to demo (Fortune 500 examples)
 */
export const DEMO_COMPANIES = [
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'MSFT', name: 'Microsoft Corporation' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.' },
  { symbol: 'TSLA', name: 'Tesla Inc.' },
  { symbol: 'META', name: 'Meta Platforms Inc.' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation' },
  { symbol: 'NFLX', name: 'Netflix Inc.' },
  { symbol: 'DIS', name: 'The Walt Disney Company' },
  { symbol: 'NKE', name: 'Nike Inc.' },
];


