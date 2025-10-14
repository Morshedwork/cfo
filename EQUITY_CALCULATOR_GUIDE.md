# 💼 Startup Equity & Funding Stage Calculator

## 🎯 What It Does

The **Equity Calculator** is a powerful tool built into the AI Assistant that calculates and visualizes startup equity distribution across multiple funding rounds (Pre-Seed, Seed, Series A, Series B, and beyond).

It shows:
- ✅ **Step-by-step math** for each funding round
- ✅ **Before & After ownership** for all stakeholders
- ✅ **Dilution analysis** with visual breakdowns
- ✅ **Professional insights** about founder control and investor expectations
- ✅ **Downloadable cap table** in CSV format

---

## 🚀 How to Use It

### Option 1: Click the Quick Action

1. Go to **AI Assistant** page:
   ```
   http://localhost:3000/ai-assistant
   ```

2. Click the **"Equity Calculator"** quick action button (⚡ icon)

3. The calculator will instantly show a complete breakdown!

### Option 2: Type Natural Language

Ask the AI Assistant anything about equity:

**Examples:**
```
"Calculate startup equity across Pre-Seed, Seed, Series A, and Series B"
```

```
"Show me equity distribution for multiple funding rounds"
```

```
"Calculate cap table dilution from pre-seed to series B"
```

```
"Model equity distribution with funding rounds"
```

**Keywords that trigger the calculator:**
- `equity` + (`calculate`, `distribution`, `funding round`, `cap table`, or `dilution`)

---

## 📊 What You'll See

### 1. **Key Insights Card** 
Smart analysis including:
- ✅ Founder retention percentage
- 📊 Total investor ownership
- 💡 Dilution assessment
- 📈 Valuation growth
- 🎯 Option pool status

### 2. **Funding Rounds Breakdown**

For each round (Pre-Seed, Seed, Series A, Series B):
- **Valuation Summary**: Pre-money, Investment, Post-money
- **Dilution Badge**: % of equity given to new investor
- **Stakeholder Table**: Shows everyone's ownership after the round
- **Math Explanation**: Complete formulas with actual numbers

**Example:**
```
📐 Calculation:
Post-Money = Pre-Money + Investment
Post-Money = $15M + $5M = $20M

Investor Equity % = Investment ÷ Post-Money × 100
Investor Equity % = $5M ÷ $20M × 100 = 25.00%
```

### 3. **Final Ownership Summary Table**

Evolution of ownership across all rounds:

| Stakeholder | Initial | Pre-Seed | Seed | Series A | Series B |
|-------------|---------|----------|------|----------|----------|
| Founder 1 | 51.0% | 42.5% | 34.0% | 26.2% | 21.8% |
| Founder 2 | 34.0% | 28.3% | 22.7% | 17.5% | 14.6% |
| Investors | — | 16.7% | 33.3% | 48.8% | 57.9% |
| Options | 15.0% | 12.5% | 10.0% | 7.7% | 6.4% |

### 4. **Visual Progress Bars**

Colorful bars showing final ownership percentages:
- 🔵 Blue for founders
- 🟢 Green for early investors
- 🟣 Purple for later investors
- 🟡 Yellow for option pool

### 5. **Educational Context**

- 💡 What dilution means
- 📈 How valuations affect equity
- 🎯 Typical founder retention targets (40-50% by Series B)
- 🌟 Option pool best practices (10-15%)

---

## 🧮 The Math Behind It

### Post-Money Valuation
```
Post-Money Valuation = Pre-Money Valuation + Investment Amount
```

### Investor Equity %
```
Investor Equity % = (Investment ÷ Post-Money) × 100
```

### Share Dilution
```
New Investor Shares = Existing Shares × (Investor% ÷ (100 - Investor%))
```

### Dilution Effect
Everyone's ownership percentage is recalculated:
```
New % = (Old Shares ÷ New Total Shares) × 100
```

---

## 📥 Download Cap Table

Click the **"Download Cap Table (CSV)"** button to export:

**Sample CSV:**
```csv
Stakeholder,Initial,Pre-Seed,Seed,Series A,Series B
Founder 1,51.00%,42.50%,34.00%,26.20%,21.80%
Founder 2,34.00%,28.30%,22.70%,17.50%,14.60%
Pre-Seed Investor,0.00%,16.70%,13.40%,10.30%,8.60%
Seed Investor,0.00%,0.00%,20.00%,15.40%,12.80%
Series A Investor,0.00%,0.00%,0.00%,23.10%,19.30%
Series B Investor,0.00%,0.00%,0.00%,0.00%,16.70%
Employee Option Pool,15.00%,12.50%,10.00%,7.70%,6.40%
```

**Use this for:**
- 📊 Investor presentations
- 💼 Board meetings
- 📈 Financial planning
- 🤝 Founder discussions

---

## 💡 Example Scenario

### Demo Company: "TechStartup"

**Initial Setup:**
- 2 Founders (60/40 split)
- 10,000,000 shares authorized
- 15% Employee Stock Option Pool

**Funding Journey:**

1. **Pre-Seed Round**
   - Pre-Money: $1M
   - Raised: $200K
   - Investor gets: 16.7%
   - Founders diluted to: 83.3% (combined)

2. **Seed Round**
   - Pre-Money: $4M
   - Raised: $1M
   - Investor gets: 20.0%
   - Founders diluted to: 66.6% (combined)

3. **Series A**
   - Pre-Money: $15M
   - Raised: $5M
   - Investor gets: 25.0%
   - Founders diluted to: 50.0% (combined)

4. **Series B**
   - Pre-Money: $50M
   - Raised: $15M
   - Investor gets: 23.1%
   - Founders diluted to: 38.5% (combined)

**Final Result:**
- ✅ Founders retain 38.5% (healthy control)
- 📊 Investors own 61.5% (reasonable for Series B)
- 📈 Valuation grew from $1.2M to $65M (5,317% growth!)
- 💰 Founders' equity value: ~$25M at Series B valuation

---

## 🎯 Benchmarks & Best Practices

### Typical Dilution per Round:
- **Pre-Seed:** 10-20%
- **Seed:** 15-25%
- **Series A:** 20-30%
- **Series B:** 20-25%

### Founder Ownership Targets:
- **After Seed:** 60-80%
- **After Series A:** 50-70%
- **After Series B:** 40-60%
- **After Series C:** 30-50%

### Investor Expectations:
- **Pre-Seed/Seed:** $100K - $2M
- **Series A:** $2M - $15M
- **Series B:** $10M - $50M
- **Series C:** $30M - $100M+

### Option Pool Guidelines:
- **Pre-Seed:** 10-15% (enough for first 10-15 hires)
- **Series A:** Refresh to 10-15%
- **Series B+:** Refresh to 8-12%

---

## 🔧 Customization

Want different numbers? Just ask the AI:

```
"Calculate equity with 3 founders at 40%, 35%, 25%"
```

```
"Model Pre-Seed at $500K valuation raising $100K"
```

```
"Show me with a 20% option pool instead"
```

---

## 🎓 Understanding the Results

### ✅ Good Signs:
- Founders retain 40%+ by Series B
- Dilution decreases in later rounds (higher valuations)
- Option pool sufficient for hiring needs
- Each round's dilution < 30%

### ⚠️ Warning Signs:
- Founders below 30% before Series C
- High dilution (>35%) in a single round
- Option pool below 8%
- Flat or decreasing valuations

### 🚨 Red Flags:
- Founders below 25% ownership
- Investors demanding >40% in one round
- Down rounds (lower valuation than previous)
- Option pool exhausted before next raise

---

## 📚 Related Features

### In AI Assistant:
- **FP&A**: Cash flow forecasting and runway analysis
- **Scenarios**: Model hiring and expense changes
- **Fundraising**: Generate investor KPI dashboards
- **Risk Management**: Monitor financial thresholds
- **Strategic Insights**: Data-driven recommendations

### In Dashboard:
- **Runway Tracker**: See months of runway remaining
- **KPI Widgets**: Track MRR, ARR, burn rate
- **Financial Alerts**: Get notified of critical events

---

## 🎬 Quick Start

1. **Go to AI Assistant:**
   ```
   http://localhost:3000/ai-assistant
   ```

2. **Click "Equity Calculator"** button

3. **View the complete analysis** instantly!

4. **Download the cap table** for your records

5. **Ask follow-up questions:**
   - "What if we raise $10M instead?"
   - "Model with higher pre-money valuation"
   - "Show me with 4 founders"

---

## 💼 Use Cases

### For Founders:
- 📊 Understand dilution before taking investment
- 🎯 Plan funding strategy across multiple rounds
- 💰 Calculate equity value at different valuations
- 🤝 Negotiate better terms with investors

### For CFOs:
- 📈 Model various funding scenarios
- 📊 Create cap tables for board presentations
- 🎯 Advise founders on dilution strategy
- 💼 Prepare materials for due diligence

### For Investors:
- 🔍 Understand ownership structure
- 📊 Evaluate founder retention
- 💰 Model returns at different exit valuations
- 🤝 Assess alignment of incentives

---

## ✨ Pro Tips

1. **Always model before negotiating** - Know your dilution beforehand
2. **Higher valuations = less dilution** - Focus on building value
3. **Refresh option pool pre-money** - Avoids diluting existing shareholders
4. **Plan 3+ rounds ahead** - Ensure founders retain meaningful ownership
5. **Download and save each scenario** - Compare different term sheets

---

**🎉 You now have CFO-level equity analysis at your fingertips!**

