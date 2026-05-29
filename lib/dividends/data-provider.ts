import { DividendData, StockInfo } from './types'

// Mock dividend data for development and testing
// This covers popular dividend-paying stocks
const MOCK_DIVIDEND_DATA: Record<string, DividendData[]> = {
  'AAPL': [
    {
      ticker: 'AAPL',
      exDate: '2026-05-15',
      payDate: '2026-05-28',
      amount: 0.25,
      frequency: 'quarterly',
      currency: 'USD',
      yieldPercent: 0.38,
      lastUpdated: new Date().toISOString(),
    },
    {
      ticker: 'AAPL',
      exDate: '2026-08-14',
      payDate: '2026-08-27',
      amount: 0.25,
      frequency: 'quarterly',
      currency: 'USD',
      yieldPercent: 0.38,
      lastUpdated: new Date().toISOString(),
    },
  ],
  'JNJ': [
    {
      ticker: 'JNJ',
      exDate: '2026-06-02',
      payDate: '2026-06-22',
      amount: 1.07,
      frequency: 'quarterly',
      currency: 'USD',
      yieldPercent: 2.85,
      lastUpdated: new Date().toISOString(),
    },
    {
      ticker: 'JNJ',
      exDate: '2026-09-02',
      payDate: '2026-09-22',
      amount: 1.07,
      frequency: 'quarterly',
      currency: 'USD',
      yieldPercent: 2.85,
      lastUpdated: new Date().toISOString(),
    },
  ],
  'KO': [
    {
      ticker: 'KO',
      exDate: '2026-06-15',
      payDate: '2026-07-01',
      amount: 0.42,
      frequency: 'quarterly',
      currency: 'USD',
      yieldPercent: 2.92,
      lastUpdated: new Date().toISOString(),
    },
    {
      ticker: 'KO',
      exDate: '2026-09-15',
      payDate: '2026-10-01',
      amount: 0.42,
      frequency: 'quarterly',
      currency: 'USD',
      yieldPercent: 2.92,
      lastUpdated: new Date().toISOString(),
    },
  ],
  'PG': [
    {
      ticker: 'PG',
      exDate: '2026-06-10',
      payDate: '2026-07-16',
      amount: 0.90,
      frequency: 'monthly',
      currency: 'USD',
      yieldPercent: 2.10,
      lastUpdated: new Date().toISOString(),
    },
  ],
  'MCD': [
    {
      ticker: 'MCD',
      exDate: '2026-06-10',
      payDate: '2026-06-29',
      amount: 1.68,
      frequency: 'quarterly',
      currency: 'USD',
      yieldPercent: 2.34,
      lastUpdated: new Date().toISOString(),
    },
  ],
  'WMT': [
    {
      ticker: 'WMT',
      exDate: '2026-06-09',
      payDate: '2026-07-07',
      amount: 0.66,
      frequency: 'quarterly',
      currency: 'USD',
      yieldPercent: 0.70,
      lastUpdated: new Date().toISOString(),
    },
  ],
  'O': [
    {
      ticker: 'O',
      exDate: '2026-06-12',
      payDate: '2026-06-29',
      amount: 0.66,
      frequency: 'monthly',
      currency: 'USD',
      yieldPercent: 3.88,
      lastUpdated: new Date().toISOString(),
    },
  ],
}

const MOCK_STOCK_INFO: Record<string, StockInfo> = {
  'AAPL': { ticker: 'AAPL', sector: 'Technology', currentPrice: 225.50, dividendYield: 0.38 },
  'JNJ': { ticker: 'JNJ', sector: 'Healthcare', currentPrice: 150.00, dividendYield: 2.85 },
  'KO': { ticker: 'KO', sector: 'Consumer Staples', currentPrice: 57.50, dividendYield: 2.92 },
  'PG': { ticker: 'PG', sector: 'Consumer Staples', currentPrice: 171.00, dividendYield: 2.10 },
  'MCD': { ticker: 'MCD', sector: 'Consumer Cyclical', currentPrice: 286.00, dividendYield: 2.34 },
  'WMT': { ticker: 'WMT', sector: 'Consumer Staples', currentPrice: 94.50, dividendYield: 0.70 },
  'O': { ticker: 'O', sector: 'Real Estate', currentPrice: 68.00, dividendYield: 3.88 },
}

/**
 * Get dividend data from mock provider
 * In production, this would call a real API like Finnhub, Polygon, or EOD Historical Data
 */
export async function getDividendData(ticker: string): Promise<DividendData[]> {
  try {
    // Check if we have mock data
    if (MOCK_DIVIDEND_DATA[ticker]) {
      return MOCK_DIVIDEND_DATA[ticker]
    }

    // Try to fetch from real API if available
    const apiKey = process.env.NEXT_PUBLIC_DIVIDEND_API_KEY || process.env.DIVIDEND_API_KEY
    if (apiKey && process.env.DIVIDEND_API_PROVIDER) {
      return await fetchFromRealAPI(ticker, apiKey)
    }

    // Return empty if no data available
    return []
  } catch (error) {
    console.error(`Error fetching dividend data for ${ticker}:`, error)
    // Fall back to mock data if API fails
    return MOCK_DIVIDEND_DATA[ticker] || []
  }
}

/**
 * Get stock information including sector and yield
 */
export async function getStockInfo(ticker: string): Promise<StockInfo | null> {
  try {
    // Check mock data first
    if (MOCK_STOCK_INFO[ticker]) {
      return MOCK_STOCK_INFO[ticker]
    }

    // Try real API
    const apiKey = process.env.NEXT_PUBLIC_DIVIDEND_API_KEY || process.env.DIVIDEND_API_KEY
    if (apiKey && process.env.DIVIDEND_API_PROVIDER) {
      return await fetchStockInfoFromAPI(ticker, apiKey)
    }

    return null
  } catch (error) {
    console.error(`Error fetching stock info for ${ticker}:`, error)
    return MOCK_STOCK_INFO[ticker] || null
  }
}

/**
 * Fetch dividend data from real API
 * Supports multiple providers via environment variable DIVIDEND_API_PROVIDER
 */
async function fetchFromRealAPI(ticker: string, apiKey: string): Promise<DividendData[]> {
  const provider = process.env.DIVIDEND_API_PROVIDER || 'finnhub'

  try {
    if (provider === 'finnhub') {
      return await fetchFromFinnhub(ticker, apiKey)
    } else if (provider === 'polygon') {
      return await fetchFromPolygon(ticker, apiKey)
    } else if (provider === 'eod') {
      return await fetchFromEOD(ticker, apiKey)
    }
  } catch (error) {
    console.error(`Error fetching from ${provider}:`, error)
  }

  return []
}

/**
 * Fetch from Finnhub API
 */
async function fetchFromFinnhub(ticker: string, apiKey: string): Promise<DividendData[]> {
  const response = await fetch(
    `https://finnhub.io/api/v1/stock/dividend?symbol=${ticker}&token=${apiKey}`
  )
  if (!response.ok) return []

  const data = await response.json()
  if (!Array.isArray(data)) return []

  return data.map((item: any) => ({
    ticker,
    exDate: item.exDate,
    payDate: item.payDate || item.exDate,
    amount: item.dividend,
    frequency: 'quarterly',
    currency: 'USD',
    lastUpdated: new Date().toISOString(),
  }))
}

/**
 * Fetch from Polygon API
 */
async function fetchFromPolygon(ticker: string, apiKey: string): Promise<DividendData[]> {
  const response = await fetch(
    `https://api.polygon.io/v3/reference/dividends?ticker=${ticker}&apikey=${apiKey}`
  )
  if (!response.ok) return []

  const data = await response.json()
  if (!data.results) return []

  return data.results.map((item: any) => ({
    ticker,
    exDate: item.ex_dividend_date,
    payDate: item.pay_date || item.ex_dividend_date,
    amount: item.dividend_per_share,
    frequency: 'quarterly',
    currency: 'USD',
    lastUpdated: new Date().toISOString(),
  }))
}

/**
 * Fetch from EOD Historical Data API
 */
async function fetchFromEOD(ticker: string, apiKey: string): Promise<DividendData[]> {
  const response = await fetch(
    `https://eod-cdn.com/api/div/${ticker}?api_token=${apiKey}&period=y`
  )
  if (!response.ok) return []

  const data = await response.json()
  if (!Array.isArray(data)) return []

  return data.map((item: any) => ({
    ticker,
    exDate: item.date,
    payDate: item.date,
    amount: parseFloat(item.value),
    frequency: 'quarterly',
    currency: 'USD',
    lastUpdated: new Date().toISOString(),
  }))
}

/**
 * Fetch stock info from real API
 */
async function fetchStockInfoFromAPI(ticker: string, apiKey: string): Promise<StockInfo | null> {
  const provider = process.env.DIVIDEND_API_PROVIDER || 'finnhub'

  try {
    if (provider === 'finnhub') {
      const response = await fetch(
        `https://finnhub.io/api/v1/stock/profile2?symbol=${ticker}&token=${apiKey}`
      )
      if (!response.ok) return null
      const data = await response.json()
      return {
        ticker,
        sector: data.finnhubIndustry,
        currentPrice: data.metaData?.open,
      }
    }
  } catch (error) {
    console.error(`Error fetching stock info from ${provider}:`, error)
  }

  return null
}

/**
 * Bulk fetch dividend data for multiple tickers
 */
export async function getDividendDataBatch(tickers: string[]): Promise<Record<string, DividendData[]>> {
  const results: Record<string, DividendData[]> = {}

  for (const ticker of tickers) {
    results[ticker] = await getDividendData(ticker)
  }

  return results
}

/**
 * Get all available mock tickers for testing
 */
export function getMockTickersForTesting(): string[] {
  return Object.keys(MOCK_DIVIDEND_DATA)
}
