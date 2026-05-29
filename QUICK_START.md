# Quick Start — Testing the Income Predictor

## ✨ What's Ready Now

Your Dividend-Watch project now includes a **complete income prediction system**. No additional setup needed — it works with mock data immediately!

## 🚀 How to Test

### 1. Start the Development Server
```bash
pnpm dev
```

### 2. Create an Account
- Go to http://localhost:3000
- Click "Get Started" / "Login"
- Create a test account

### 3. Add Your First Stock
- Dashboard shows "Quick Add Stock" form
- Enter ticker: **AAPL**
- Enter shares: **100**
- Click "Add to Portfolio"

### 4. See Income Predictions ✨
Your dashboard will now show:
- **Annual Income:** $100.00 (AAPL pays $1/year per share)
- **Monthly Average:** $8.33 (annualized, divided by 12)
- **Next Payment:** May 28, 2026 ($25.00)

### 5. View Dividend Calendar 📅
- Navigate to "Calendar" in the sidebar
- Green badges (*) show ex-dates (when dividends are recorded)
- Blue badges (✓) show payment dates (when you get paid)
- Hover over badges to see dividend amounts

### 6. Analyze Your Portfolio 📊
- Click "Analysis" in the sidebar
- See sector breakdown of your dividend income
- View detailed table with yields and payment schedules
- Understand which sectors generate most income

## 🧪 Test All Features

Try adding more stocks to see how predictions compound:

| Ticker | Shares | Annual Div | Monthly Avg |
|--------|--------|-----------|-------------|
| AAPL   | 100    | $100      | $8.33       |
| JNJ    | 50     | $214      | $17.83      |
| KO     | 30     | $50.40    | $4.20       |
| **TOTAL** | 180 | **$364.40** | **$30.37** |

## 📊 Dashboard Sections

### Overview (`/dashboard`)
- Summary cards showing total income predictions
- Quick add form for new stocks
- Recent holdings list
- Portfolio insights

### Portfolio (`/dashboard/portfolio`)
- Full list of holdings
- Add/remove stocks
- View cost basis and shares
- Search holdings

### Calendar (`/dashboard/calendar`)
- Monthly view with dividend events
- Ex-dates and payment dates marked
- Navigate between months
- Plan cash flow

### Analysis (`/dashboard/analysis`)
- Sector breakdown with percentages
- Detailed holdings table with yields
- Key metrics visualization
- Next dividend payment preview

### Watchlist (`/dashboard/watchlist`)
- Track stocks you don't own
- Get alerts for dividend changes

## 💡 Key Features

### ✅ Income Forecasting
- Calculates annual dividend income based on holdings
- Shows monthly average passive income
- Updates in real-time as you add/remove stocks

### ✅ Dividend Calendar
- Shows ex-dates and payment dates for all holdings
- Color-coded for easy identification
- Works across multiple months

### ✅ Portfolio Analysis
- Sector breakdown of dividend income
- Yields and payment schedules per holding
- Visual distribution of income

### ✅ Automatic Data
- Uses mock dividend data by default (no API keys)
- Can connect to real APIs (Finnhub, Polygon, EOD)
- Auto-syncs via cron job when deployed

## 🔌 Optional: Connect Real APIs

To use real dividend data instead of mock:

1. Sign up for [Finnhub](https://finnhub.io) (free tier)
2. Get your API key
3. Add to `.env.local`:
   ```
   DIVIDEND_API_PROVIDER=finnhub
   NEXT_PUBLIC_DIVIDEND_API_KEY=your_key
   ```
4. Restart dev server
5. Add any ticker (MSFT, TSLA, VTSAX, etc.)
6. Real dividend data will be fetched

## 📚 Documentation

See [DIVIDENDS_SETUP.md](./DIVIDENDS_SETUP.md) for:
- Detailed setup instructions
- API endpoint reference
- How forecasting works
- Troubleshooting guide
- Deployment instructions

## 🎯 Architecture

```
Dashboard (Real Predictions)
    ↓
Forecasting API (/api/forecast/portfolio)
    ↓
Dividend Data Provider (Mock or Real API)
    ↓
Historical Analysis & Calculations
    ↓
Portfolio Summary Display
```

## ✨ Next Steps

1. **Test locally** — Follow the quick start above
2. **Add different stocks** — Try all mock tickers to see income compound
3. **Check calendar** — Navigate to see dividend events
4. **View analysis** — Review sector breakdown
5. **Deploy** — When ready, push to production with real APIs

## 🐛 Troubleshooting

**Q: Dashboard shows $0 income?**
A: Add holdings first, then refresh. Try AAPL, JNJ, KO, PG, MCD, WMT, or O.

**Q: Calendar is empty?**
A: Add stocks to portfolio first. Calendar needs holdings to fetch dividend data.

**Q: Want real API data?**
A: See [DIVIDENDS_SETUP.md](./DIVIDENDS_SETUP.md) for setup instructions.

## 🎉 You're All Set!

Your passive income predictor is ready to go. Start by adding a few stocks and watch the predictions appear in real-time!

Questions? Check [DIVIDENDS_SETUP.md](./DIVIDENDS_SETUP.md) for comprehensive documentation.
