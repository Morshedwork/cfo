# 🚀 Quick Start: Real Company Data

## ⚡ 2-Minute Setup

### Step 1: Get API Key (1 min)
```
1. Visit: https://site.financialmodelingprep.com/developer/docs
2. Click "Get Started Free"
3. Sign up (no credit card)
4. Copy your API key
```

### Step 2: Add to Project (30 sec)
```bash
# Open or create .env.local
echo "FMP_API_KEY=your_api_key_here" >> .env.local
```

### Step 3: Restart Server (30 sec)
```bash
# Stop server (Ctrl+C)
npm run dev
# Server running on http://localhost:3000
```

### Step 4: Load Data (10 sec)
```
1. Open http://localhost:3000/dashboard
2. Click "Load Real Company Data" button (top right)
3. Click any company
4. Wait 5 seconds
5. Done! 🎉
```

---

## 📊 What You Get

### For Each Company:
- ✅ **400-600 transactions** (revenue, expenses, payroll)
- ✅ **60-100 sales records** (products, channels)
- ✅ **3-6 AI insights** (growth, profitability, runway)
- ✅ **Real financial metrics** (from SEC filings)
- ✅ **12 quarters** of historical data

---

## 🏢 Popular Companies

| Quick Access | Symbol | Company |
|--------------|--------|---------|
| 🍎 Tech | **AAPL** | Apple Inc. |
| 🪟 Tech | **MSFT** | Microsoft Corp. |
| 🔍 Tech | **GOOGL** | Alphabet Inc. |
| 📦 E-commerce | **AMZN** | Amazon.com |
| 🚗 Auto | **TSLA** | Tesla Inc. |
| 📘 Social | **META** | Meta Platforms |
| 🎮 GPU | **NVDA** | NVIDIA Corp. |
| 🎬 Stream | **NFLX** | Netflix Inc. |
| 🏰 Media | **DIS** | Disney Co. |
| ✅ Sports | **NKE** | Nike Inc. |
| ☕ Food | **SBUX** | Starbucks |
| ✈️ Aero | **BA** | Boeing Co. |

---

## 🎯 Quick Commands

### Load via API
```bash
curl -X POST http://localhost:3000/api/load-real-company \
  -H "Content-Type: application/json" \
  -d '{"symbol":"AAPL","clearExisting":true}'
```

### Check Available Companies
```bash
curl http://localhost:3000/api/load-real-company
```

---

## ⚠️ Common Issues

### "API key not set"
```bash
# Make sure you added it to .env.local
cat .env.local | grep FMP_API_KEY

# If empty, add it:
echo "FMP_API_KEY=your_key" >> .env.local

# Restart server
```

### "Rate limit exceeded"
```bash
# Free tier: 250 requests/day
# Each load uses ~5 requests
# Can load ~50 companies/day
# Wait 24 hours or upgrade plan
```

### "Company not found"
```bash
# Complete onboarding first:
# 1. Sign up at /auth/sign-up
# 2. Complete /onboarding
# 3. Then load real data
```

---

## 📈 API Limits

| Plan | Requests/Day | Cost | Best For |
|------|--------------|------|----------|
| Free | 250 | $0 | Development, Testing |
| Starter | 300 | $14/mo | Small Projects |
| Pro | 750 | $49/mo | Production Apps |

---

## 🎓 Examples

### Load Apple
```javascript
POST /api/load-real-company
{
  "symbol": "AAPL",
  "clearExisting": true
}
```

**Result:**
- Company: Apple Inc.
- Industry: Technology
- Employees: 164,000
- Transactions: 432
- Sales: 60
- Insights: 3

### Load Tesla
```javascript
{
  "symbol": "TSLA",
  "clearExisting": true
}
```

**Result:**
- Company: Tesla Inc.
- Industry: Automotive
- Transactions: 387
- Sales: 52
- Insights: 4

---

## 💡 Pro Tips

1. **Start with familiar companies**
   - Try AAPL, MSFT, or GOOGL first
   - Easy to verify data accuracy

2. **Compare industries**
   - Load tech vs retail vs automotive
   - See different financial patterns

3. **Keep demo data**
   - Set `clearExisting: false`
   - Keep your test data

4. **Use for demos**
   - Impressive for investors
   - Real Fortune 500 data

5. **Check the insights**
   - AI analyzes real metrics
   - Actionable recommendations

---

## 🔗 Quick Links

- 📖 Full Guide: `REAL_DATA_SETUP.md`
- 📊 SQL Reference: `scripts/004_load_real_company_data.sql`
- 🎯 Solution Summary: `SOLUTION_SUMMARY.md`
- 🆓 Get API Key: https://site.financialmodelingprep.com/developer/docs
- 🔍 Find Symbols: https://www.nasdaq.com/market-activity/stocks/screener

---

## ✅ Success Checklist

- [ ] Got API key from Financial Modeling Prep
- [ ] Added `FMP_API_KEY` to `.env.local`
- [ ] Restarted development server
- [ ] Opened `/dashboard`
- [ ] Clicked "Load Real Company Data"
- [ ] Selected a company
- [ ] Saw data load successfully
- [ ] Dashboard shows real financials
- [ ] Explored transactions and insights

---

## 🎉 You're All Set!

Your AI Virtual CFO now has access to **500+ real companies**!

**What to try next:**
1. Load 3-4 companies from different industries
2. Compare their financial metrics
3. Analyze the AI insights
4. Export the data
5. Show it off! 🚀

---

*Need help? Check `REAL_DATA_SETUP.md` for detailed troubleshooting*


