# Real Company Data Integration Guide

## Overview

Your AI Virtual CFO now supports loading **real financial data** from public companies! This replaces demo data with actual financial statements from companies like Apple, Tesla, Microsoft, and more.

## 🎯 Features

- ✅ Real financial statements from 500+ public companies
- ✅ Income statements, cash flow data, and balance sheets
- ✅ Automatic transformation into transactions and sales records
- ✅ AI-generated insights based on real data
- ✅ Free tier available (250 requests/day)
- ✅ One-click data loading from the dashboard

## 🚀 Quick Start

### Step 1: Get Your Free API Key

1. Visit [Financial Modeling Prep](https://site.financialmodelingprep.com/developer/docs)
2. Sign up for a free account (no credit card required)
3. Navigate to your dashboard to get your API key
4. Free tier includes 250 API calls per day

### Step 2: Add API Key to Environment

Add the following to your `.env.local` file:

```env
# Financial Modeling Prep API (for real company data)
FMP_API_KEY=your_api_key_here
```

### Step 3: Restart Development Server

```bash
npm run dev
```

### Step 4: Load Real Company Data

1. Go to your **Dashboard** (`/dashboard`)
2. Click the **"Load Real Company Data"** button in the top right
3. Select any company from the list
4. Wait for the data to load (usually 5-10 seconds)
5. The page will automatically refresh with real data!

## 📊 Available Companies

The system includes data for these popular companies (and many more):

| Company | Symbol | Industry |
|---------|--------|----------|
| Apple | AAPL | Technology |
| Microsoft | MSFT | Technology |
| Google | GOOGL | Technology |
| Amazon | AMZN | E-commerce |
| Tesla | TSLA | Automotive |
| Meta | META | Social Media |
| NVIDIA | NVDA | Technology |
| Netflix | NFLX | Entertainment |
| Disney | DIS | Entertainment |
| Nike | NKE | Retail |
| Starbucks | SBUX | Food & Beverage |
| Boeing | BA | Aerospace |

## 🔧 How It Works

### Data Transformation Pipeline

```
Financial Modeling Prep API
    ↓
Fetch Company Profile + Financial Statements
    ↓
Transform Income Statements → Transactions
    ↓
Transform Revenue → Sales Records
    ↓
Calculate Financial Metrics
    ↓
Generate AI Insights
    ↓
Populate Your Database
    ↓
Dashboard Updates with Real Data
```

### What Gets Loaded

When you load a company's data, the system:

1. **Updates Company Profile**
   - Company name and industry
   - Employee count
   - Monthly burn rate (calculated)
   - Current cash position (estimated)

2. **Creates Realistic Transactions** (300-600 records)
   - Revenue transactions from income statements
   - Cost of goods sold
   - Operating expenses broken down by category:
     - Payroll (40% of OpEx)
     - Marketing (20% of OpEx)
     - Technology (15% of OpEx)
     - General & Administrative (15% of OpEx)
     - Office & Facilities (10% of OpEx)
   - Distributed across quarterly periods for realism

3. **Generates Sales Records** (50-100 records)
   - Product mix based on revenue
   - Multiple sales channels (Direct, Website, Partner, Referral)
   - Customer attribution

4. **Creates AI Insights** (3-5 insights)
   - Revenue growth analysis
   - Profitability assessment
   - Runway calculations
   - Severity-based alerts

## 💡 Use Cases

### 1. Demo & Presentation
- Show your app with real Fortune 500 company data
- Impress investors and stakeholders
- Realistic data for testing

### 2. Learning & Training
- Study financial patterns of successful companies
- Understand how different industries manage finances
- Compare metrics across companies

### 3. Development & Testing
- Test your app with large datasets
- Verify calculations with known data
- Benchmark your algorithms

## 🎨 Customization

### Load Custom Company

You can load any publicly traded company by their stock symbol:

```typescript
// In your code or API call
const response = await fetch('/api/load-real-company', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    symbol: 'CUSTOM_SYMBOL', // e.g., 'UBER', 'SNAP', 'SHOP'
    clearExisting: true
  })
});
```

### Adjust Data Distribution

Edit `lib/financial-data-transformer.ts` to customize how data is transformed:

```typescript
// Change expense breakdown percentages
const opex = Math.abs(statement.operatingExpenses);

transactions.push({
  description: 'Employee Salaries & Benefits',
  amount: opex * 0.4, // Adjust this percentage
  category: 'Payroll',
  // ...
});
```

### Keep Demo Data

If you want to keep your demo data and add real data:

```typescript
// Set clearExisting to false
body: JSON.stringify({
  symbol: 'AAPL',
  clearExisting: false // Keeps existing transactions
})
```

## 📈 API Endpoints

### Load Real Company Data

**POST** `/api/load-real-company`

```json
{
  "symbol": "AAPL",
  "clearExisting": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully loaded data for Apple Inc.",
  "data": {
    "company": { ... },
    "metrics": { ... },
    "transactionsInserted": 432,
    "salesInserted": 60,
    "insightsGenerated": 3,
    "periodsLoaded": 12
  }
}
```

### List Available Companies

**GET** `/api/load-real-company`

Returns list of pre-configured companies and setup instructions.

## 🔐 Security & Privacy

- ✅ All data comes from public sources (SEC filings)
- ✅ API calls are made from your server (not client)
- ✅ API keys are stored securely in environment variables
- ✅ Row Level Security (RLS) protects your data
- ✅ Each user's data is isolated

## 🐛 Troubleshooting

### "Failed to fetch company data"

**Solution:**
- Check that `FMP_API_KEY` is set in `.env.local`
- Verify the API key is valid
- Ensure you haven't exceeded free tier limit (250/day)

### "Company not found"

**Solution:**
- Verify the stock symbol is correct (e.g., 'AAPL' not 'Apple')
- Check if the company is publicly traded
- Try a different company

### No data showing after load

**Solution:**
- Wait for the automatic page refresh (2 seconds)
- Manually refresh the page
- Check browser console for errors
- Verify you completed onboarding first

### API Rate Limit

**Solution:**
- Free tier: 250 requests/day
- Each data load uses ~5 requests
- Can load ~50 companies per day
- Upgrade to paid plan for more requests

## 📚 Resources

- [Financial Modeling Prep API Docs](https://site.financialmodelingprep.com/developer/docs)
- [Available Endpoints](https://site.financialmodelingprep.com/developer/docs#Company-Financial-Statements)
- [Stock Symbols List](https://www.nasdaq.com/market-activity/stocks/screener)
- [SEC EDGAR Database](https://www.sec.gov/edgar/searchedgar/companysearch) (source of data)

## 🎯 Next Steps

1. **Get API Key**: Sign up at Financial Modeling Prep
2. **Add to .env.local**: Save your API key
3. **Restart Server**: `npm run dev`
4. **Load Data**: Click button on dashboard
5. **Explore**: See real financial data in action!

## 💰 Pricing

### Free Tier
- 250 requests/day
- Historical data (10+ years)
- Quarterly & annual statements
- Perfect for development

### Paid Plans
- Starting at $14/month
- 300-750 requests/day
- Real-time data
- Premium support

## 🤝 Contributing

Want to add support for more data sources? Ideas:

- [ ] Alpha Vantage integration
- [ ] Yahoo Finance scraping
- [ ] SEC EDGAR direct parsing
- [ ] International exchanges
- [ ] Cryptocurrency data
- [ ] Private company estimates

## 📄 License

This integration uses publicly available financial data from SEC filings via Financial Modeling Prep API. All data is subject to their [Terms of Service](https://site.financialmodelingprep.com/terms-of-service).

---

**Ready to use real company data?** Get your API key and start exploring! 🚀




