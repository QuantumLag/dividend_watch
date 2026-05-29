'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { TrendingUp, Calendar, PieChart, Bell, BarChart3, Globe, Shield, Zap } from 'lucide-react'

const features = [
  {
    icon: TrendingUp,
    title: 'Real-Time Tracking',
    description: 'Monitor dividend announcements, price changes, and yield fluctuations in real-time.',
  },
  {
    icon: Calendar,
    title: 'Dividend Calendar',
    description: 'Never miss an ex-date or payment date with our comprehensive dividend calendar.',
  },
  {
    icon: PieChart,
    title: 'Portfolio Analysis',
    description: 'Visualize your income distribution across sectors and individual holdings.',
  },
  {
    icon: Bell,
    title: 'Smart Alerts',
    description: 'Get notified about dividend increases, cuts, and upcoming ex-dates.',
  },
  {
    icon: BarChart3,
    title: 'Income Forecasting',
    description: 'Project your future dividend income with advanced prediction models.',
  },
  {
    icon: Globe,
    title: 'Global Coverage',
    description: 'Track dividends from US, European, Asian, and emerging markets.',
  },
]

const stats = [
  { value: '5,000+', label: 'Stocks Tracked' },
  { value: '$2.5B', label: 'Dividends Tracked' },
  { value: '50K+', label: 'Active Investors' },
  { value: '99.9%', label: 'Uptime' },
]

export function FeaturesSection() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  const y = useTransform(scrollYProgress, [0, 1], ['10%', '-10%'])

  return (
    <section id="features" ref={ref} className="relative py-24 overflow-hidden">
      {/* Background Elements */}
      <motion.div 
        style={{ y }}
        className="absolute top-0 right-0 w-96 h-96 bg-muted/50 rounded-full blur-3xl"
      />
      <motion.div 
        style={{ y: useTransform(scrollYProgress, [0, 1], ['-10%', '10%']) }}
        className="absolute bottom-0 left-0 w-96 h-96 bg-muted/50 rounded-full blur-3xl"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-muted rounded-full text-xs sm:text-sm text-muted-foreground mb-4"
          >
            <Zap className="w-4 h-4" />
            <span>Powerful Features</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground text-balance"
          >
            Everything you need to maximize your dividend income
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-sm sm:text-base text-muted-foreground"
          >
            Comprehensive tools designed for serious dividend investors
          </motion.p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ 
                delay: index * 0.1,
                duration: 0.5,
                ease: [0.25, 0.1, 0.25, 1]
              }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="group p-5 sm:p-6 bg-card border border-border rounded-xl hover:border-primary/30 hover:shadow-lg transition-all duration-300"
            >
              <motion.div 
                className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors"
                whileHover={{ rotate: [0, -10, 10, 0], transition: { duration: 0.4 } }}
              >
                <feature.icon className="w-6 h-6 text-primary" />
              </motion.div>
              <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className="mt-16 sm:mt-20 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 sm:gap-8 p-6 sm:p-8 bg-muted/50 rounded-2xl border border-border"
        >
          {stats.map((stat, index) => (
            <motion.div 
              key={stat.label} 
              className="text-center"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 + index * 0.1, duration: 0.4 }}
            >
              <motion.div 
                className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                {stat.value}
              </motion.div>
              <div className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export function HowItWorksSection() {
  const steps = [
    {
      step: '01',
      title: 'Connect Your Brokerage',
      description: 'Link your investment accounts or manually add your holdings to get started.',
    },
    {
      step: '02',
      title: 'Track Your Dividends',
      description: 'Our system automatically tracks all dividend announcements and payments.',
    },
    {
      step: '03',
      title: 'Forecast Your Income',
      description: 'See projected income based on your holdings and historical dividend data.',
    },
  ]

  return (
    <section className="py-16 sm:py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground"
          >
            How it works
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-sm sm:text-base text-muted-foreground"
          >
            Get started in minutes, not hours
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {steps.map((item, index) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 30, x: index === 0 ? -20 : index === 2 ? 20 : 0 }}
              whileInView={{ opacity: 1, y: 0, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ 
                delay: index * 0.2,
                duration: 0.6,
                ease: [0.25, 0.1, 0.25, 1]
              }}
              className="relative"
            >
              {index < steps.length - 1 && (
                <motion.div 
                  className="hidden md:block absolute top-8 left-[60%] w-[80%] h-px bg-border"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + index * 0.2, duration: 0.6 }}
                  style={{ originX: 0 }}
                />
              )}
              <motion.div 
                className="relative bg-card border border-border rounded-xl p-5 sm:p-6"
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <motion.div 
                  className="text-4xl sm:text-5xl font-bold text-primary/20 mb-4"
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + index * 0.2, type: "spring", stiffness: 200 }}
                >
                  {item.step}
                </motion.div>
                <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">{item.description}</p>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function TrustSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  }

  return (
    <section id="about" className="py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <motion.div 
              className="inline-flex items-center gap-2 px-3 py-1 bg-muted rounded-full text-xs sm:text-sm text-muted-foreground mb-4"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Shield className="w-4 h-4" />
              <span>Bank-Level Security</span>
            </motion.div>
            <motion.h2 
              className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4 sm:mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              Your data is protected with enterprise-grade security
            </motion.h2>
            <motion.p 
              className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              We use 256-bit encryption, read-only access to your brokerage, and never store your credentials. 
              Your financial data stays private and secure.
            </motion.p>
            <motion.ul 
              className="space-y-3 sm:space-y-4"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {[
                'SOC 2 Type II Certified',
                'Read-only brokerage connection',
                '256-bit AES encryption',
                'Two-factor authentication',
              ].map((item, index) => (
                <motion.li 
                  key={item} 
                  className="flex items-center gap-3"
                  variants={itemVariants}
                  transition={{ duration: 0.4 }}
                >
                  <motion.div 
                    className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0"
                    whileInView={{ scale: [0, 1.2, 1] }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 + index * 0.1, duration: 0.4 }}
                  >
                    <svg className="w-3 h-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                  <span className="text-sm sm:text-base text-foreground">{item}</span>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="bg-muted/50 rounded-2xl border border-border p-6 sm:p-8">
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {[
                  { name: 'TD Ameritrade', connected: true },
                  { name: 'Fidelity', connected: true },
                  { name: 'Charles Schwab', connected: false },
                  { name: 'E*TRADE', connected: false },
                  { name: 'Robinhood', connected: true },
                  { name: 'Interactive Brokers', connected: false },
                ].map((broker) => (
                  <div
                    key={broker.name}
                    className={`p-3 sm:p-4 rounded-lg border text-sm sm:text-base ${
                      broker.connected 
                        ? 'bg-card border-primary/30' 
                        : 'bg-muted/30 border-border'
                    }`}
                  >
                    <div className="font-medium text-foreground text-xs sm:text-sm">{broker.name}</div>
                    <div className={`text-xs mt-1 ${broker.connected ? 'text-primary' : 'text-muted-foreground'}`}>
                      {broker.connected ? 'Connected' : 'Available'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
