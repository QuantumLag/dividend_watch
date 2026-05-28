'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { TrendingUp, ArrowRight, Play } from 'lucide-react'

interface ParallaxHeroProps {
  onGetStarted: () => void
}

export function ParallaxHero({ onGetStarted }: ParallaxHeroProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%'])
  const yReverse = useTransform(scrollYProgress, [0, 1], ['0%', '-30%'])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9])

  return (
    <section ref={ref} className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
      
      {/* Floating Stats - Parallax Layer - Hidden on mobile */}
      <motion.div style={{ y }} className="absolute inset-0 pointer-events-none hidden lg:block">
        <motion.div
          initial={{ opacity: 0, x: -50, rotate: -5 }}
          animate={{ opacity: 1, x: 0, rotate: 0 }}
          transition={{ delay: 0.5, duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          whileHover={{ scale: 1.05, rotate: 2 }}
          className="absolute top-[20%] left-[8%] bg-card border border-border rounded-xl p-4 shadow-lg"
        >
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <div className="w-2 h-2 rounded-full bg-foreground/40" />
            <span>AAPL</span>
          </div>
          <div className="text-2xl font-semibold text-foreground">$198.45</div>
          <div className="text-sm text-muted-foreground">+2.34 (1.19%)</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50, rotate: 5 }}
          animate={{ opacity: 1, x: 0, rotate: 0 }}
          transition={{ delay: 0.7, duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          whileHover={{ scale: 1.05, rotate: -2 }}
          style={{ y: yReverse }}
          className="absolute top-[15%] right-[10%] bg-card border border-border rounded-xl p-4 shadow-lg"
        >
          <div className="text-sm text-muted-foreground mb-1">Annual Yield</div>
          <div className="text-3xl font-bold text-primary">3.42%</div>
          <div className="text-xs text-muted-foreground">Portfolio Average</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50, rotate: -3 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ delay: 0.9, duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          whileHover={{ scale: 1.05, rotate: 3 }}
          className="absolute bottom-[25%] left-[12%] bg-card border border-border rounded-xl p-4 shadow-lg"
        >
          <div className="text-sm text-muted-foreground mb-2">Monthly Income</div>
          <div className="text-2xl font-semibold text-foreground">$402.50</div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <TrendingUp className="w-4 h-4" />
            <span>+12.4% YoY</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50, rotate: 3 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ delay: 1.1, duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          whileHover={{ scale: 1.05, rotate: -3 }}
          style={{ y: yReverse }}
          className="absolute bottom-[20%] right-[8%] bg-card border border-border rounded-xl p-4 shadow-lg"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="flex -space-x-2">
              {['JNJ', 'KO', 'PG'].map((s, i) => (
                <div key={s} className="w-8 h-8 rounded-full bg-muted border-2 border-card flex items-center justify-center text-xs font-medium">
                  {s.slice(0, 2)}
                </div>
              ))}
            </div>
            <span className="text-sm text-muted-foreground">+5 more</span>
          </div>
          <div className="text-sm font-medium text-foreground">8 Stocks Tracked</div>
        </motion.div>
      </motion.div>

      {/* Main Content */}
      <motion.div 
        style={{ opacity, scale }}
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-20 sm:pt-24"
      >
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-xs sm:text-sm text-primary font-medium mb-4 sm:mb-6"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="hidden sm:inline">Now tracking 5,000+ dividend stocks</span>
            <span className="sm:hidden">5,000+ stocks tracked</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight text-balance"
          >
            Track Your Dividends.
            <span className="block">Predict Your Income.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mt-4 sm:mt-6 text-base sm:text-lg text-muted-foreground max-w-xl mx-auto text-pretty"
          >
            The modern platform for dividend investors. Track ex-dates, calculate yields, 
            and forecast your passive income with precision.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4"
          >
            <button
              onClick={onGetStarted}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-[0.98] text-sm sm:text-base"
            >
              Start Free Trial
              <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5" />
            </button>
            <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 border border-border rounded-xl text-foreground font-medium hover:bg-muted transition-colors text-sm sm:text-base">
              <Play className="w-4 sm:w-5 h-4 sm:h-5" />
              Watch Demo
            </button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mt-6 text-xs sm:text-sm text-muted-foreground"
          >
            No credit card required. 14-day free trial.
          </motion.p>
        </div>
      </motion.div>

      {/* Scroll Indicator - Hidden on mobile */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="hidden md:flex absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <span className="text-xs uppercase tracking-wider">Scroll</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-6 h-10 border-2 border-muted-foreground/30 rounded-full flex justify-center pt-2"
          >
            <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full" />
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}
