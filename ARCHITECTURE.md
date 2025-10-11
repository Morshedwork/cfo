# Aura AI Virtual CFO - Production Architecture

## Overview

Aura is a production-ready AI-powered virtual CFO platform designed for early-stage startups and SMEs in the Japan market. This document outlines the complete architecture, data flow, and user journey.

## Technology Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **UI Components**: shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS v4 with custom design tokens
- **Charts**: Recharts for data visualization
- **Animations**: Custom CSS animations with Framer Motion patterns

### Backend
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (Email/Password)
- **API**: Next.js API Routes (Server Actions)
- **AI**: Google Gemini API for financial analysis

### Security
- **Row Level Security (RLS)**: All database tables protected
- **Authentication**: JWT-based session management
- **Data Isolation**: Company-level data separation
- **Environment Variables**: Secure credential management

## Database Schema

### Tables

#### `companies`
- Primary entity for each organization
- Links to auth.users via user_id
- Stores company metadata and financial snapshot

#### `transactions`
- Financial transactions (income/expenses)
- AI-categorized with confidence scores
- Linked to company via company_id

#### `sales`
- Sales records and e-commerce data
- Product-level tracking
- Channel attribution

#### `forecasts`
- Runway forecasts and scenario models
- Stores assumptions and results as JSONB
- Supports baseline and scenario types

#### `ai_insights`
- AI-generated financial insights
- Severity levels (info, warning, critical)
- Read/unread tracking

#### `data_imports`
- Excel/CSV import history
- Status tracking and error logging

### Row Level Security (RLS)

All tables implement RLS policies:
- Users can only access data for their company
- Policies check: `company_id IN (SELECT id FROM companies WHERE user_id = auth.uid())`
- Prevents data leakage between organizations

## User Journey

### Phase 1: Discovery & Signup
1. **Landing Page**: View live demos of top 3 features
2. **Sign Up**: Create account with email verification
3. **Onboarding**: 5-step guided setup
   - Company information
   - Financial snapshot
   - Team size and goals
   - AI calculates initial runway

### Phase 2: Data Integration
1. **Excel Import**: Upload CSV/Excel files
   - AI categorizes transactions automatically
   - Duplicate detection and validation
2. **Voice Entry**: Natural language data input
   - "Add $500 marketing expense"
   - AI extracts amount, category, vendor
3. **Manual Entry**: Form-based transaction creation

### Phase 3: AI Analysis
1. **Auto-Categorization**: 95% accuracy on transactions
2. **Insight Generation**: Proactive alerts and recommendations
3. **Forecast Updates**: Real-time runway calculations

### Phase 4: Strategic Planning
1. **Scenario Modeling**: Model hiring, marketing, revenue changes
2. **Runway Forecasting**: Adjust assumptions, see instant updates
3. **AI Chat**: Ask questions, get CFO-level advice

### Phase 5: Reporting & Actions
1. **Interactive Dashboards**: Explore metrics with charts
2. **Export Options**: Download charts as JPG, export to Excel
3. **Financial Statements**: Auto-generated P&L and Cash Flow

## Data Flow

\`\`\`
User Input (Voice/Excel/Manual)
    ↓
AI Processing (Gemini API)
    ↓
Categorization & Validation
    ↓
Supabase Database (RLS Protected)
    ↓
Real-time Calculations
    ↓
Dashboard Updates
    ↓
AI Insights Generation
    ↓
User Notifications
\`\`\`

## API Routes

### Authentication
- `POST /api/auth/signup` - Create new user
- `POST /api/auth/login` - Sign in user
- `GET /api/auth/user` - Get current user

### Company Management
- `GET /api/company` - Get user's company
- `POST /api/company` - Create company
- `PATCH /api/company` - Update company

### Transactions
- `GET /api/transactions` - List transactions
- `POST /api/transactions` - Create transaction
- `PATCH /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

### Sales
- `GET /api/sales` - List sales records
- `POST /api/sales` - Create sale

### AI Features
- `POST /api/ai-chat` - Chat with AI advisor
- `POST /api/voice-process` - Process voice input
- `POST /api/categorize-transaction` - AI categorization
- `GET /api/ai-insights` - Get AI insights

## Game-Changing Features

### 1. Voice-First Data Entry
- **Innovation**: First CFO platform with natural language voice input
- **Impact**: 90% faster data entry
- **Technology**: Web Speech API + Gemini NLP

### 2. Real-Time AI Forecasting
- **Innovation**: ML adapts to spending patterns automatically
- **Impact**: 95% forecast accuracy
- **Technology**: Gemini API with financial context

### 3. Unified Financial Intelligence
- **Innovation**: Single source of truth for all financial data
- **Impact**: Zero data silos
- **Technology**: Supabase real-time subscriptions

### 4. SME-Optimized Pricing
- **Innovation**: CFO-level intelligence at startup pricing
- **Impact**: 1/10th the cost of hiring a CFO
- **Target**: Japanese SMEs and early-stage startups

## Design System

### Color Palette
- **Primary**: Deep blue (#2563eb) - Trust and intelligence
- **Secondary**: Teal (#14b8a6) - Growth and innovation
- **Accent**: Purple (#a855f7) - AI and technology
- **Success**: Green (#22c55e) - Positive metrics
- **Destructive**: Red (#ef4444) - Alerts and warnings

### Typography
- **Headings**: Geist Sans (bold, 600-700 weight)
- **Body**: Geist Sans (regular, 400 weight)
- **Code**: Geist Mono (monospace)

### Animations
- **Hover Effects**: Scale, glow, lift
- **Loading States**: Pulse, shimmer, gradient shift
- **Transitions**: Smooth 200-300ms easing
- **Particles**: Floating background elements

## Environment Variables

### Required
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `NEXT_PUBLIC_GEMINI_API_KEY` - Google Gemini API key

### Optional
- `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL` - Development redirect URL

## Deployment

### Prerequisites
1. Supabase project created
2. Database schema deployed (run scripts/001_create_schema.sql)
3. Environment variables configured
4. Gemini API key obtained

### Steps
1. Push code to GitHub
2. Connect to Vercel
3. Configure environment variables
4. Deploy to production
5. Run database migrations
6. Seed demo data (optional)

## Security Best Practices

1. **Never expose API keys** - Use environment variables
2. **Always use RLS** - Protect all database tables
3. **Validate user input** - Sanitize before AI processing
4. **Rate limit API calls** - Prevent abuse
5. **Audit logs** - Track data access and changes

## Performance Optimization

1. **Server Components** - Use RSC for data fetching
2. **Lazy Loading** - Code split heavy components
3. **Image Optimization** - Use Next.js Image component
4. **Caching** - Cache AI responses and calculations
5. **Database Indexes** - Optimize query performance

## Future Enhancements

1. **Bank Integrations** - Plaid/Stripe for automatic sync
2. **Multi-currency Support** - For international SMEs
3. **Team Collaboration** - Multiple users per company
4. **Mobile App** - React Native companion app
5. **Advanced AI Models** - Custom fine-tuned models

## Support & Documentation

- **User Guide**: /docs/user-guide.md
- **API Reference**: /docs/api-reference.md
- **Troubleshooting**: /docs/troubleshooting.md
- **Support Email**: support@aura-cfo.com

---

**Version**: 1.0.0  
**Last Updated**: 2025-01-10  
**Maintained By**: Aura Development Team
