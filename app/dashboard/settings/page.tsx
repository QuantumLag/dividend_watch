'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  User,
  Mail,
  Crown,
  Shield,
  LogOut,
  Loader2,
  Check,
  ExternalLink,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const supabase = createClient()

  useEffect(() => {
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
      setLoading(false)
    }
    loadData()
  }, [])

  async function handleSignOut() {
    await fetch('/auth/signout', { method: 'POST' })
    router.push('/')
    router.refresh()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      features: ['Track up to 10 stocks', 'Basic dividend calendar', 'Monthly income summary'],
      current: profile?.plan === 'free',
    },
    {
      name: 'Pro',
      price: '$12',
      period: '/month',
      features: ['Unlimited stock tracking', 'Income forecasting', 'Portfolio analysis', 'Priority support', 'Export to CSV/PDF'],
      current: profile?.plan === 'pro',
      popular: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      features: ['Everything in Pro', 'Multi-portfolio support', 'API access', 'Dedicated manager'],
      current: profile?.plan === 'enterprise',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Manage your account and subscription
        </p>
      </div>

      {/* Account Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-xl overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-border bg-muted/30">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <User className="w-4 h-4" />
            Account
          </h2>
        </div>
        <div className="p-6 space-y-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-muted rounded-full flex items-center justify-center text-lg font-bold text-foreground">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <p className="font-medium text-foreground">
                {profile?.full_name || user?.email?.split('@')[0]}
              </p>
              <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                {user?.email}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 bg-muted/30 rounded-lg border border-border">
              <div className="text-xs text-muted-foreground mb-1">Current Plan</div>
              <div className="font-semibold text-foreground flex items-center gap-1.5">
                <Crown className="w-4 h-4" />
                {profile?.plan?.charAt(0).toUpperCase() + profile?.plan?.slice(1) || 'Free'}
              </div>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg border border-border">
              <div className="text-xs text-muted-foreground mb-1">Member Since</div>
              <div className="font-semibold text-foreground">
                {profile?.created_at
                  ? new Date(profile.created_at).toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric',
                    })
                  : '—'}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Plans */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card border border-border rounded-xl overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-border bg-muted/30">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <Crown className="w-4 h-4" />
            Subscription
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative p-5 rounded-xl border transition-all ${
                  plan.current
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-border hover:border-primary/30'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                    Popular
                  </div>
                )}
                <div className="mb-3">
                  <h3 className="font-semibold text-foreground">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-bold text-foreground">{plan.price}</span>
                    {plan.period && <span className="text-xs text-muted-foreground">{plan.period}</span>}
                  </div>
                </div>
                <ul className="space-y-2 mb-4">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Check className="w-3 h-3 text-primary flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                {plan.current ? (
                  <div className="w-full py-2 text-center text-sm font-medium text-primary border border-primary/30 rounded-lg bg-primary/5">
                    Current Plan
                  </div>
                ) : plan.name === 'Enterprise' ? (
                  <a
                    href="mailto:sales@dividendwatch.com"
                    className="w-full flex items-center justify-center gap-1.5 py-2 text-sm font-medium border border-border rounded-lg hover:bg-muted transition-colors"
                  >
                    Contact Sales
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <button
                    disabled
                    className="w-full py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg opacity-60 cursor-not-allowed"
                  >
                    Coming Soon
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Security */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card border border-border rounded-xl overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-border bg-muted/30">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Security
          </h2>
        </div>
        <div className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="font-medium text-foreground">Sign Out</p>
              <p className="text-sm text-muted-foreground">
                Sign out of your account on this device
              </p>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium border border-border rounded-lg hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
