'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Loader2,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface DividendEvent {
  ticker: string
  exDate: string
  payDate: string
  amount: number
  type: 'ex' | 'pay'
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

export default function CalendarPage() {
  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [events, setEvents] = useState<Record<string, DividendEvent[]>>({})
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    loadDividendEvents()
  }, [])

  async function loadDividendEvents() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get user's portfolios and holdings
      const { data: portfolios } = await supabase
        .from('portfolios')
        .select('id')
        .eq('user_id', user.id)

      if (!portfolios || portfolios.length === 0) {
        setLoading(false)
        return
      }

      const portfolioIds = portfolios.map(p => p.id)

      // Get all holdings
      const { data: holdings } = await supabase
        .from('holdings')
        .select('ticker')
        .in('portfolio_id', portfolioIds)

      if (!holdings || holdings.length === 0) {
        setLoading(false)
        return
      }

      // Fetch dividend data for each ticker
      const eventsByDate: Record<string, DividendEvent[]> = {}

      for (const holding of holdings) {
        try {
          const response = await fetch(`/api/dividends/${holding.ticker}`)
          if (response.ok) {
            const dividends = await response.json()

            for (const div of dividends) {
              // Add ex-date event
              if (!eventsByDate[div.exDate]) {
                eventsByDate[div.exDate] = []
              }
              eventsByDate[div.exDate].push({
                ticker: holding.ticker,
                exDate: div.exDate,
                payDate: div.payDate,
                amount: div.amount,
                type: 'ex',
              })

              // Add pay-date event
              if (!eventsByDate[div.payDate]) {
                eventsByDate[div.payDate] = []
              }
              eventsByDate[div.payDate].push({
                ticker: holding.ticker,
                exDate: div.exDate,
                payDate: div.payDate,
                amount: div.amount,
                type: 'pay',
              })
            }
          }
        } catch (error) {
          console.error(`Error fetching dividends for ${holding.ticker}:`, error)
        }
      }

      setEvents(eventsByDate)
    } catch (error) {
      console.error('Error loading dividend events:', error)
    } finally {
      setLoading(false)
    }
  }

  const daysInMonth = getDaysInMonth(currentYear, currentMonth)
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth)

  function prevMonth() {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }

  function nextMonth() {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  const isToday = (day: number) =>
    day === today.getDate() &&
    currentMonth === today.getMonth() &&
    currentYear === today.getFullYear()

  // Build calendar grid
  const calendarDays: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) calendarDays.push(null)
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i)

  const getDateKey = (day: number) => {
    return `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

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
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dividend Calendar</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Track ex-dates and payment dates for your holdings
        </p>
      </div>

      {/* Info Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl dark:bg-blue-950 dark:border-blue-900"
      >
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 dark:bg-blue-900">
          <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h3 className="font-medium text-sm text-blue-900 dark:text-blue-100">Dividend Events</h3>
          <p className="text-xs text-blue-800 dark:text-blue-300 mt-0.5">
            {Object.keys(events).length > 0
              ? `Found ${Object.keys(events).length} upcoming dividend events for your holdings`
              : 'Add stocks to your portfolio to see dividend dates'}
          </p>
        </div>
      </motion.div>

      {/* Calendar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card border border-border rounded-xl overflow-hidden"
      >
        {/* Month Navigation */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <button
            onClick={prevMonth}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-semibold text-foreground">
            {MONTH_NAMES[currentMonth]} {currentYear}
          </h2>
          <button
            onClick={nextMonth}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 border-b border-border bg-muted/30">
          {DAY_NAMES.map((day) => (
            <div key={day} className="text-center text-xs font-medium text-muted-foreground uppercase tracking-wider py-3">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, index) => {
            const dateKey = day ? getDateKey(day) : null
            const dayEvents = dateKey ? events[dateKey] || [] : []
            const exEvents = dayEvents.filter(e => e.type === 'ex')
            const payEvents = dayEvents.filter(e => e.type === 'pay')

            return (
              <div
                key={index}
                className={`min-h-[80px] sm:min-h-[100px] border-b border-r border-border p-2 ${
                  day === null ? 'bg-muted/20' : 'hover:bg-muted/30 transition-colors'
                } ${index % 7 === 6 ? 'border-r-0' : ''}`}
              >
                {day !== null && (
                  <div className="flex flex-col h-full">
                    <span
                      className={`text-sm font-medium inline-flex items-center justify-center w-7 h-7 rounded-full ${
                        isToday(day)
                          ? 'bg-primary text-primary-foreground'
                          : 'text-foreground'
                      }`}
                    >
                      {day}
                    </span>
                    <div className="mt-1 space-y-1 text-xs">
                      {exEvents.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {exEvents.map((event, i) => (
                            <div
                              key={i}
                              className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded text-xs truncate dark:bg-emerald-900 dark:text-emerald-200"
                              title={`Ex-Date: ${event.ticker} ($${event.amount.toFixed(2)})`}
                            >
                              {event.ticker}*
                            </div>
                          ))}
                        </div>
                      )}
                      {payEvents.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {payEvents.map((event, i) => (
                            <div
                              key={i}
                              className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded text-xs truncate dark:bg-blue-900 dark:text-blue-200"
                              title={`Payment: ${event.ticker} ($${event.amount.toFixed(2)})`}
                            >
                              {event.ticker}✓
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </motion.div>

      {/* Legend */}
      <div className="flex flex-wrap gap-6 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded dark:bg-emerald-900 dark:text-emerald-200">
            AAPL*
          </div>
          <span>Ex-Date (dividend record date)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-2 py-1 bg-blue-100 text-blue-800 rounded dark:bg-blue-900 dark:text-blue-200">
            AAPL✓
          </div>
          <span>Payment Date (cash received)</span>
        </div>
      </div>
    </div>
  )
}
