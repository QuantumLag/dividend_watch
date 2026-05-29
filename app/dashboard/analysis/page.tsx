'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  PieChart,
  TrendingUp,
  DollarSign,
  BarChart3,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface SectorData {
  sector: string
  income: number
  percentage: number
}

interface HoldingDetail {
  ticker: string
  shares: number
  annualDividendPerShare: number
  annualIncome: number
  monthlyAverage: number
  nextPaymentDate: string | null
  nextPaymentAmount: number | null
  sector: string
  yield: number
}

interface PortfolioAnalysis {
  portfolio: string
  totalHoldings: number
  totalAnnualIncome: number
  monthlyAverageIncome: number
  estimatedYield: number
  sectorBreakdown: Record<string, number>
  topSectors: SectorData[]
  holdingDetails: HoldingDetail[]
  nextDividendDate: string | null
  nextDividendAmount: number
  lastUpdated: string
}

export default function PortfolioAnalysisPage() {
  const [analysis, setAnalysis] = useState<PortfolioAnalysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [portfolioId, setPortfolioId] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    loadAnalysis()
  }, [])

  async function loadAnalysis() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get first portfolio
      const { data: portfolios } = await supabase
        .from('portfolios')
        .select('id')
        .eq('user_id', user.id)
        .limit(1)

      if (!portfolios || portfolios.length === 0) {
        setError('No portfolio found')
        setLoading(false)
        return
      }

      setPortfolioId(portfolios[0].id)

      const response = await fetch(
        `/api/portfolio/analysis?portfolioId=${portfolios[0].id}`
      )
      if (response.ok) {
        const data = await response.json()
        setAnalysis(data)
      } else {
        setError('Failed to load portfolio analysis')
      }
    } catch (err) {
      console.error('Error loading analysis:', err)
      setError('Error loading portfolio analysis')
    } finally {
      setLoading(false)
    }
  }

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !analysis) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h3 className="font-semibold text-foreground">Error</h3>
          <p className="text-sm text-muted-foreground mt-1">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
          Portfolio Analysis
        </h1>
        <p className="text-muted-foreground mt-1">
          Detailed breakdown of your dividend income by sector and holding
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Annual Income',
            value: formatCurrency(analysis.totalAnnualIncome),
            icon: DollarSign,
            color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400',
          },
          {
            label: 'Monthly Average',
            value: formatCurrency(analysis.monthlyAverageIncome),
            icon: TrendingUp,
            color: 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400',
          },
          {
            label: 'Estimated Yield',
            value: `${analysis.estimatedYield.toFixed(2)}%`,
            icon: BarChart3,
            color: 'bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400',
          },
          {
            label: 'Total Holdings',
            value: analysis.totalHoldings.toString(),
            icon: PieChart,
            color: 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400',
          },
        ].map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-card border border-border rounded-xl p-5"
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${metric.color}`}>
              <metric.icon className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold text-foreground">{metric.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{metric.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Sector Breakdown */}
      {analysis.topSectors.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card border border-border rounded-xl p-6"
        >
          <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-primary" />
            Sector Breakdown
          </h2>

          <div className="space-y-4">
            {analysis.topSectors.map((sector, index) => (
              <div key={sector.sector} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{sector.sector}</span>
                  <span className="text-sm text-muted-foreground">
                    {formatCurrency(sector.income)} ({sector.percentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${sector.percentage}%` }}
                    transition={{ delay: 0.5 + index * 0.1, duration: 0.8 }}
                    className="h-full bg-gradient-to-r from-primary to-primary/50"
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Holdings Detail */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-card border border-border rounded-xl overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-border bg-muted/30">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Holdings Detail
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                <th className="text-left px-6 py-3 font-medium text-muted-foreground">Ticker</th>
                <th className="text-left px-6 py-3 font-medium text-muted-foreground">Shares</th>
                <th className="text-right px-6 py-3 font-medium text-muted-foreground">Annual Div/Share</th>
                <th className="text-right px-6 py-3 font-medium text-muted-foreground">Annual Income</th>
                <th className="text-right px-6 py-3 font-medium text-muted-foreground">Monthly Avg</th>
                <th className="text-left px-6 py-3 font-medium text-muted-foreground">Sector</th>
                <th className="text-right px-6 py-3 font-medium text-muted-foreground">Yield</th>
              </tr>
            </thead>
            <tbody>
              {analysis.holdingDetails.map((holding, index) => (
                <tr
                  key={holding.ticker}
                  className="border-b border-border hover:bg-muted/30 transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-foreground">{holding.ticker}</td>
                  <td className="px-6 py-4 text-foreground">
                    {Number(holding.shares).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right text-foreground">
                    ${holding.annualDividendPerShare.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-right text-emerald-600 dark:text-emerald-400 font-medium">
                    {formatCurrency(holding.annualIncome)}
                  </td>
                  <td className="px-6 py-4 text-right text-foreground">
                    {formatCurrency(holding.monthlyAverage)}
                  </td>
                  <td className="px-6 py-4 text-foreground">
                    <span className="inline-block px-2.5 py-1 bg-muted text-muted-foreground rounded text-xs">
                      {holding.sector}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-foreground">
                    {holding.yield.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Next Dividend */}
      {analysis.nextDividendDate && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-6"
        >
          <h3 className="font-semibold text-foreground mb-2">Next Dividend Payment</h3>
          <p className="text-sm text-muted-foreground">
            {formatDate(analysis.nextDividendDate)} — {formatCurrency(analysis.nextDividendAmount)}
          </p>
        </motion.div>
      )}
    </div>
  )
}
