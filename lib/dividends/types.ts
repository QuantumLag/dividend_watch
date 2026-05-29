// Types for dividend tracking and forecasting

export interface DividendData {
  ticker: string
  exDate: string // YYYY-MM-DD
  payDate: string // YYYY-MM-DD
  declarationDate?: string // YYYY-MM-DD
  amount: number // Dividend per share
  frequency: 'quarterly' | 'monthly' | 'annual' | 'semi-annual'
  currency: string
  yieldPercent?: number
  lastUpdated: string
}

export interface PortfolioHolding {
  id: string
  ticker: string
  shares: number
  costBasis: number | null
  currentPrice?: number
  addedAt: string
}

export interface DividendForecast {
  ticker: string
  shares: number
  annualDividendPerShare: number
  annualIncome: number
  monthlyAverage: number
  nextPaymentDate: string | null
  nextPaymentAmount: number | null
  lastUpdated: string
}

export interface PortfolioSummary {
  totalValue: number
  totalAnnualDividends: number
  monthlyAverageIncome: number
  yieldPercent: number
  nextPaymentDate: string | null
  nextPaymentTotal: number
  sectorBreakdown: Record<string, number>
  forecasts: DividendForecast[]
}

export interface StockInfo {
  ticker: string
  sector?: string
  currentPrice?: number
  dividendYield?: number
}
