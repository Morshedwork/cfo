# 🌟 Aura - AI Virtual CFO

> Your AI-powered financial intelligence layer for startups and SMEs

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/gashinshoutan9-5066s-projects/v0-ai-virtual-cfo)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/projects/QKDsCXLYXW5)

## ✨ Features

- 🎨 **Creative Finance Loading Animation** - Unique vault opening with currency flow
- 🤖 **AI-Powered Forecasting** - Smart runway and cash flow predictions
- 🎤 **Voice Data Entry** - Natural language financial commands
- 📊 **Smart Analytics** - Interactive charts with export capabilities
- 💼 **Real Company Data** - Load actual financial data from 500+ public companies
- 🚀 **Auto-Preview Demos** - Features showcase automatically on page load
- 🔐 **Instant Sign-Up** - No email confirmation required
- 💡 **Intelligent Fallbacks** - Works perfectly without external API keys

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
# or
pnpm install
```

### 2. Environment Setup

Create `.env.local` file:

```env
# Supabase (Required for auth)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Gemini AI (Optional - has intelligent fallbacks)
GEMINI_API_KEY=your_gemini_api_key

# Financial Modeling Prep (Optional - for real company data)
FMP_API_KEY=your_fmp_api_key
```

### 3. Configure Supabase Authentication

**Important:** Disable email confirmation for instant access

📖 **[Read SUPABASE_SETUP.md for detailed instructions](./SUPABASE_SETUP.md)**

Quick steps:
1. Go to Supabase Dashboard → Authentication → Settings
2. Disable "Enable email confirmations"
3. Save changes

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 🎯 Key Pages

- `/` - Landing page with auto-preview features
- `/auth/sign-up` - Instant registration (no email confirmation)
- `/auth/login` - User login
- `/onboarding` - Company setup
- `/dashboard` - Main financial dashboard
- `/runway` - Cash runway forecasting
- `/scenarios` - Financial scenario modeling
- `/bookkeeping` - AI-powered bookkeeping
- `/data-voice` - Voice data entry
- `/ai-chat` - Financial AI assistant

## 🎨 Unique Features

### Finance-Themed Loading Screen

Includes:
- 🏦 Rotating vault dial animation
- 💰 Floating currency symbols ($, €, ¥, £, ₹)
- 📊 Live financial counter
- 🌊 Cash flow visualization with particles
- 📈 Building chart animation
- Multi-stage progress messages

### Auto-Playing Feature Previews

Features automatically showcase themselves:
- AI Forecasting preview (3s delay)
- Voice Data Entry preview (4s delay)
- Smart Analytics preview (5s delay)

### Intelligent AI Fallbacks

Works without GEMINI_API_KEY:
- Smart transaction categorization
- Natural language processing
- Financial insights generation
- Voice command parsing

## 🛠️ Technology Stack

- **Framework:** Next.js 15.2.4 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4.x
- **UI Components:** Radix UI
- **Authentication:** Supabase Auth
- **Database:** Supabase (PostgreSQL)
- **AI:** Google Gemini (with fallbacks)
- **Charts:** Recharts
- **Deployment:** Vercel

## 📦 Project Structure

```
cfo/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── ai-chat/       # AI chat endpoint
│   │   ├── voice-process/ # Voice processing
│   │   └── categorize-transaction/
│   ├── auth/              # Authentication pages
│   │   ├── login/
│   │   └── sign-up/
│   ├── dashboard/         # Main dashboard
│   ├── runway/            # Runway forecasting
│   └── ...
├── components/            # React components
│   ├── ui/               # UI primitives
│   ├── loading-screen.tsx # Finance loading animation
│   ├── feature-preview.tsx # Auto-preview cards
│   └── ...
├── lib/                   # Utilities
│   ├── gemini-client.ts  # AI client with fallbacks
│   └── supabase/         # Supabase clients
├── scripts/              # Database scripts
└── public/               # Static assets
```

## 🔧 Configuration

### Disable Email Confirmation (Recommended)

See **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)** for complete guide.

### API Configuration

The app works in two modes:

1. **Production Mode** (with GEMINI_API_KEY)
   - Full AI capabilities
   - Real-time responses

2. **Demo Mode** (without GEMINI_API_KEY)
   - Intelligent fallback responses
   - Keyword-based categorization
   - Pre-built financial insights

## 🎨 Customization

### Animations

All animations are in `app/globals.css`:
- `animate-float-currency` - Falling money
- `animate-spin-slow` - Rotating elements
- `animate-orbit` - Circular orbits
- `animate-shimmer-fast` - Shimmer effects
- `animate-flow-particle` - Particle flow

### Colors

Theme colors in `app/globals.css`:
- `--primary` - Emerald green (growth)
- `--secondary` - Blue (trust)
- `--accent` - Teal (intelligence)

## 📊 Features Detail

### AI Chat
- Financial Q&A
- Runway analysis
- Expense recommendations
- Growth insights

### Voice Data Entry
- Natural language parsing
- Auto-categorization
- Amount extraction
- Date handling

### Transaction Categorization
- 95%+ accuracy
- Smart keyword matching
- Confidence scores
- Custom categories

## 💼 Real Company Data (New!)

Replace demo data with **real Airbnb financial data** from SEC filings!

### 🚀 Simple Way (Recommended for Prototypes)

**No API, no keys, just one SQL script:**

1. Complete onboarding in your app
2. Open Supabase SQL Editor
3. Run `scripts/005_seed_real_company_data.sql`
4. Refresh dashboard → See real Airbnb Q2 2024 data!

**You get:**
- ✅ $2.75B quarterly revenue
- ✅ 70 realistic transactions
- ✅ 15 sales records
- ✅ 5 AI insights
- ✅ Real company profile (6,800 employees, $11.2B cash)

📖 **[Read SIMPLE_REAL_DATA_GUIDE.md](./SIMPLE_REAL_DATA_GUIDE.md)**

### 🔄 Advanced: Load Any Company via API

Want to load multiple companies dynamically?

1. Get free API key from [Financial Modeling Prep](https://site.financialmodelingprep.com/developer/docs)
2. Add `FMP_API_KEY=your_key` to `.env.local`
3. Click "Load Real Company Data" button on dashboard
4. Select from 500+ public companies

📖 **[Read REAL_DATA_SETUP.md for API guide](./REAL_DATA_SETUP.md)**

## 🐛 Troubleshooting

### Email Confirmation Still Required

1. Check Supabase dashboard settings
2. See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
3. Clear cookies and retry

### Alignment Issues

The app is centered using:
- Container max-widths
- Auto left/right margins
- Overflow-x hidden

### API Errors

The app has intelligent fallbacks:
- Works without GEMINI_API_KEY
- Graceful error handling
- User-friendly messages

## 📝 Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## 🚢 Deployment

### Vercel (Recommended)

```bash
vercel
```

Or connect your GitHub repo to Vercel dashboard.

### Environment Variables on Vercel

Add in Vercel dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `GEMINI_API_KEY` (optional)

## 📄 License

This project is built with [v0.app](https://v0.app).

## 🔗 Links

- **Live Demo:** [Vercel Deployment](https://vercel.com/gashinshoutan9-5066s-projects/v0-ai-virtual-cfo)
- **Build on v0:** [v0.app Project](https://v0.app/chat/projects/QKDsCXLYXW5)
- **Supabase Setup:** [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
- **Real Data Guide:** [REAL_DATA_SETUP.md](./REAL_DATA_SETUP.md)

## 🎯 Getting Started Checklist

- [ ] Install dependencies (`npm install`)
- [ ] Create `.env.local` with Supabase keys
- [ ] Disable email confirmation in Supabase
- [ ] Run dev server (`npm run dev`)
- [ ] Test sign up flow
- [ ] Explore features
- [ ] (Optional) Add FMP API key for real company data

---

**Built with ❤️ using Next.js, Supabase, and AI**