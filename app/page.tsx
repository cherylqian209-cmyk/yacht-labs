import Link from 'next/link'
import { Mail, ChevronRight, Check } from 'lucide-react'

const phases = [
  {
    num: '01',
    name: 'Think',
    days: 'Day 1–2',
    color: '#8b5cf6',
    desc: 'Stop overthinking. AI scopes your MVP in 30 minutes — core features, tech stack, timeline, risks.',
  },
  {
    num: '02',
    name: 'Build',
    days: 'Day 3–5',
    color: '#3b82f6',
    desc: 'Break it into tasks. AI generates starter code. You ship progress every single day.',
  },
  {
    num: '03',
    name: 'Ship',
    days: 'Day 6',
    color: '#f97316',
    desc: 'Pre-flight checklist. One-click deploy to Vercel. Your product is live — no DevOps stress.',
  },
  {
    num: '04',
    name: 'Listen',
    days: 'Day 7+',
    color: '#22c55e',
    desc: 'Track what matters. AI spots patterns. Real user feedback, not vanity metrics.',
  },
  {
    num: '05',
    name: 'Repeat',
    days: 'Ongoing',
    color: '#f59e0b',
    desc: 'AI prioritizes your next iteration. Ship improvements weekly, not monthly.',
  },
]

const socialProof = [
  {
    project: 'TaskFlow',
    by: '@sarah',
    days: 5,
    quote: 'Yacht Labs stopped me from overengineering. Just ship the MVP.',
  },
  {
    project: 'InvoiceFlow',
    by: '@mike',
    days: 7,
    quote: 'The daily check-ins kept me honest. 12-day streak and counting.',
  },
  {
    project: 'LinkVault',
    by: '@alex',
    days: 3,
    quote: 'Built this to solve my own problem. Now helping others ship faster.',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      {/* Top nav */}
      <nav className="flex items-center justify-between px-6 py-5">
        <span
          className="text-xs font-bold tracking-widest uppercase text-white"
          style={{ fontFamily: 'var(--font-space-mono), monospace' }}
        >
          ✦✦ YACHT LABS
        </span>
        <div className="flex items-center gap-4">
          <Link
            href="/demo"
            className="text-xs text-[#888888] hover:text-white transition-colors uppercase tracking-widest hidden sm:inline"
            style={{ fontFamily: 'var(--font-space-mono), monospace' }}
          >
            Try Demo
          </Link>
          <Link
            href="/login"
            className="text-xs text-[#888888] hover:text-white transition-colors uppercase tracking-widest"
            style={{ fontFamily: 'var(--font-space-mono), monospace' }}
          >
            Log in
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center pt-8 pb-16">
        <div className="max-w-4xl w-full">
          {/* Pill label */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#8b5cf622] border border-[#8b5cf644] rounded-full mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8b5cf6]" />
            <span
              className="text-xs text-[#8b5cf6] uppercase tracking-widest font-bold"
              style={{ fontFamily: 'var(--font-space-mono), monospace' }}
            >
              The 5-Phase Shipping Framework
            </span>
          </div>

          {/* Heading */}
          <h1
            className="text-5xl sm:text-7xl md:text-8xl font-bold text-white leading-none tracking-tight mb-6"
            style={{ fontFamily: 'var(--font-space-mono), monospace' }}
          >
            <span className="block">STOP PLANNING.</span>
            <span className="block">START SHIPPING.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-[#888888] text-lg sm:text-xl max-w-xl mx-auto mb-8 leading-relaxed">
            The proven framework that takes indie hackers from idea → live product in 7 days.
            AI assistance, daily accountability, and a community of builders who actually ship.
          </p>

          {/* Stats bar */}
          <div className="flex flex-wrap items-center justify-center gap-6 mb-10 text-xs text-[#555555]" style={{ fontFamily: 'var(--font-space-mono), monospace' }}>
            <span className="flex items-center gap-1.5"><Check size={11} className="text-[#22c55e]" /> 147 products shipped this month</span>
            <span className="flex items-center gap-1.5"><Check size={11} className="text-[#22c55e]" /> Avg. time to ship: 6.2 days</span>
            <span className="flex items-center gap-1.5"><Check size={11} className="text-[#22c55e]" /> 89% completion rate</span>
          </div>

          {/* Loom walkthrough */}
          <div
            className="relative w-full max-w-3xl mx-auto mb-10 rounded-xl overflow-hidden border border-[#222222]"
            style={{ paddingBottom: '56.25%', height: 0 }}
          >
            <iframe
              src="https://www.loom.com/embed/78991d02ed934b98916c7c7d9d98c9b9"
              frameBorder="0"
              allowFullScreen
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
            />
          </div>

          {/* Primary CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
            <Link
              href="/demo"
              className="flex items-center gap-2 px-6 py-3 bg-[#8b5cf6] text-white font-bold text-sm uppercase tracking-widest rounded-lg hover:bg-[#7c3aed] transition-colors"
              style={{ fontFamily: 'var(--font-space-mono), monospace' }}
            >
              Try Demo →
            </Link>
            <Link
              href="/signup"
              className="flex items-center gap-2 px-6 py-3 bg-white text-black font-bold text-sm uppercase tracking-widest rounded-lg hover:bg-gray-100 transition-colors"
              style={{ fontFamily: 'var(--font-space-mono), monospace' }}
            >
              Start Shipping Free
              <ChevronRight size={14} />
            </Link>
          </div>
          <p className="text-[#444444] text-xs">No credit card required · Demo needs no signup</p>

          {/* Auth links */}
          <div className="flex flex-col items-center gap-3 max-w-xs mx-auto mt-8">
            <Link
              href="/login"
              className="w-full flex items-center justify-center gap-3 bg-[#111111] text-white text-sm font-medium py-3 px-6 rounded-lg border border-[#222222] hover:bg-[#1a1a1a] transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853" />
                <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
              </svg>
              Continue with Google
            </Link>
            <Link
              href="/login"
              className="w-full flex items-center justify-center gap-3 bg-[#111111] text-white text-sm font-medium py-3 px-6 rounded-lg border border-[#222222] hover:bg-[#1a1a1a] transition-colors"
            >
              <Mail size={16} />
              Sign up with email
            </Link>
          </div>
        </div>
      </main>

      {/* How It Works */}
      <section className="px-6 py-16 border-t border-[#1a1a1a]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p
              className="text-xs text-[#555555] uppercase tracking-widest mb-3"
              style={{ fontFamily: 'var(--font-space-mono), monospace' }}
            >
              THE FRAMEWORK
            </p>
            <h2
              className="text-2xl sm:text-3xl font-bold text-white uppercase tracking-widest"
              style={{ fontFamily: 'var(--font-space-mono), monospace' }}
            >
              5 PHASES. 7 DAYS. SHIPPED.
            </h2>
            <p className="text-[#888888] text-sm mt-3 max-w-md mx-auto">
              The framework keeps you moving. AI removes friction. Community keeps you accountable.
            </p>
          </div>

          <div className="space-y-3">
            {phases.map((phase, idx) => (
              <div
                key={phase.num}
                className="flex items-start gap-5 bg-[#111111] border border-[#222222] rounded-xl p-5 hover:border-[#2a2a2a] transition-colors"
              >
                <div className="flex-shrink-0 text-center">
                  <span
                    className="text-xs font-bold uppercase tracking-widest"
                    style={{ color: phase.color, fontFamily: 'var(--font-space-mono), monospace' }}
                  >
                    {phase.num}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-3 mb-1 flex-wrap">
                    <span
                      className="text-sm font-bold text-white uppercase tracking-widest"
                      style={{ fontFamily: 'var(--font-space-mono), monospace' }}
                    >
                      {phase.name}
                    </span>
                    <span
                      className="text-xs px-2 py-0.5 rounded"
                      style={{
                        backgroundColor: `${phase.color}22`,
                        color: phase.color,
                        fontFamily: 'var(--font-space-mono), monospace',
                      }}
                    >
                      {phase.days}
                    </span>
                  </div>
                  <p className="text-sm text-[#888888] leading-relaxed">{phase.desc}</p>
                </div>
                {idx < phases.length - 1 && (
                  <div className="hidden sm:flex flex-shrink-0 items-center">
                    <ChevronRight size={14} className="text-[#333333]" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/demo"
              className="inline-flex items-center gap-2 text-xs text-[#8b5cf6] hover:text-[#a78bfa] uppercase tracking-widest transition-colors"
              style={{ fontFamily: 'var(--font-space-mono), monospace' }}
            >
              See the framework in action →
            </Link>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="px-6 py-16 border-t border-[#1a1a1a]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <p
              className="text-xs text-[#555555] uppercase tracking-widest mb-3"
              style={{ fontFamily: 'var(--font-space-mono), monospace' }}
            >
              SHIPPED PROJECTS
            </p>
            <h2
              className="text-2xl font-bold text-white uppercase tracking-widest"
              style={{ fontFamily: 'var(--font-space-mono), monospace' }}
            >
              BUILDERS WHO ACTUALLY SHIP
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {socialProof.map((item) => (
              <div
                key={item.project}
                className="bg-[#111111] border border-[#222222] rounded-xl p-5 flex flex-col gap-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p
                      className="text-sm font-bold text-white uppercase tracking-wider"
                      style={{ fontFamily: 'var(--font-space-mono), monospace' }}
                    >
                      {item.project}
                    </p>
                    <p className="text-xs text-[#555555] mt-0.5">{item.by}</p>
                  </div>
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded bg-[#22c55e22] text-[#22c55e]"
                    style={{ fontFamily: 'var(--font-space-mono), monospace' }}
                  >
                    {item.days}d
                  </span>
                </div>
                <p className="text-xs text-[#888888] leading-relaxed flex-1">
                  &ldquo;{item.quote}&rdquo;
                </p>
                <div className="h-1 bg-[#1a1a1a] rounded-full overflow-hidden">
                  <div className="h-full bg-[#22c55e] rounded-full w-full" />
                </div>
              </div>
            ))}
          </div>

          {/* Final CTA */}
          <div className="mt-12 text-center">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 bg-white text-black font-bold text-sm uppercase tracking-widest py-4 px-8 rounded-lg hover:bg-gray-100 transition-colors"
              style={{ fontFamily: 'var(--font-space-mono), monospace' }}
            >
              Start Your Project Free
              <ChevronRight size={14} />
            </Link>
            <p className="text-[#444444] text-xs mt-3">Join 147 builders shipping this month</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="p-6 text-center border-t border-[#1a1a1a]">
        <p className="text-[#555555] text-xs tracking-wider uppercase" style={{ fontFamily: 'var(--font-space-mono), monospace' }}>
          Think · Build · Ship · Listen · Repeat
        </p>
      </footer>
    </div>
  )
}
