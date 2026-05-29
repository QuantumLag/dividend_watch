import { NextRequest, NextResponse } from 'next/server'
import { getDividendData } from '@/lib/dividends/data-provider'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { ticker: string } }
) {
  try {
    const ticker = (params.ticker || '').toUpperCase()

    if (!ticker || ticker.length === 0) {
      return NextResponse.json({ error: 'Invalid ticker' }, { status: 400 })
    }

    // Get dividend data
    const dividends = await getDividendData(ticker)

    if (!dividends || dividends.length === 0) {
      return NextResponse.json(
        { error: 'No dividend data found' },
        { status: 404 }
      )
    }

    // Try to cache in Supabase
    try {
      const supabase = await createClient()
      const { error } = await supabase
        .from('dividends_cache')
        .upsert(
          dividends.map((d) => ({
            ticker: d.ticker,
            ex_date: d.exDate,
            pay_date: d.payDate,
            amount: d.amount,
            frequency: d.frequency,
            currency: d.currency,
            fetched_at: new Date().toISOString(),
          })),
          { onConflict: 'ticker,ex_date' }
        )

      if (error) console.warn('Cache error:', error)
    } catch (cacheError) {
      console.warn('Could not cache dividend data:', cacheError)
      // Don't fail the request, just log the warning
    }

    return NextResponse.json(dividends)
  } catch (error) {
    console.error('Error fetching dividend data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dividend data' },
      { status: 500 }
    )
  }
}
