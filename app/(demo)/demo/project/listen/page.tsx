import Link from 'next/link'
import { TrendingUp, AlertTriangle, CheckCircle, Info, ChevronRight } from 'lucide-react'
import PhaseNav from '@/components/demo/PhaseNav'
import { demoProject } from '@/lib/demo/demoData'

const insightIcon = {
  warning: AlertTriangle,
  success: CheckCircle,
  info: Info,
}

const insightColors = {
  warning: { bg: '#f59e0b11', border: '#f59e0b33', text: '#f59e0b' },
  success: { bg: '#22c55e11', border: '#22c55e33', text: '#22c55e' },
  info: { bg: '#3b82f611', border: '#3b82f633', text: '#3b82f6' },
}

export default function DemoListenPage() {
  const { listen_phase } = demoProject

  return (
    <div className="px-6 py-10 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <p
          className="text-xs text-[#555555] uppercase tracking-widest mb-2"
          style={{ fontFamily: 'var(--font-space-mono), monospace' }}
        >
          PHASE 04 · DEMO
        </p>
        <h1
          className="text-3xl font-bold text-white uppercase tracking-widest"
          style={{ fontFamily: 'var(--font-space-mono), monospace' }}
        >
          LISTEN: MISSION CONTROL
        </h1>
        <p className="text-[#888888] text-sm mt-1">
          Real-time analytics and AI-powered insights post-launch.
        </p>
      </div>

      {/* Phase Nav */}
      <PhaseNav />

      {/* Pre-launch notice */}
      <div className="bg-[#f59e0b11] border border-[#f59e0b33] rounded-xl p-5">
        <div className="flex items-start gap-3">
          <AlertTriangle size={16} className="text-[#f59e0b] flex-shrink-0 mt-0.5" />
          <div>
            <p
              className="text-xs font-bold text-[#f59e0b] uppercase tracking-widest mb-1"
              style={{ fontFamily: 'var(--font-space-mono), monospace' }}
            >
              AWAITING LAUNCH
            </p>
            <p className="text-xs text-[#f59e0b] opacity-80 leading-relaxed">
              TaskFlow hasn't shipped yet. Once deployed, live metrics and AI insights will populate here automatically.
              Below is a preview of what you'll see.
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Grid (preview) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'ACTIVE USERS', value: '—', unit: '24h', color: '#22c55e' },
          { label: 'PAGE LOAD', value: '—', unit: 'avg', color: '#3b82f6' },
          { label: 'ERROR RATE', value: '—', unit: '%', color: '#ef4444' },
          { label: 'SATISFACTION', value: '—', unit: '/5', color: '#f59e0b' },
        ].map((m) => (
          <div
            key={m.label}
            className="bg-[#111111] border border-[#222222] rounded-xl p-4 opacity-60"
          >
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={14} style={{ color: m.color }} />
              <span
                className="text-xs text-[#555555] uppercase tracking-wider"
                style={{ fontFamily: 'var(--font-space-mono), monospace' }}
              >
                {m.label}
              </span>
            </div>
            <p
              className="text-2xl font-bold text-[#333333]"
              style={{ fontFamily: 'var(--font-space-mono), monospace' }}
            >
              {m.value}
            </p>
            <p className="text-xs text-[#333333] mt-0.5">{m.unit}</p>
          </div>
        ))}
      </div>

      {/* AI Insights (preview) */}
      <div className="bg-[#111111] border border-[#222222] rounded-xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <h2
            className="text-sm font-bold text-white uppercase tracking-widest"
            style={{ fontFamily: 'var(--font-space-mono), monospace' }}
          >
            AI INSIGHTS
          </h2>
          <span
            className="text-xs text-[#555555] bg-[#1a1a1a] border border-[#222222] px-2 py-0.5 rounded uppercase tracking-wider"
            style={{ fontFamily: 'var(--font-space-mono), monospace' }}
          >
            Preview
          </span>
        </div>

        <div className="space-y-4">
          {listen_phase.insights.map((insight, i) => {
            const colors = insightColors[insight.type as keyof typeof insightColors]
            const Icon = insightIcon[insight.type as keyof typeof insightIcon]
            return (
              <div
                key={i}
                className="rounded-xl p-4 border"
                style={{ backgroundColor: colors.bg, borderColor: colors.border }}
              >
                <div className="flex items-start gap-3">
                  <Icon size={14} className="flex-shrink-0 mt-0.5" style={{ color: colors.text }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p
                        className="text-xs font-bold uppercase tracking-wider"
                        style={{ color: colors.text, fontFamily: 'var(--font-space-mono), monospace' }}
                      >
                        {insight.title}
                      </p>
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider"
                        style={{
                          color: colors.text,
                          backgroundColor: colors.bg,
                          border: `1px solid ${colors.border}`,
                          fontFamily: 'var(--font-space-mono), monospace',
                        }}
                      >
                        {insight.impact}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: colors.text, opacity: 0.8 }}>
                      {insight.description}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* CTA */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#111111] border border-[#8b5cf644] rounded-xl p-6">
        <div>
          <p
            className="text-sm font-bold text-white uppercase tracking-widest mb-1"
            style={{ fontFamily: 'var(--font-space-mono), monospace' }}
          >
            Know what to fix before users churn
          </p>
          <p className="text-xs text-[#888888]">
            AI monitors your live app and surfaces actionable insights automatically.
          </p>
        </div>
        <Link
          href="/signup"
          className="flex items-center gap-2 bg-white text-black font-bold text-xs uppercase tracking-widest py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors whitespace-nowrap"
          style={{ fontFamily: 'var(--font-space-mono), monospace' }}
        >
          Start Listening Free
          <ChevronRight size={14} />
        </Link>
      </div>
    </div>
  )
}
