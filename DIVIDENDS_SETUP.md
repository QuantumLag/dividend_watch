# Dividend Income Predictor — Complete Setup Guide

This guide covers the new dividend tracking and income prediction features added to DividendWatch.

## ✅ What's Now Implemented

The app now includes a **complete dividend tracking and income forecasting system** that allows investors to:

1. **Track Dividend-Paying Stocks** — Add holdings to your portfolio
2. **Predict Passive Income** — See monthly and annual dividend income projections
3. **View Dividend Calendar** — See ex-dates and payment dates for your holdings
4. **Portfolio Analysis** — Understand income distribution by sector
5. **Real-Time Forecasts** — Updated calculations as you add/remove holdings

## 🚀 Core Features

### 1. Dashboard Overview
- **Annual Income Projection** — Total expected dividends per year
- **Monthly Average** — Average monthly passive income
- **Next Payment Date** — When you'll receive the next dividend
- **Portfolio Insights** — Visual summary of your dividend portfolio

**Location:** `/dashboard`

### 2. Portfolio Tracking
- Add/remove dividend-paying stocks
- Track shares and cost basis
- View all holdings with dividend data

**Location:** `/dashboard/portfolio`

### 3. Dividend Calendar
- Visual calendar showing all ex-dates and payment dates
- Color-coded events:
  - **Green (*)** = Ex-Date (record date for dividends)
  - **Blue (✓)** = Payment Date (cash received)
- Hover over events to see dividend amounts

**Location:** `/dashboard/calendar`

### 4. Portfolio Analysis
- Sector breakdown of dividend income
- Holdings detail table with yields and projections
- Visual charts showing income distribution
- Next upcoming dividend payment amount

**Location:** `/dashboard/analysis`

## 📊 How Income Prediction Works

### Forecasting Engine (`lib/dividends/forecasting.ts`)

1. **Historical Analysis** — Looks at recent dividend history (last 2 years)
2. **Annual Calculation** — Determines average annual dividend per share
3. **Holdings Multiplication** — Annual dividend × shares held = total income
4. **Monthly Averaging** — Annual ÷ 12 = average monthly income
5. **Sector Aggregation** — Groups income by sector

### Example

If you hold:
- **AAPL**: 100 shares @ $0.25/quarter = $100/year
- **JNJ**: 50 shares @ $1.07/quarter = $214/year
- **KO**: 30 shares @ $0.42/quarter = $50.40/year

**Total Annual Income:** $364.40
**Monthly Average:** $30.37

## 🔄 Data Flow

```
User adds stock (AAPL)
    ↓
API calls /api/dividends/AAPL
    ↓
Data provider fetches dividend history (mock or real API)
    ↓
Forecast engine calculates income projections
    ↓
Results cached in Supabase dividends_cache table
    ↓
Dashboard displays real-time predictions
```

## 🛠️ Setup Instructions

### Step 1: Use Mock Data (Default - No Setup Required)

By default, the app uses **mock dividend data** for testing. No API keys needed!

Supported mock tickers:
- AAPL, JNJ, KO, PG, MCD, WMT, O

Just add these to your portfolio to see income predictions immediately.

### Step 2: Connect Real Dividend Data (Optional)

To fetch real dividend data from a provider:

#### Option A: Finnhub (Recommended)

1. Sign up at [finnhub.io](https://finnhub.io) (free tier available)
2. Get your API key from the dashboard
3. Add to `.env.local`:
   ```
   DIVIDEND_API_PROVIDER=finnhub
   NEXT_PUBLIC_DIVIDEND_API_KEY=your_api_key
   ```

#### Option B: Polygon.io

1. Sign up at [polygon.io](https://polygon.io)
2. Get your API key
3. Add to `.env.local`:
   ```
   DIVIDEND_API_PROVIDER=polygon
   DIVIDEND_API_KEY=your_api_key
   ```

#### Option C: EOD Historical Data

1. Sign up at [eodhistoricaldata.com](https://eodhistoricaldata.com)
2. Get your API token
3. Add to `.env.local`:
   ```
   DIVIDEND_API_PROVIDER=eod
   DIVIDEND_API_KEY=your_token
   ```

### Step 3: Enable Automatic Data Sync (Vercel Deployment)

The system includes a **cron job** that automatically syncs dividend data daily.

#### Local Development
No setup required — data syncs on-demand when you view the app.

#### Vercel Deployment

1. Generate a random secret:
   ```bash
   openssl rand -base64 32
   ```

2. Add to Vercel environment variables:
   ```
   CRON_SECRET=your_random_secret
   ```

3. The cron job runs daily at 9 AM UTC
   - Configured in `vercel.json`
   - Accessible at `POST /api/cron/sync-dividends`

## 📁 File Structure

New dividend features:

```
lib/dividends/
  ├── types.ts                 # TypeScript interfaces
  ├── data-provider.ts         # Dividend data fetching (mock + APIs)
  └── forecasting.ts           # Income prediction calculations

app/api/
  ├── dividends/[ticker]/      # GET dividend data for a ticker
  ├── forecast/portfolio/      # GET portfolio income forecast
  ├── holdings/                # CRUD for holdings
  ├── portfolio/analysis/      # GET detailed portfolio analysis
  └── cron/sync-dividends/     # POST trigger manual sync

app/dashboard/
  ├── page.tsx                 # Overview with real predictions
  ├── calendar/page.tsx        # Calendar with dividend events
  ├── analysis/page.tsx        # Portfolio analysis & breakdown
  └── layout.tsx               # Updated with Analysis link
```

## 🧪 Testing

### Test Locally with Mock Data

1. Start the dev server:
   ```bash
   pnpm dev
   ```

2. Create an account and login

3. Add any of these tickers to your portfolio:
   - AAPL, JNJ, KO, PG, MCD, WMT, O

4. Visit:
   - `/dashboard` — See income predictions
   - `/dashboard/calendar` — See dividend events
   - `/dashboard/analysis` — See sector breakdown

### Manual Sync Test

```bash
curl -X POST http://localhost:3000/api/cron/sync-dividends \
  -H "Authorization: Bearer test"
```

## 💡 Key Implementation Details

### Income Calculation
- Uses historical dividend data (last 2 years average)
- Accounts for quarterly, monthly, and annual payment frequencies
- Automatically updates when holdings change

### Caching Strategy
- Dividend data cached in `dividends_cache` table
- Reduces API calls and improves performance
- Cache updates via nightly cron job (or on-demand)

### Security
- Row-level security ensures users only see their portfolio
- Market data (`dividends_cache`) is shared read-only
- Only server-side cron can write to cache

## 🎯 Common Workflows

### Workflow 1: Add a Stock and See Income Projection

1. Go to Dashboard
2. Click "Quick Add Stock"
3. Enter ticker (e.g., "AAPL") and shares
4. Income projection appears instantly

### Workflow 2: Plan Quarterly Income

1. Go to Calendar
2. Navigate through months
3. See all upcoming ex-dates and payment dates
4. Plan cash flow based on payment schedule

### Workflow 3: Optimize Portfolio by Sector

1. Go to Analysis
2. Review sector breakdown
3. See which sectors generate most income
4. Add/remove stocks to rebalance

## ⚙️ API Endpoints Reference

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/dividends/[ticker]` | GET | Fetch dividend data for ticker |
| `/api/forecast/portfolio` | GET | Get portfolio income forecast |
| `/api/holdings` | POST | Add holding |
| `/api/holdings` | GET | List holdings |
| `/api/holdings` | DELETE | Remove holding |
| `/api/portfolio/analysis` | GET | Detailed portfolio analysis |
| `/api/cron/sync-dividends` | POST | Manual data sync |

## 🐛 Troubleshooting

### No dividend data showing?
- Check that you've added holdings to your portfolio
- Refresh the page
- Try with mock tickers (AAPL, JNJ, KO, etc.)

### Calendar empty?
- Add stocks to your portfolio first
- Calendar fetches dividend data from holdings
- May take a few seconds to load

### Income showing as $0?
- Mock data might not exist for that ticker
- Try one of the supported mock tickers
- Or configure a real API provider

## 🚀 Future Enhancements

Potential features to build:
- [ ] Real-time stock prices for yield calculation
- [ ] Dividend growth analysis over time
- [ ] Portfolio optimization recommendations
- [ ] Tax report generation (qualified vs non-qualified)
- [ ] Alerts for dividend increases/cuts
- [ ] Multi-portfolio support (Pro feature)
- [ ] Mobile app
- [ ] Integration with major brokerages

## 📚 References

- [Finnhub API Docs](https://finnhub.io/docs/api)
- [Polygon.io API](https://polygon.io/docs/stocks/)
- [EOD Historical Data API](https://eodhistoricaldata.com/financial-apis/dividends-stocks-api/)
- [Supabase Documentation](https://supabase.com/docs)

## ✨ Summary

DividendWatch now achieves its core mission:

✅ **Track dividend-paying stocks**
✅ **Predict monthly/yearly passive income** 
✅ **View dividend calendar with ex-dates**
✅ **Analyze portfolio by sector**
✅ **Automatic market data sync**

The system works immediately with mock data and can be connected to real APIs for production use.
