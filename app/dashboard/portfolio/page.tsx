'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Trash2,
  Briefcase,
  Loader2,
  Search,
  X,
  AlertCircle,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Holding {
  id: string
  ticker: string
  shares: number
  cost_basis: number | null
  added_at: string
  portfolio_id: string
}

interface Portfolio {
  id: string
  name: string
}

export default function PortfolioPage() {
  const [holdings, setHoldings] = useState<Holding[]>([])
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [ticker, setTicker] = useState('')
  const [shares, setShares] = useState('')
  const [costBasis, setCostBasis] = useState('')
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    setProfile(profileData)

    let { data: portfolios } = await supabase
      .from('portfolios')
      .select('*')
      .eq('user_id', user.id)

    if (!portfolios || portfolios.length === 0) {
      const { data: newPortfolio } = await supabase
        .from('portfolios')
        .insert({ user_id: user.id, name: 'My Portfolio' })
        .select()
        .single()
      portfolios = newPortfolio ? [newPortfolio] : []
    }

    if (portfolios && portfolios.length > 0) {
      setPortfolio(portfolios[0])
      const { data: holdingsData } = await supabase
        .from('holdings')
        .select('*')
        .eq('portfolio_id', portfolios[0].id)
        .order('added_at', { ascending: false })
      setHoldings(holdingsData || [])
    }

    setLoading(false)
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!portfolio) return
    setAdding(true)
    setError(null)

    if (profile?.plan === 'free' && holdings.length >= 10) {
      setError('Free plan limit: 10 stocks max. Upgrade to Pro for unlimited.')
      setAdding(false)
      return
    }

    const { error: insertError } = await supabase.from('holdings').insert({
      portfolio_id: portfolio.id,
      ticker: ticker.toUpperCase().trim(),
      shares: parseFloat(shares),
      cost_basis: costBasis ? parseFloat(costBasis) : null,
    })

    if (insertError) {
      setError(insertError.message)
    } else {
      setTicker('')
      setShares('')
      setCostBasis('')
      setShowAddModal(false)
      await loadData()
    }
    setAdding(false)
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    await supabase.from('holdings').delete().eq('id', id)
    await loadData()
    setDeletingId(null)
  }

  const filteredHoldings = holdings.filter((h) =>
    h.ticker.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Portfolio</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {portfolio?.name || 'My Portfolio'} · {holdings.length} stock{holdings.length !== 1 ? 's' : ''}
            {profile?.plan === 'free' && (
              <span className="text-muted-foreground/60"> · {holdings.length}/10 on Free</span>
            )}
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Stock
        </button>
      </div>

      {/* Free Plan Warning */}
      {profile?.plan === 'free' && holdings.length >= 8 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl"
        >
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-800">
            You're approaching the free plan limit ({holdings.length}/10 stocks).
            {holdings.length >= 10 ? ' Upgrade to Pro to add more.' : ''}
          </p>
        </motion.div>
      )}

      {/* Search */}
      {holdings.length > 0 && (
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search holdings..."
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring transition-all"
          />
        </div>
      )}

      {/* Holdings Table */}
      {holdings.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 bg-card border border-border rounded-xl"
        >
          <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-foreground mb-1">No stocks in your portfolio</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Add your first stock to start tracking dividends
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Your First Stock
          </button>
        </motion.div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">Ticker</th>
                  <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">Shares</th>
                  <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3 hidden sm:table-cell">Cost Basis</th>
                  <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3 hidden md:table-cell">Added</th>
                  <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3 w-16"></th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredHoldings.map((holding, index) => (
                    <motion.tr
                      key={holding.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: index * 0.03 }}
                      className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-muted rounded-lg flex items-center justify-center">
                            <span className="text-xs font-bold text-foreground">{holding.ticker.slice(0, 3)}</span>
                          </div>
                          <span className="font-medium text-sm text-foreground">{holding.ticker}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right text-sm font-medium text-foreground">
                        {Number(holding.shares).toLocaleString()}
                      </td>
                      <td className="px-5 py-4 text-right text-sm text-muted-foreground hidden sm:table-cell">
                        {holding.cost_basis ? `$${Number(holding.cost_basis).toFixed(2)}` : '—'}
                      </td>
                      <td className="px-5 py-4 text-right text-sm text-muted-foreground hidden md:table-cell">
                        {new Date(holding.added_at).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => handleDelete(holding.id)}
                          disabled={deletingId === holding.id}
                          className="p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded-md hover:bg-destructive/10 disabled:opacity-50"
                          title="Remove"
                        >
                          {deletingId === holding.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Stock Modal */}
      <AnimatePresence>
        {showAddModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="w-full max-w-md bg-card rounded-2xl border border-border shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                  <h3 className="font-semibold text-foreground">Add Stock</h3>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={handleAdd} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Ticker Symbol</label>
                    <input
                      type="text"
                      value={ticker}
                      onChange={(e) => setTicker(e.target.value)}
                      placeholder="e.g. AAPL, KO, JNJ"
                      className="w-full px-3 py-2.5 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                      required
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Number of Shares</label>
                    <input
                      type="number"
                      step="any"
                      min="0.01"
                      value={shares}
                      onChange={(e) => setShares(e.target.value)}
                      placeholder="e.g. 100"
                      className="w-full px-3 py-2.5 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Cost Basis <span className="text-muted-foreground font-normal">(optional)</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={costBasis}
                      onChange={(e) => setCostBasis(e.target.value)}
                      placeholder="e.g. 150.00"
                      className="w-full px-3 py-2.5 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                    />
                  </div>
                  {error && <p className="text-sm text-destructive">{error}</p>}
                  <button
                    type="submit"
                    disabled={adding}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-60"
                  >
                    {adding ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Add Stock
                      </>
                    )}
                  </button>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
