'use client'

import Script from 'next/script'

const PUBLISHABLE_KEY =
  'pk_live_51TH1X8LTAUCFfwHWy2ZreyGIHneYTBd9bMNJJghUxN275FuRt5bdtbDZ3IQ15ff0o6NXshNsXVcfHbukzjqbCxjO00pXZylYgj'

export default function StripePricing() {
  return (
    <>
      <Script src="https://js.stripe.com/v3/buy-button.js" strategy="lazyOnload" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
        {/* Free Tier */}
        <div className="bg-[#111111] border border-[#222222] rounded-xl p-6 flex flex-col gap-4">
          <div>
            <h3
              className="text-xs font-bold text-[#888888] uppercase tracking-widest mb-1"
              style={{ fontFamily: 'var(--font-space-mono), monospace' }}
            >
              FREE TIER
            </h3>
            <div className="flex items-baseline gap-1">
              <span
                className="text-4xl font-bold text-white"
                style={{ fontFamily: 'var(--font-space-mono), monospace' }}
              >
                $0
              </span>
              <span className="text-[#555555] text-sm">/ forever</span>
            </div>
          </div>

          <ul className="space-y-2 flex-1 text-sm text-[#888888]">
            {['1 Active Project', 'Basic Synthesis', 'Manual Kinetics (Ship)', 'Community Support'].map((f) => (
              <li key={f} className="flex items-center gap-2">
                <span className="text-[#22c55e]">→</span> {f}
              </li>
            ))}
            {['Real-time Mission Control', 'Autopilot Growth Engine'].map((f) => (
              <li key={f} className="flex items-center gap-2 line-through opacity-40">
                <span>→</span> {f}
              </li>
            ))}
          </ul>

          <div className="w-full [&>stripe-buy-button]:w-full">
            <stripe-buy-button
              buy-button-id="buy_btn_1TH3HBLTAUCFfwHWguDiyMpg"
              publishable-key={PUBLISHABLE_KEY}
            />
          </div>
        </div>

        {/* Pro Lab */}
        <div className="bg-white text-black rounded-xl p-6 flex flex-col gap-4 relative">
          <span
            className="absolute top-4 right-4 text-[10px] font-bold text-black/40 uppercase tracking-widest"
            style={{ fontFamily: 'var(--font-space-mono), monospace' }}
          >
            ✦ POPULAR
          </span>
          <div>
            <h3
              className="text-xs font-bold text-black/50 uppercase tracking-widest mb-1"
              style={{ fontFamily: 'var(--font-space-mono), monospace' }}
            >
              PRO LAB
            </h3>
            <div className="flex items-baseline gap-1">
              <span
                className="text-4xl font-bold text-black"
                style={{ fontFamily: 'var(--font-space-mono), monospace' }}
              >
                $99
              </span>
              <span className="text-black/40 text-sm">/ month</span>
            </div>
          </div>

          <ul className="space-y-2 flex-1 text-sm text-black/70">
            {[
              'Unlimited Projects',
              'Advanced Synthesis (Lead Magnets)',
              'Real-time Mission Control',
              'Autopilot Growth Engine (50 Users)',
              'Priority Inference Nodes',
            ].map((f) => (
              <li key={f} className="flex items-center gap-2">
                <span className="text-black">→</span> {f}
              </li>
            ))}
          </ul>

          <div className="w-full [&>stripe-buy-button]:w-full">
            <stripe-buy-button
              buy-button-id="buy_btn_1TH1kQLTAUCFfwHWO0rXsRrR"
              publishable-key={PUBLISHABLE_KEY}
            />
          </div>
        </div>
      </div>
    </>
  )
}
