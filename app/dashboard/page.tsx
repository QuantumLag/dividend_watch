'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  DollarSign,
  PieChart,
  Calendar,
  Plus,
  ArrowUpRight,
  Briefcase,
  Loader2,
  Zap,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface Portfolio {
  id: string
  name: string
  created_at: string
}

interface Holding {
  id: string
  ticker: string
  shares: number
  cost_basis: number | null
  added_at: string
}

interface PortfolioSummary {
  totalValue: number
  totalAnnualDividends: number
  monthlyAverageIncome: number
  yieldPercent: number
  nextPaymentDate: string | null
  nextPaymentTotal: number
  sectorBreakdown: Record<string, number>
  forecasts: any[]
}

export default function DashboardOverview() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [holdings, setHoldings] = useState<Holding[]>([])
  const [summary, setSummary] = useState<PortfolioSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [quickTicker, setQuickTicker] = useState('')
  const [quickShares, setQuickShares] = useState('')
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setUser(user)

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    setProfile(profileData)

    // Get or create default portfolio
    let { data: portfolioData } = await supabase
      .from('portfolios')
      .select('*')
      .eq('user_id', user.id)

    if (!portfolioData || portfolioData.length === 0) {
      const { data: newPortfolio } = await supabase
        .from('portfolios')
        .insert({ user_id: user.id, name: 'My Portfolio' })
        .select()
        .single()
      portfolioData = newPortfolio ? [newPortfolio] : []
    }
    setPortfolios(portfolioData || [])

    if (portfolioData && portfolioData.length > 0) {
      const { data: holdingsData } = await supabase
        .from('holdings')
        .select('*')
        .eq('portfolio_id', portfolioData[0].id)
        .order('added_at', { ascending: false })
      setHoldings(holdingsData || [])

      // Fetch portfolio forecast/summary
      try {
        const response = await fetch('/api/forecast/portfolio')
        if (response.ok) {
          const summaryData = await response.json()
          setSummary(summaryData)
        }
      } catch (err) {
        console.error('Error fetching portfolio summary:', err)
      }
    }

    setLoading(false)
  }

  async function handleQuickAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!quickTicker.trim() || !quickShares.trim()) return
    setAdding(true)
    setError(null)

    // Check free plan limit
    if (profile?.plan === 'free' && holdings.length >= 10) {
      setError('Free plan limit reached (10 stocks). Upgrade to Pro for unlimited.')
      setAdding(false)
      return
    }

    const portfolioId = portfolios[0]?.id
    if (!portfolioId) return

    const { error: insertError } = await supabase
      .from('holdings')
      .insert({
        portfolio_id: portfolioId,
        ticker: quickTicker.toUpperCase().trim(),
        shares: parseFloat(quickShares),
      })

    if (insertError) {
      setError(insertError.message)
    } else {
      setQuickTicker('')
      setQuickShares('')
      await loadData()
    }
    setAdding(false)
  }

  const totalHoldings = holdings.length
  const totalShares = holdings.reduce((sum, h) => sum + Number(h.shares), 0)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '—'
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(dateString))
  }

  const summaryCards = [
    {
      label: 'Total Holdings',
      value: totalHoldings.toString(),
      sub: profile?.plan === 'free' ? `${totalHoldings}/10 on Free plan` : 'Unlimited',
      icon: Briefcase,
      color: 'bg-primary/10 text-primary',
    },
    {
      label: 'Annual Income',
      value: summary ? formatCurrency(summary.totalAnnualDividends) : '—',
      sub: 'Based on current yields',
      icon: DollarSign,
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      label: 'Monthly Average',
      value: summary ? formatCurrency(summary.monthlyAverageIncome) : '—',
      sub: 'Projected passive income',
      icon: TrendingUp,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Next Payment',
      value: summary?.nextPaymentDate ? formatDate(summary.nextPaymentDate) : '—',
      sub: summary?.nextPaymentTotal ? `$${summary.nextPaymentTotal.toFixed(2)}` : 'Loading...',
      icon: Calendar,
      color: 'bg-amber-50 text-amber-600',
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
          Welcome back{profile?.full_name ? `, ${profile.full_name}` : ''}
        </h1>
        <p className="text-muted-foreground mt-1">
          Here's an overview of your dividend portfolio
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card, index) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${card.color}`}>
                <card.icon className="w-5 h-5" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold text-foreground">{card.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{card.label}</div>
            <div className="text-xs text-muted-foreground/70 mt-0.5">{card.sub}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Add Stock */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card border border-border rounded-xl p-6"
        >
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Quick Add Stock
          </h2>
          <form onSubmit={handleQuickAdd} className="space-y-3">
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Ticker Symbol</label>
              <input
                type="text"
                value={quickTicker}
                onChange={(e) => setQuickTicker(e.target.value)}
                placeholder="e.g. AAPL"
                className="w-full px-3 py-2.5 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Shares</label>
              <input
                type="number"
                step="any"
                min="0.01"
                value={quickShares}
                onChange={(e) => setQuickShares(e.target.value)}
                placeholder="e.g. 50"
                className="w-full px-3 py-2.5 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                required
              />
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
            <button
              type="submit"
              disabled={adding}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              {adding ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Add to Portfolio
                </>
              )}
            </button>
          </form>
        </motion.div>

        {/* Recent Holdings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 bg-card border border-border rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Recent Holdings</h2>
            <Link
              href="/dashboard/portfolio"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              View all
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          {holdings.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">No holdings yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Add your first stock to start tracking dividends
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {holdings.slice(0, 5).map((holding, index) => (
                <motion.div
                  key={holding.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.05 }}
                  className="flex items-center justify-between py-3 px-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                      <span className="text-xs font-bold text-foreground">{holding.ticker.slice(0, 3)}</span>
                    </div>
                    <div>
                      <div className="font-medium text-sm text-foreground">{holding.ticker}</div>
                      <div className="text-xs text-muted-foreground">{Number(holding.shares).toLocaleString()} shares</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-foreground">
                      {holding.cost_basis ? `$${Number(holding.cost_basis).toFixed(2)}` : '—'}
                    </div>
                    <div className="text-xs text-muted-foreground">cost basis</div>
                  </div>
                </motion.div>
              ))}
              {holdings.length > 5 && (
                <Link
                  href="/dashboard/portfolio"
                  className="block text-center text-sm text-muted-foreground hover:text-foreground py-2 transition-colors"
                >
                  +{holdings.length - 5} more holdings →
                </Link>
              )}
            </div>
          )}
        </motion.div>
      </div>

      {/* Market Data & Insights */}
      {summary && summary.forecasts.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4"
        >
          <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Zap className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">Portfolio Insights</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              Your dividend portfolio is projected to generate {formatCurrency(summary.totalAnnualDividends)} annually.
              {summary.yieldPercent > 0 && ` Average yield: ${summary.yieldPercent.toFixed(2)}%.`}
              {summary.nextPaymentDate && ` Next dividend payment on ${formatDate(summary.nextPaymentDate)}.`}
            </p>
          </div>
          <Link
            href="/dashboard/portfolio"
            className="flex-shrink-0 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            View Analysis
          </Link>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-muted/50 border border-border rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4"
        >
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">Add Your First Stock</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              Start tracking dividend-paying stocks to see income projections and analysis.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  )
}
