'use client'

import { motion } from 'framer-motion'
import { Check, ArrowRight } from 'lucide-react'

interface PricingSectionProps {
  onGetStarted: () => void
}

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for getting started with dividend tracking',
    features: [
      'Track up to 10 stocks',
      'Basic dividend calendar',
      'Monthly income summary',
      'Email notifications',
    ],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Pro',
    price: '$12',
    period: 'per month',
    description: 'For serious dividend investors who want more',
    features: [
      'Unlimited stock tracking',
      'Advanced dividend calendar',
      'Income forecasting',
      'Portfolio analysis tools',
      'Priority support',
      'Export to CSV/PDF',
    ],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: 'pricing',
    description: 'For wealth managers and institutions',
    features: [
      'Everything in Pro',
      'Multi-portfolio support',
      'API access',
      'Custom integrations',
      'Dedicated account manager',
      'SLA guarantee',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
]

export function PricingSection({ onGetStarted }: PricingSectionProps) {
  return (
    <section id="pricing" className="py-16 sm:py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground"
          >
            Simple, transparent pricing
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-sm sm:text-base text-muted-foreground"
          >
            Choose the plan that fits your investment strategy
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ 
                delay: index * 0.15,
                duration: 0.5,
                ease: [0.25, 0.1, 0.25, 1]
              }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className={`relative bg-card rounded-2xl border ${
                plan.popular ? 'border-primary shadow-lg md:scale-105' : 'border-border'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                  Most Popular
                </div>
              )}
              <div className="p-5 sm:p-6">
                <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-xs sm:text-sm text-muted-foreground">/{plan.period}</span>
                </div>
                <p className="mt-2 text-xs sm:text-sm text-muted-foreground">{plan.description}</p>

                <ul className="mt-6 space-y-2 sm:space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 sm:gap-3">
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-primary" />
                      </div>
                      <span className="text-xs sm:text-sm text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                {plan.name === 'Enterprise' ? (
                  <a
                    href="mailto:sales@dividendwatch.com?subject=Enterprise%20Plan%20Inquiry"
                    className="w-full mt-6 sm:mt-8 flex items-center justify-center gap-2 py-2.5 sm:py-3 rounded-lg font-medium transition-colors text-sm sm:text-base border border-border hover:bg-muted"
                  >
                    {plan.cta}
                    <ArrowRight className="w-4 h-4" />
                  </a>
                ) : (
                  <button
                    onClick={onGetStarted}
                    className={`w-full mt-6 sm:mt-8 flex items-center justify-center gap-2 py-2.5 sm:py-3 rounded-lg font-medium transition-colors text-sm sm:text-base ${
                      plan.popular
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                        : 'border border-border hover:bg-muted'
                    }`}
                  >
                    {plan.cta}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
