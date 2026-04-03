import Link from 'next/link'
import { ChevronRight, Zap, Wrench, BarChart2 } from 'lucide-react'
import PhaseNav from '@/components/demo/PhaseNav'
import { demoProject } from '@/lib/demo/demoData'

const typeConfig = {
  fix: { label: 'FIX', color: '#ef4444', bg: '#ef444411' },
  feature: { label: 'FEATURE', color: '#3b82f6', bg: '#3b82f611' },
  performance: { label: 'PERF', color: '#f59e0b', bg: '#f59e0b11' },
}

const effortColors = {
  LOW: { text: '#22c55e', bg: '#22c55e22' },
  MED: { text: '#f59e0b', bg: '#f59e0b22' },
  HIGH: { text: '#ef4444', bg: '#ef444422' },
}

export default function DemoRepeatPage() {
  const { repeat_phase } = demoProject
  const backlog = repeat_phase.backlog

  return (
    <div className="px-6 py-10 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <p
          className="text-xs text-[#555555] uppercase tracking-widest mb-2"
          style={{ fontFamily: 'var(--font-space-mono), monospace' }}
        >
          PHASE 05 · DEMO
        </p>
        <h1
          className="text-3xl font-bold text-white uppercase tracking-widest"
          style={{ fontFamily: 'var(--font-space-mono), monospace' }}
        >
          REPEAT: NEXT ITERATION
        </h1>
        <p className="text-[#888888] text-sm mt-1">
          AI-prioritized backlog based on user data and insights.
        </p>
      </div>

      {/* Phase Nav */}
      <PhaseNav />

      {/* Iteration stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'ITERATION', value: '2', color: '#8b5cf6', Icon: Zap },
          { label: 'FIXES QUEUED', value: String(backlog.filter((b) => b.type === 'fix').length), color: '#ef4444', Icon: Wrench },
          { label: 'FEATURES', value: String(backlog.filter((b) => b.type === 'feature').length), color: '#3b82f6', Icon: Zap },
          { label: 'VELOCITY GAIN', value: '+15%', color: '#22c55e', Icon: BarChart2 },
        ].map((s) => (
          <div key={s.label} className="bg-[#111111] border border-[#222222] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <s.Icon size={14} style={{ color: s.color }} />
              <span
                className="text-xs text-[#555555] uppercase tracking-wider"
                style={{ fontFamily: 'var(--font-space-mono), monospace' }}
              >
                {s.label}
              </span>
            </div>
            <p
              className="text-2xl font-bold text-white"
              style={{ fontFamily: 'var(--font-space-mono), monospace' }}
            >
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* AI-Prioritized Backlog */}
      <div className="bg-[#111111] border border-[#222222] rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2
            className="text-sm font-bold text-white uppercase tracking-widest"
            style={{ fontFamily: 'var(--font-space-mono), monospace' }}
          >
            AI-PRIORITIZED BACKLOG
          </h2>
          <span className="text-xs text-[#888888]">{backlog.length} items</span>
        </div>

        <div className="space-y-3">
          {backlog.map((item) => {
            const type = typeConfig[item.type as keyof typeof typeConfig]
            const effort = effortColors[item.effort as keyof typeof effortColors]
            return (
              <div
                key={item.id}
                className="flex items-center gap-3 bg-[#0a0a0a] rounded-lg px-3 py-3"
              >
                <span
                  className="flex-shrink-0 w-6 h-6 rounded bg-[#1a1a1a] text-[#555555] text-xs flex items-center justify-center font-bold"
                  style={{ fontFamily: 'var(--font-space-mono), monospace' }}
                >
                  {item.rank}
                </span>

                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider flex-shrink-0"
                  style={{
                    color: type.color,
                    backgroundColor: type.bg,
                    fontFamily: 'var(--font-space-mono), monospace',
                  }}
                >
                  {type.label}
                </span>

                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{item.title}</p>
                  <p className="text-xs text-[#555555] mt-0.5">Source: {item.source}</p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider"
                    style={{
                      color: item.impact === 'HIGH' ? '#ef4444' : '#f59e0b',
                      backgroundColor: item.impact === 'HIGH' ? '#ef444422' : '#f59e0b22',
                      fontFamily: 'var(--font-space-mono), monospace',
                    }}
                  >
                    {item.impact}
                  </span>
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider"
                    style={{
                      color: effort.text,
                      backgroundColor: effort.bg,
                      fontFamily: 'var(--font-space-mono), monospace',
                    }}
                  >
                    {item.effort}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        <p className="text-xs text-[#555555] mt-4 text-center">
          In your project, this list is auto-generated from live user data and AI analysis.
        </p>
      </div>

      {/* The loop */}
      <div className="bg-[#111111] border border-[#222222] rounded-xl p-6">
        <h2
          className="text-sm font-bold text-white uppercase tracking-widest mb-4"
          style={{ fontFamily: 'var(--font-space-mono), monospace' }}
        >
          THE LOOP
        </h2>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {['Think', 'Build', 'Ship', 'Listen', 'Repeat'].map((phase, idx, arr) => (
            <div key={phase} className="flex items-center gap-2 flex-shrink-0">
              <div
                className="px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-[#8b5cf622] text-[#8b5cf6] border border-[#8b5cf644]"
                style={{ fontFamily: 'var(--font-space-mono), monospace' }}
              >
                {phase}
              </div>
              {idx < arr.length - 1 && (
                <ChevronRight size={14} className="text-[#555555]" />
              )}
            </div>
          ))}
          <ChevronRight size={14} className="text-[#555555] flex-shrink-0" />
          <span className="text-xs text-[#555555] italic flex-shrink-0">again</span>
        </div>
        <p className="text-xs text-[#555555] mt-4 leading-relaxed">
          Each iteration gets faster. AI remembers your stack, your preferences, and your users.
        </p>
      </div>

      {/* Final CTA */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#111111] border border-[#8b5cf644] rounded-xl p-6">
        <div>
          <p
            className="text-sm font-bold text-white uppercase tracking-widest mb-1"
            style={{ fontFamily: 'var(--font-space-mono), monospace' }}
          >
            Ship. Learn. Repeat. Faster each time.
          </p>
          <p className="text-xs text-[#888888]">
            Start your first project for free. No credit card required.
          </p>
        </div>
        <Link
          href="/signup"
          className="flex items-center gap-2 bg-white text-black font-bold text-xs uppercase tracking-widest py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors whitespace-nowrap"
          style={{ fontFamily: 'var(--font-space-mono), monospace' }}
        >
          Start Free Now
          <ChevronRight size={14} />
        </Link>
      </div>
    </div>
  )
}
