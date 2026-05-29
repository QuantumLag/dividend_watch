import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { calculatePortfolioSummary } from '@/lib/dividends/forecasting'
import { getDividendData } from '@/lib/dividends/data-provider'

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

    // Get user's first portfolio (simplified - in production, handle multiple)
    const { data: portfolios } = await supabase
      .from('portfolios')
      .select('*')
      .eq('user_id', user.id)
      .limit(1)

    if (!portfolios || portfolios.length === 0) {
      return NextResponse.json(
        { error: 'No portfolio found' },
        { status: 404 }
      )
    }

    const portfolioId = portfolios[0].id

    // Get holdings for this portfolio
    const { data: holdings } = await supabase
      .from('holdings')
      .select('*')
      .eq('portfolio_id', portfolioId)

    if (!holdings || holdings.length === 0) {
      return NextResponse.json({
        totalValue: 0,
        totalAnnualDividends: 0,
        monthlyAverageIncome: 0,
        yieldPercent: 0,
        nextPaymentDate: null,
        nextPaymentTotal: 0,
        sectorBreakdown: {},
        forecasts: [],
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

    // Cache in Supabase for performance
    const { error: cacheError } = await supabase
      .from('dividends_cache')
      .upsert(
        formattedHoldings.map((h) => ({
          ticker: h.ticker,
          ex_date: null,
          pay_date: null,
          amount: null,
          frequency: 'quarterly',
          fetched_at: new Date().toISOString(),
        })),
        { onConflict: 'ticker,ex_date' }
      )

    return NextResponse.json(summary)
  } catch (error) {
    console.error('Error calculating forecast:', error)
    return NextResponse.json(
      { error: 'Failed to calculate forecast' },
      { status: 500 }
    )
  }
}
