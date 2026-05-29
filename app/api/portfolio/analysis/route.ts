import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  calculatePortfolioSummary,
  calculateYield,
  getAnnualIncomeProjection,
} from '@/lib/dividends/forecasting'
import { getStockInfo } from '@/lib/dividends/data-provider'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verify user
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const portfolioId = searchParams.get('portfolioId')

    if (!portfolioId) {
      return NextResponse.json(
        { error: 'Missing portfolioId' },
        { status: 400 }
      )
    }

    // Verify portfolio ownership
    const { data: portfolio } = await supabase
      .from('portfolios')
      .select('*')
      .eq('id', portfolioId)
      .eq('user_id', user.id)
      .single()

    if (!portfolio) {
      return NextResponse.json(
        { error: 'Portfolio not found' },
        { status: 404 }
      )
    }

    // Get holdings
    const { data: holdings } = await supabase
      .from('holdings')
      .select('*')
      .eq('portfolio_id', portfolioId)

    if (!holdings || holdings.length === 0) {
      return NextResponse.json({
        portfolio: portfolio.name,
        totalHoldings: 0,
        totalAnnualIncome: 0,
        monthlyAverageIncome: 0,
        estimatedYield: 0,
        sectorBreakdown: {},
        topSectors: [],
        holdingDetails: [],
        nextDividendDate: null,
        nextDividendAmount: 0,
      })
    }

    // Convert to forecast-compatible format
    const formattedHoldings = holdings.map((h) => ({
      id: h.id,
      ticker: h.ticker,
      shares: parseFloat(h.shares),
      costBasis: h.cost_basis ? parseFloat(h.cost_basis) : null,
      addedAt: h.added_at,
    }))

    // Calculate portfolio summary
    const summary = await calculatePortfolioSummary(formattedHoldings)

    // Get detailed holding information
    const holdingDetails = await Promise.all(
      summary.forecasts.map(async (forecast) => {
        const stockInfo = await getStockInfo(forecast.ticker)
        return {
          ticker: forecast.ticker,
          shares: forecast.shares,
          annualDividendPerShare: forecast.annualDividendPerShare,
          annualIncome: forecast.annualIncome,
          monthlyAverage: forecast.monthlyAverage,
          nextPaymentDate: forecast.nextPaymentDate,
          nextPaymentAmount: forecast.nextPaymentAmount,
          sector: stockInfo?.sector || 'Unknown',
          yield: stockInfo?.dividendYield || 0,
        }
      })
    )

    // Calculate top sectors
    const topSectors = Object.entries(summary.sectorBreakdown)
      .map(([sector, income]) => ({
        sector,
        income,
        percentage: (income / summary.totalAnnualDividends) * 100 || 0,
      }))
      .sort((a, b) => b.income - a.income)
      .slice(0, 5)

    return NextResponse.json({
      portfolio: portfolio.name,
      totalHoldings: holdings.length,
      totalAnnualIncome: summary.totalAnnualDividends,
      monthlyAverageIncome: summary.monthlyAverageIncome,
      estimatedYield: summary.yieldPercent,
      sectorBreakdown: summary.sectorBreakdown,
      topSectors,
      holdingDetails,
      nextDividendDate: summary.nextPaymentDate,
      nextDividendAmount: summary.nextPaymentTotal,
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error fetching portfolio analysis:', error)
    return NextResponse.json(
      { error: 'Failed to fetch portfolio analysis' },
      { status: 500 }
    )
  }
}
