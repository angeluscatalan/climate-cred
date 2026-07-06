'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useLoading } from '@/components/page-load-provider'

export default function LandingPage() {
  const [isHovered, setIsHovered] = useState(false)
  const { startLoading } = useLoading()

  return (
    <div className="min-h-screen bg-gradient-to-br from-paper via-paper to-forest/5 overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Floating elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-forest/5 rounded-full animate-float blur-3xl" style={{animationDuration: '8s'}} />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-forest/10 rounded-full animate-float blur-3xl" style={{animationDuration: '10s', animationDelay: '1s'}} />
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-forest/5 rounded-full animate-float blur-3xl" style={{animationDuration: '12s', animationDelay: '2s'}} />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 sm:px-6">
        <div className="max-w-2xl w-full text-center animate-slide-in-up">
          {/* Badge */}
          <div className="mb-8 inline-block">
            <div className="px-4 py-2 border border-forest/30 rounded-full bg-forest/5 backdrop-blur-sm animate-slide-in-left">
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-forest">
                Climate Verification Platform
              </span>
            </div>
          </div>

          {/* Main heading */}
          <h1 className="mb-6 font-serif text-5xl sm:text-7xl font-medium text-ink leading-tight tracking-tight animate-slide-in-up" style={{animationDelay: '0.1s'}}>
            Verify Climate Claims with Evidence
          </h1>

          {/* Subheading */}
          <p className="mb-12 text-lg sm:text-xl text-ink-muted font-light leading-relaxed animate-slide-in-up" style={{animationDelay: '0.2s'}}>
            ClimateCred uses retrieval-augmented generation to fact-check climate statements against peer-reviewed literature. Get evidence-backed answers in seconds.
          </p>

          {/* CTA Button with animations */}
          <div className="flex justify-center animate-slide-in-up" style={{animationDelay: '0.3s'}}>
            <Link href="/verify" onClick={startLoading}>
              <button
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="group relative px-10 sm:px-14 py-4 sm:py-5 bg-forest text-primary-foreground font-mono text-sm uppercase tracking-[0.2em] transition-all duration-300 hover:shadow-2xl hover:scale-110 active:scale-95"
              >
                {/* Animated background glow */}
                <div className="absolute inset-0 bg-forest opacity-0 group-hover:opacity-20 blur-lg transition-all duration-300" />
                
                {/* Button content */}
                <div className="relative flex items-center gap-3">
                  <span>Start Verifying</span>
                  <span className={`text-base leading-none transition-all duration-300 ${isHovered ? 'translate-x-2' : ''} inline-block`}>
                    →
                  </span>
                </div>
              </button>
            </Link>
          </div>

          {/* Feature highlights */}
          <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6 animate-slide-in-up" style={{animationDelay: '0.4s'}}>
            {[
              {
                label: 'Evidence-Based',
                description: 'Backed by peer-reviewed research'
              },
              {
                label: 'Instant Results',
                description: 'Get answers in seconds'
              },
              {
                label: 'Transparent',
                description: 'See the reasoning behind verdicts'
              }
            ].map((feature, idx) => (
              <div
                key={idx}
                className="p-6 border border-hairline bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-300 hover:border-forest/50 group"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-forest opacity-0 group-hover:opacity-100 transition-opacity" />
                  <h3 className="font-mono text-[10px] uppercase tracking-[0.18em] text-forest/70 group-hover:text-forest">
                    {feature.label}
                  </h3>
                </div>
                <p className="text-sm text-ink-muted">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer info */}
      <div className="relative z-10 fixed bottom-0 left-0 right-0 border-t border-hairline bg-paper/80 backdrop-blur-sm px-6 py-4">
        <p className="text-center font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted">
          ClimateCred · Evidence-First Fact-Checking · Est. 2025
        </p>
      </div>
    </div>
  )
}
