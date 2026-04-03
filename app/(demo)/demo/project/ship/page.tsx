import Link from 'next/link'
import { Check, Clock, AlertTriangle, ChevronRight, Rocket } from 'lucide-react'
import PhaseNav from '@/components/demo/PhaseNav'
import { demoProject } from '@/lib/demo/demoData'

export default function DemoShipPage() {
  const { ship_phase } = demoProject
  const checks = ship_phase.preflight_checks
  const passed = checks.filter((c) => c.status === 'complete').length

  return (
    <div className="px-6 py-10 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <p
          className="text-xs text-[#555555] uppercase tracking-widest mb-2"
          style={{ fontFamily: 'var(--font-space-mono), monospace' }}
        >
          PHASE 03 · DEMO
        </p>
        <h1
          className="text-3xl font-bold text-white uppercase tracking-widest"
          style={{ fontFamily: 'var(--font-space-mono), monospace' }}
        >
          SHIP PHASE
        </h1>
        <p className="text-[#888888] text-sm mt-1">
          Pre-flight checks complete. Ready to deploy.
        </p>
      </div>

      {/* Phase Nav */}
      <PhaseNav />

      {/* Status Banner */}
      <div className="bg-[#22c55e11] border border-[#22c55e33] rounded-xl p-5 flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-[#22c55e22] flex items-center justify-center flex-shrink-0">
          <Rocket size={20} className="text-[#22c55e]" />
        </div>
        <div>
          <p
            className="text-sm font-bold text-[#22c55e] uppercase tracking-widest"
            style={{ fontFamily: 'var(--font-space-mono), monospace' }}
          >
            READY TO DEPLOY
          </p>
          <p className="text-xs text-[#22c55e] opacity-80 mt-0.5">
            {ship_phase.deployment_recommendation}
          </p>
        </div>
      </div>

      {/* Preflight Checklist */}
      <div className="bg-[#111111] border border-[#222222] rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2
            className="text-sm font-bold text-white uppercase tracking-widest"
            style={{ fontFamily: 'var(--font-space-mono), monospace' }}
          >
            PRE-FLIGHT CHECKLIST
          </h2>
          <span className="text-xs text-[#888888]">
            {passed}/{checks.length} passed
          </span>
        </div>

        <div className="space-y-3">
          {checks.map((check) => (
            <div
              key={check.id}
              className={`flex items-center gap-4 rounded-lg px-4 py-3 ${
                check.status === 'complete'
                  ? 'bg-[#22c55e08] border border-[#22c55e22]'
                  : 'bg-[#f59e0b08] border border-[#f59e0b22]'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                  check.status === 'complete'
                    ? 'bg-[#22c55e22]'
                    : 'bg-[#f59e0b22]'
                }`}
              >
                {check.status === 'complete' ? (
                  <Check size={12} className="text-[#22c55e]" />
                ) : (
                  <Clock size={12} className="text-[#f59e0b]" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-medium ${
                    check.status === 'complete' ? 'text-white' : 'text-[#f59e0b]'
                  }`}
                >
                  {check.name}
                </p>
                <p className="text-xs text-[#555555] mt-0.5">{check.detail}</p>
              </div>
              <span
                className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded flex-shrink-0 ${
                  check.status === 'complete'
                    ? 'text-[#22c55e] bg-[#22c55e22]'
                    : 'text-[#f59e0b] bg-[#f59e0b22]'
                }`}
                style={{ fontFamily: 'var(--font-space-mono), monospace' }}
              >
                {check.status === 'complete' ? 'Pass' : 'Pending'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Deployment Options */}
      <div className="bg-[#111111] border border-[#222222] rounded-xl p-6">
        <h2
          className="text-sm font-bold text-white uppercase tracking-widest mb-4"
          style={{ fontFamily: 'var(--font-space-mono), monospace' }}
        >
          DEPLOYMENT STRATEGY
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              label: 'DEPLOY NOW',
              desc: 'Push to production immediately',
              recommended: true,
              color: '#22c55e',
            },
            {
              label: 'PREVIEW DEPLOY',
              desc: 'Deploy to staging URL first',
              recommended: false,
              color: '#3b82f6',
            },
            {
              label: 'SCHEDULE',
              desc: 'Deploy at a specific time',
              recommended: false,
              color: '#888888',
            },
          ].map((opt) => (
            <div
              key={opt.label}
              className={`relative rounded-lg p-4 border cursor-default ${
                opt.recommended
                  ? 'bg-[#22c55e11] border-[#22c55e44]'
                  : 'bg-[#0a0a0a] border-[#222222]'
              }`}
            >
              {opt.recommended && (
                <span
                  className="absolute -top-2 left-3 text-[10px] font-bold bg-[#22c55e] text-black px-2 py-0.5 rounded uppercase tracking-wider"
                  style={{ fontFamily: 'var(--font-space-mono), monospace' }}
                >
                  Recommended
                </span>
              )}
              <p
                className="text-xs font-bold uppercase tracking-wider mb-1"
                style={{ color: opt.color, fontFamily: 'var(--font-space-mono), monospace' }}
              >
                {opt.label}
              </p>
              <p className="text-xs text-[#555555]">{opt.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 bg-[#1a1a1a] rounded-lg">
          <p className="text-xs text-[#555555] flex items-center gap-2">
            <AlertTriangle size={12} className="text-[#f59e0b]" />
            Sign up to deploy your own project — one click to Vercel, zero config required.
          </p>
        </div>
      </div>

      {/* Post-deployment actions */}
      <div className="bg-[#111111] border border-[#222222] rounded-xl p-6">
        <h2
          className="text-sm font-bold text-white uppercase tracking-widest mb-4"
          style={{ fontFamily: 'var(--font-space-mono), monospace' }}
        >
          POST-DEPLOYMENT
        </h2>
        <ol className="space-y-3">
          {[
            'Verify deployment at production URL',
            'Run smoke tests on critical user flows',
            'Check Sentry for any runtime errors',
            'Monitor Vercel analytics for traffic spikes',
            'Move to Listen phase to track real user behavior',
          ].map((action, i) => (
            <li key={i} className="flex items-start gap-3">
              <span
                className="flex-shrink-0 w-5 h-5 rounded bg-[#1a1a1a] text-[#555555] text-xs flex items-center justify-center font-bold"
                style={{ fontFamily: 'var(--font-space-mono), monospace' }}
              >
                {i + 1}
              </span>
              <p className="text-sm text-[#888888]">{action}</p>
            </li>
          ))}
        </ol>
      </div>

      {/* CTA */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#111111] border border-[#8b5cf644] rounded-xl p-6">
        <div>
          <p
            className="text-sm font-bold text-white uppercase tracking-widest mb-1"
            style={{ fontFamily: 'var(--font-space-mono), monospace' }}
          >
            Ship your project in one click
          </p>
          <p className="text-xs text-[#888888]">
            Automated checks, instant deploy to Vercel. No DevOps required.
          </p>
        </div>
        <Link
          href="/signup"
          className="flex items-center gap-2 bg-white text-black font-bold text-xs uppercase tracking-widest py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors whitespace-nowrap"
          style={{ fontFamily: 'var(--font-space-mono), monospace' }}
        >
          Start Shipping Free
          <ChevronRight size={14} />
        </Link>
      </div>
    </div>
  )
}
