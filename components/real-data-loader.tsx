'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Building2, Download, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

const DEMO_COMPANIES = [
  { symbol: 'AAPL', name: 'Apple Inc.', industry: 'Technology' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', industry: 'Technology' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', industry: 'Technology' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', industry: 'E-commerce' },
  { symbol: 'TSLA', name: 'Tesla Inc.', industry: 'Automotive' },
  { symbol: 'META', name: 'Meta Platforms Inc.', industry: 'Social Media' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', industry: 'Technology' },
  { symbol: 'NFLX', name: 'Netflix Inc.', industry: 'Entertainment' },
  { symbol: 'DIS', name: 'The Walt Disney Company', industry: 'Entertainment' },
  { symbol: 'NKE', name: 'Nike Inc.', industry: 'Retail' },
  { symbol: 'SBUX', name: 'Starbucks Corporation', industry: 'Food & Beverage' },
  { symbol: 'BA', name: 'Boeing Company', industry: 'Aerospace' },
];

interface LoadResult {
  success: boolean;
  message: string;
  data?: any;
}

export function RealDataLoader() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [result, setResult] = useState<LoadResult | null>(null);

  const loadCompanyData = async (symbol: string) => {
    setLoading(true);
    setSelectedCompany(symbol);
    setResult(null);

    try {
      const response = await fetch('/api/load-real-company', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symbol,
          clearExisting: true,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          message: data.message,
          data: data.data,
        });

        // Reload page after 2 seconds to show new data
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setResult({
          success: false,
          message: data.error || 'Failed to load company data',
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'Network error. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Load Real Company Data
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Load Real Company Financial Data</DialogTitle>
          <DialogDescription>
            Select a public company to load real financial data from Financial Modeling Prep API.
            This will replace your current demo data with actual financial statements.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* API Key Notice */}
          <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                    API Key Required
                  </p>
                  <p className="text-blue-700 dark:text-blue-300">
                    Get a free API key from{' '}
                    <a
                      href="https://site.financialmodelingprep.com/developer/docs"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline font-medium"
                    >
                      Financial Modeling Prep
                    </a>
                    {' '}and add it to your <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">
                      .env.local
                    </code> as <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">
                      FMP_API_KEY
                    </code>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Company Selection Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {DEMO_COMPANIES.map((company) => (
              <Card
                key={company.symbol}
                className={`cursor-pointer transition-all hover:shadow-md hover:border-primary ${
                  selectedCompany === company.symbol && loading
                    ? 'border-primary bg-primary/5'
                    : ''
                }`}
                onClick={() => !loading && loadCompanyData(company.symbol)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <CardTitle className="text-base">{company.name}</CardTitle>
                        <CardDescription className="text-xs mt-0.5">
                          {company.symbol}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {company.industry}
                    </Badge>
                  </div>
                </CardHeader>
                {selectedCompany === company.symbol && loading && (
                  <CardContent className="pt-0">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading data...
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>

          {/* Result Display */}
          {result && (
            <Card
              className={
                result.success
                  ? 'border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800'
                  : 'border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800'
              }
            >
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  {result.success ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p
                      className={`font-semibold mb-1 ${
                        result.success
                          ? 'text-green-900 dark:text-green-100'
                          : 'text-red-900 dark:text-red-100'
                      }`}
                    >
                      {result.success ? 'Success!' : 'Error'}
                    </p>
                    <p
                      className={`text-sm ${
                        result.success
                          ? 'text-green-700 dark:text-green-300'
                          : 'text-red-700 dark:text-red-300'
                      }`}
                    >
                      {result.message}
                    </p>
                    {result.success && result.data && (
                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="font-medium">Transactions:</span>{' '}
                          {result.data.transactionsInserted}
                        </div>
                        <div>
                          <span className="font-medium">Sales:</span>{' '}
                          {result.data.salesInserted}
                        </div>
                        <div>
                          <span className="font-medium">Insights:</span>{' '}
                          {result.data.insightsGenerated}
                        </div>
                        <div>
                          <span className="font-medium">Periods:</span>{' '}
                          {result.data.periodsLoaded}
                        </div>
                      </div>
                    )}
                    {result.success && (
                      <p className="mt-2 text-xs text-green-600 dark:text-green-400">
                        Refreshing page in 2 seconds...
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Instructions */}
          <Card className="border-muted">
            <CardHeader>
              <CardTitle className="text-sm">How it works</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <ol className="list-decimal list-inside space-y-1">
                <li>Click on any company to load their real financial data</li>
                <li>
                  The system fetches income statements and cash flow data from the last 12 quarters
                </li>
                <li>Financial data is transformed into transactions, sales, and insights</li>
                <li>Your existing demo data will be replaced with real company data</li>
                <li>The page will refresh automatically to show the new data</li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}

