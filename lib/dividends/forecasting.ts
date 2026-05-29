import { DividendData, DividendForecast, PortfolioSummary, PortfolioHolding } from './types'
import { getDividendData, getStockInfo } from './data-provider'

/**
 * Calculate annual dividend per share based on historical dividends
 */
export function calculateAnnualDividendPerShare(dividends: DividendData[]): number {
  if (dividends.length === 0) return 0

  // Group dividends by year
  const byYear: Record<number, number> = {}

  for (const div of dividends) {
    const year = new Date(div.exDate).getFullYear()
    byYear[year] = (byYear[year] || 0) + div.amount
  }

  // Return average of last 2 years if available, otherwise use most recent year
  const years = Object.keys(byYear)
    .map(Number)
    .sort((a, b) => b - a)

  if (years.length === 0) return 0

  let annualDiv = 0
  if (years.length >= 2) {
    annualDiv = (byYear[years[0]] + byYear[years[1]]) / 2
  } else {
    annualDiv = byYear[years[0]]
  }

  return annualDiv
}

/**
 * Calculate projected dividend for a holding
 */
export async function calculateHoldingForecast(
  holding: PortfolioHolding
): Promise<DividendForecast> {
  const dividends = await getDividendData(holding.ticker)

  const annualDividendPerShare = calculateAnnualDividendPerShare(dividends)
  const annualIncome = annualDividendPerShare * holding.shares
  const monthlyAverage = annualIncome / 12

  // Find next payment date
  const today = new Date()
  const futureDividends = dividends.filter((d) => new Date(d.payDate) > today)
  const nextDividend = futureDividends.length > 0 ? futureDividends[0] : null

  return {
    ticker: holding.ticker,
    shares: holding.shares,
    annualDividendPerShare,
    annualIncome,
    monthlyAverage,
    nextPaymentDate: nextDividend?.payDate || null,
    nextPaymentAmount: nextDividend ? nextDividend.amount * holding.shares : 0,
    lastUpdated: new Date().toISOString(),
  }
}

/**
 * Calculate portfolio summary with all forecasts
 */
export async function calculatePortfolioSummary(
  holdings: PortfolioHolding[]
): Promise<PortfolioSummary> {
  // Calculate forecasts for all holdings
  const forecasts = await Promise.all(holdings.map((h) => calculateHoldingForecast(h)))

  // Sum up totals
  const totalAnnualDividends = forecasts.reduce((sum, f) => sum + f.annualIncome, 0)
  const monthlyAverageIncome = totalAnnualDividends / 12

  // Get sector breakdown
  const sectorBreakdown: Record<string, number> = {}
  let totalValue = 0

  for (const holding of holdings) {
    const stockInfo = await getStockInfo(holding.ticker)
    const sector = stockInfo?.sector || 'Unknown'
    const forecast = forecasts.find((f) => f.ticker === holding.ticker)

    if (forecast) {
      sectorBreakdown[sector] = (sectorBreakdown[sector] || 0) + forecast.annualIncome
      totalValue += forecast.annualIncome
    }
  }

  // Calculate weighted average yield
  let totalYield = 0
  let totalShares = 0
  for (const holding of holdings) {
    const forecast = forecasts.find((f) => f.ticker === holding.ticker)
    if (forecast) {
      totalShares += holding.shares
    }
  }

  const yieldPercent = totalShares > 0 ? (totalAnnualDividends / totalValue) * 100 : 0

  // Find next payment across all holdings
  let nextPaymentDate: string | null = null
  let nextPaymentTotal = 0

  for (const forecast of forecasts) {
    if (forecast.nextPaymentDate) {
      if (!nextPaymentDate || forecast.nextPaymentDate < nextPaymentDate) {
        nextPaymentDate = forecast.nextPaymentDate
      }
    }
  }

  // Calculate total for next payment date
  if (nextPaymentDate) {
    for (const forecast of forecasts) {
      if (forecast.nextPaymentDate === nextPaymentDate) {
        nextPaymentTotal += forecast.nextPaymentAmount || 0
      }
    }
  }

  return {
    totalValue,
    totalAnnualDividends,
    monthlyAverageIncome,
    yieldPercent: isNaN(yieldPercent) ? 0 : yieldPercent,
    nextPaymentDate,
    nextPaymentTotal,
    sectorBreakdown,
    forecasts,
  }
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Format date for display
 */
export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(dateString))
}

/**
 * Calculate dividend yield percentage
 */
export function calculateYield(annualDividend: number, currentPrice: number): number {
  if (currentPrice === 0) return 0
  return (annualDividend / currentPrice) * 100
}

/**
 * Get income projection for specific month
 */
export function getMonthlyIncomeProjection(
  forecasts: DividendForecast[],
  monthOffset: number = 0
): number {
  const targetMonth = new Date()
  targetMonth.setMonth(targetMonth.getMonth() + monthOffset)

  let total = 0

  for (const forecast of forecasts) {
    // Estimate monthly income assuming equal distribution
    total += forecast.monthlyAverage
  }

  return total
}

/**
 * Get income projection for specific year
 */
export function getAnnualIncomeProjection(forecasts: DividendForecast[]): number {
  return forecasts.reduce((sum, f) => sum + f.annualIncome, 0)
}
