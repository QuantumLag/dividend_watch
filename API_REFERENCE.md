# API Endpoints Reference

## Dividend Tracking & Income Forecasting APIs

All endpoints are secured with Supabase authentication (requires user session).

### 1. Get Dividend Data for a Ticker

**Endpoint:** `GET /api/dividends/[ticker]`

**Parameters:**
- `ticker` (path) — Stock ticker symbol (e.g., "AAPL")

**Response:**
```json
[
  {
    "ticker": "AAPL",
    "exDate": "2026-05-15",
    "payDate": "2026-05-28",
    "amount": 0.25,
    "frequency": "quarterly",
    "currency": "USD",
    "yieldPercent": 0.38,
    "lastUpdated": "2026-05-29T10:30:00.000Z"
  }
]
```

**Notes:**
- Returns dividend history (usually last 2 years)
- Data cached in `dividends_cache` table
- Fetches from mock provider by default, or configured real API
- Any authenticated user can access (market data is public read)

---

### 2. Get Portfolio Income Forecast

**Endpoint:** `GET /api/forecast/portfolio`

**Response:**
```json
{
  "totalValue": 364.40,
  "totalAnnualDividends": 364.40,
  "monthlyAverageIncome": 30.37,
  "yieldPercent": 2.45,
  "nextPaymentDate": "2026-06-22",
  "nextPaymentTotal": 53.50,
  "sectorBreakdown": {
    "Technology": 100.00,
    "Healthcare": 214.00,
    "Consumer Staples": 50.40
  },
  "forecasts": [
    {
      "ticker": "AAPL",
      "shares": 100,
      "annualDividendPerShare": 1.00,
      "annualIncome": 100.00,
      "monthlyAverage": 8.33,
      "nextPaymentDate": "2026-05-28",
      "nextPaymentAmount": 25.00,
      "lastUpdated": "2026-05-29T10:30:00.000Z"
    }
  ]
}
```

**Notes:**
- Uses user's first portfolio (or primary portfolio)
- Calculates based on current holdings
- Forecasts update in real-time as holdings change
- Returns empty if no holdings

---

### 3. Add a New Holding

**Endpoint:** `POST /api/holdings`

**Body:**
```json
{
  "portfolioId": "uuid-here",
  "ticker": "AAPL",
  "shares": 100,
  "costBasis": 225.50
}
```

**Response:**
```json
{
  "id": "uuid-here",
  "portfolio_id": "uuid-here",
  "ticker": "AAPL",
  "shares": 100,
  "cost_basis": 225.50,
  "added_at": "2026-05-29T10:30:00.000Z"
}
```

**Errors:**
- `400` — Missing required fields
- `401` — Unauthorized
- `403` — Free plan limit (10 stocks max)
- `404` — Portfolio not found

**Notes:**
- Portfolio ownership verified via user session
- Free plan limited to 10 stocks per portfolio
- Returns HTTP 403 if limit exceeded
- Cost basis is optional

---

### 4. List Holdings for a Portfolio

**Endpoint:** `GET /api/holdings?portfolioId={id}`

**Parameters:**
- `portfolioId` (query) — Portfolio ID

**Response:**
```json
[
  {
    "id": "uuid-here",
    "portfolio_id": "uuid-here",
    "ticker": "AAPL",
    "shares": 100,
    "cost_basis": 225.50,
    "added_at": "2026-05-29T10:30:00.000Z"
  }
]
```

**Notes:**
- Only returns holdings for portfolios you own
- Returns empty array if no holdings
- Results ordered by most recent first

---

### 5. Delete a Holding

**Endpoint:** `DELETE /api/holdings?id={holdingId}`

**Parameters:**
- `id` (query) — Holding ID to delete

**Response:**
```json
{
  "success": true
}
```

**Errors:**
- `400` — Missing holding ID
- `401` — Unauthorized
- `404` — Holding not found

**Notes:**
- Verifies ownership before deletion
- Cascading delete handled by Supabase RLS

---

### 6. Get Detailed Portfolio Analysis

**Endpoint:** `GET /api/portfolio/analysis?portfolioId={id}`

**Parameters:**
- `portfolioId` (query) — Portfolio ID

**Response:**
```json
{
  "portfolio": "My Portfolio",
  "totalHoldings": 3,
  "totalAnnualIncome": 364.40,
  "monthlyAverageIncome": 30.37,
  "estimatedYield": 2.45,
  "sectorBreakdown": {
    "Technology": 100.00,
    "Healthcare": 214.00,
    "Consumer Staples": 50.40
  },
  "topSectors": [
    {
      "sector": "Healthcare",
      "income": 214.00,
      "percentage": 58.7
    },
    {
      "sector": "Technology",
      "income": 100.00,
      "percentage": 27.4
    },
    {
      "sector": "Consumer Staples",
      "income": 50.40,
      "percentage": 13.8
    }
  ],
  "holdingDetails": [
    {
      "ticker": "AAPL",
      "shares": 100,
      "annualDividendPerShare": 1.00,
      "annualIncome": 100.00,
      "monthlyAverage": 8.33,
      "nextPaymentDate": "2026-05-28",
      "nextPaymentAmount": 25.00,
      "sector": "Technology",
      "yield": 0.38
    }
  ],
  "nextDividendDate": "2026-06-22",
  "nextDividendAmount": 53.50,
  "lastUpdated": "2026-05-29T10:30:00.000Z"
}
```

**Notes:**
- Enriches forecast data with sector information
- Top 5 sectors returned
- Includes detailed holdings table data
- Used by Analysis dashboard page

---

### 7. Sync Dividend Data (Cron Job)

**Endpoint:** `POST /api/cron/sync-dividends`

**Headers:**
```
Authorization: Bearer {CRON_SECRET}
```

**Response:**
```json
{
  "status": "success",
  "message": "Synced 45 tickers",
  "tickersProcessed": 45,
  "timestamp": "2026-05-29T10:30:00.000Z"
}
```

**Security:**
- Requires `Authorization: Bearer {CRON_SECRET}` header
- CRON_SECRET should be set in environment variables
- Deployed as Vercel cron job (runs daily at 9 AM UTC)
- Can be called manually for testing

**What It Does:**
1. Fetches all unique tickers from all holdings
2. Calls dividend data provider (mock or real API)
3. Caches results in `dividends_cache` table
4. Returns count of synced tickers

**Notes:**
- Limits to 50 tickers per sync (to avoid rate limits)
- Continues even if individual lookups fail
- Uses mock data by default, or configured API provider
- Scheduled via `vercel.json` for daily runs

---

## Database Schema

### dividends_cache
```sql
CREATE TABLE dividends_cache (
  ticker text not null,
  ex_date date,
  pay_date date,
  amount numeric,
  frequency text,
  currency text default 'USD',
  fetched_at timestamptz not null default now(),
  primary key (ticker, ex_date)
);
```

**Row Level Security:** 
- Readable by all authenticated users (market data)
- Only writable by server-side code with secret key

### holdings
```sql
CREATE TABLE holdings (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid not null references portfolios(id) on delete cascade,
  ticker text not null,
  shares numeric not null default 0,
  cost_basis numeric,
  added_at timestamptz not null default now()
);
```

**Row Level Security:**
- Users can only access holdings in portfolios they own

---

## Error Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created (POST) |
| 400 | Bad request (missing/invalid params) |
| 401 | Unauthorized (no session) |
| 403 | Forbidden (exceeds limits) |
| 404 | Not found (resource doesn't exist) |
| 500 | Server error |

---

## Testing Endpoints

### Test with curl

```bash
# Get dividends for AAPL
curl http://localhost:3000/api/dividends/AAPL \
  -H "Authorization: Bearer your_session_token"

# Get portfolio forecast
curl http://localhost:3000/api/forecast/portfolio \
  -H "Authorization: Bearer your_session_token"

# Add a holding
curl -X POST http://localhost:3000/api/holdings \
  -H "Authorization: Bearer your_session_token" \
  -H "Content-Type: application/json" \
  -d '{
    "portfolioId": "your-portfolio-id",
    "ticker": "AAPL",
    "shares": 100,
    "costBasis": 225.50
  }'
```

### Get Session Token

1. Create account via UI at `/dashboard`
2. Open browser DevTools → Application → Cookies
3. Find `sb-XXXX-auth-token` cookie
4. Use value as Bearer token

---

## Rate Limiting & Quotas

- **Mock Data:** No limits
- **Real APIs:** Depends on provider
  - Finnhub: 60 requests/minute (free tier)
  - Polygon: 5 requests/minute (free tier)
  - EOD: 20 requests/day (free tier)

---

## Changelog

### v1.0 (Initial Release)
- Dividend data fetching (mock + 3 API providers)
- Income forecasting and calculations
- Portfolio analysis with sector breakdown
- Dividend calendar with events
- Dashboard predictions
- Automatic cron syncing
- Free tier (10 stocks) and Pro tier support
