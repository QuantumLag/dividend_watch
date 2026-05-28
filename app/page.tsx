'use client'

import { useState } from 'react'
import { Navbar } from '@/components/navbar'
import { LoginModal } from '@/components/login-modal'
import { ParallaxHero } from '@/components/parallax-hero'
import { FeaturesSection, HowItWorksSection, TrustSection } from '@/components/features-section'
import { PricingSection } from '@/components/pricing-section'
import { Footer } from '@/components/footer'

export default function LandingPage() {
  const [loginModalOpen, setLoginModalOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <Navbar onLoginClick={() => setLoginModalOpen(true)} />
      <LoginModal isOpen={loginModalOpen} onClose={() => setLoginModalOpen(false)} />
      
      <main>
        <ParallaxHero onGetStarted={() => setLoginModalOpen(true)} />
        <FeaturesSection />
        <HowItWorksSection />
        <TrustSection />
        <PricingSection onGetStarted={() => setLoginModalOpen(true)} />
      </main>

      <Footer onGetStarted={() => setLoginModalOpen(true)} />
    </div>
  )
}
