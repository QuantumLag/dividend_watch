import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getDividendDataBatch, getMockTickersForTesting } from '@/lib/dividends/data-provider'

// Verify this is a legitimate cron request from Vercel
function verifyCronSecret(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret) {
    console.warn('CRON_SECRET not set, accepting all cron requests (dev mode)')
    return true
  }

  return authHeader === `Bearer ${cronSecret}`
}

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    if (!verifyCronSecret(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()

    // Get all unique tickers from holdings
    const { data: holdings, error: holdingsError } = await supabase
      .from('holdings')
      .select('ticker')
      .neq('ticker', null)

    if (holdingsError) {
      console.error('Error fetching holdings:', holdingsError)
      return NextResponse.json({ error: holdingsError.message }, { status: 500 })
    }

    // Use mock tickers for demo, or combine with real holdings
    let tickers = holdings?.map((h) => (h as any).ticker) || []
    const mockTickers = getMockTickersForTesting()

    // Combine both, removing duplicates
    tickers = Array.from(new Set([...tickers, ...mockTickers]))

    if (tickers.length === 0) {
      return NextResponse.json({
        status: 'success',
        message: 'No tickers to sync',
        tickersProcessed: 0,
      })
    }

    console.log(`Syncing dividend data for ${tickers.length} tickers...`)

    // Fetch dividend data in batches
    const dividendData = await getDividendDataBatch(tickers.slice(0, 50)) // Limit to 50 to avoid API rate limits

    // Cache dividend data in Supabase
    const cachableData: any[] = []
    for (const [ticker, dividends] of Object.entries(dividendData)) {
      for (const div of dividends as any[]) {
        cachableData.push({
          ticker,
          ex_date: div.exDate,
          pay_date: div.payDate,
          amount: div.amount,
          frequency: div.frequency,
          currency: div.currency,
          fetched_at: new Date().toISOString(),
        })
      }
    }

    if (cachableData.length > 0) {
      const { error: cacheError } = await supabase
        .from('dividends_cache')
        .upsert(cachableData, { onConflict: 'ticker,ex_date' })

      if (cacheError) {
        console.error('Error caching dividend data:', cacheError)
        // Don't fail the job if cache fails
      }
    }

    console.log(`Successfully synced ${Object.keys(dividendData).length} tickers`)

    return NextResponse.json({
      status: 'success',
      message: `Synced ${Object.keys(dividendData).length} tickers`,
      tickersProcessed: Object.keys(dividendData).length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error in cron job:', error)
    return NextResponse.json(
      { error: 'Cron job failed', details: String(error) },
      { status: 500 }
    )
  }
}

/**
 * Cron configuration for Vercel
 * Deploy with: vercel env add CRON_SECRET <random-secret>
 *
 * Add to vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/sync-dividends",
 *     "schedule": "0 9 * * *"
 *   }]
 * }
 */
