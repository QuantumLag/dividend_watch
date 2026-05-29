import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verify user
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { portfolioId, ticker, shares, costBasis } = body

    if (!portfolioId || !ticker || !shares) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify portfolio ownership
    const { data: portfolio, error: portfolioError } = await supabase
      .from('portfolios')
      .select('*')
      .eq('id', portfolioId)
      .eq('user_id', user.id)
      .single()

    if (portfolioError || !portfolio) {
      return NextResponse.json(
        { error: 'Portfolio not found' },
        { status: 404 }
      )
    }

    // Check free plan limit (10 holdings)
    const { data: existingHoldings } = await supabase
      .from('holdings')
      .select('*')
      .eq('portfolio_id', portfolioId)

    const { data: profile } = await supabase
      .from('profiles')
      .select('plan')
      .eq('id', user.id)
      .single()

    if (profile?.plan === 'free' && existingHoldings && existingHoldings.length >= 10) {
      return NextResponse.json(
        { error: 'Free plan limited to 10 stocks. Upgrade to Pro for unlimited.' },
        { status: 403 }
      )
    }

    // Add holding
    const { data: holding, error: insertError } = await supabase
      .from('holdings')
      .insert({
        portfolio_id: portfolioId,
        ticker: ticker.toUpperCase(),
        shares: parseFloat(shares),
        cost_basis: costBasis ? parseFloat(costBasis) : null,
      })
      .select()
      .single()

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json(holding, { status: 201 })
  } catch (error) {
    console.error('Error creating holding:', error)
    return NextResponse.json(
      { error: 'Failed to create holding' },
      { status: 500 }
    )
  }
}

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
    const { data: holdings, error } = await supabase
      .from('holdings')
      .select('*')
      .eq('portfolio_id', portfolioId)
      .order('added_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(holdings || [])
  } catch (error) {
    console.error('Error fetching holdings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch holdings' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
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
    const holdingId = searchParams.get('id')

    if (!holdingId) {
      return NextResponse.json({ error: 'Missing holding ID' }, { status: 400 })
    }

    // Verify ownership by checking portfolio
    const { data: holding } = await supabase
      .from('holdings')
      .select('portfolio_id')
      .eq('id', holdingId)
      .single()

    if (!holding) {
      return NextResponse.json(
        { error: 'Holding not found' },
        { status: 404 }
      )
    }

    const { data: portfolio } = await supabase
      .from('portfolios')
      .select('*')
      .eq('id', holding.portfolio_id)
      .eq('user_id', user.id)
      .single()

    if (!portfolio) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Delete holding
    const { error } = await supabase
      .from('holdings')
      .delete()
      .eq('id', holdingId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting holding:', error)
    return NextResponse.json(
      { error: 'Failed to delete holding' },
      { status: 500 }
    )
  }
}
