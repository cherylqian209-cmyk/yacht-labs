import Link from 'next/link'
import { Sparkles, CheckCircle, Zap, Clock, AlertTriangle, ChevronRight } from 'lucide-react'
import PhaseNav from '@/components/demo/PhaseNav'
import { demoProject } from '@/lib/demo/demoData'

const phaseTagColors: Record<string, { bg: string; text: string }> = {
  setup: { bg: '#8b5cf622', text: '#8b5cf6' },
  build: { bg: '#14b8a622', text: '#14b8a6' },
  ship: { bg: '#3b82f622', text: '#3b82f6' },
}

const taskGroups = [
  { label: 'Days 1–2: Foundation', phases: ['setup'] },
  { label: 'Days 3–5: Core Build', phases: ['build'] },
  { label: 'Days 6–7: Ship & Polish', phases: ['ship'] },
]

export default function DemoThinkPage() {
  const { name, description, think_phase } = demoProject
  const analysis = think_phase.analysis
  const tasks = think_phase.tasks

  return (
    <div className="px-6 py-10 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <p
          className="text-xs text-[#555555] uppercase tracking-widest mb-2"
          style={{ fontFamily: 'var(--font-space-mono), monospace' }}
        >
          PHASE 01 · DEMO
        </p>
        <h1
          className="text-3xl font-bold text-white uppercase tracking-widest"
          style={{ fontFamily: 'var(--font-space-mono), monospace' }}
        >
          THINK: INTELLIGENT PROJECT SCOPING
        </h1>
        <p className="text-[#888888] text-sm mt-2">
          AI-assisted planning from idea to execution blueprint.
        </p>
      </div>

      {/* Phase Nav */}
      <PhaseNav />

      {/* Project Brief */}
      <div className="bg-[#111111] border border-[#222222] rounded-xl p-6">
        <h2
          className="text-xs font-bold text-[#888888] uppercase tracking-widest mb-4"
          style={{ fontFamily: 'var(--font-space-mono), monospace' }}
        >
          PROJECT BRIEF
        </h2>
        <div className="border-l-2 border-[#8b5cf6] pl-4">
          <p className="text-white font-semibold mb-1">{name}</p>
          <p className="text-[#888888] text-sm leading-relaxed">{description}</p>
        </div>
      </div>

      {/* AI Analysis */}
      <div className="bg-[#111111] border-2 border-[#8b5cf6] rounded-xl p-6 space-y-6">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-[#8b5cf6]" />
          <h2
            className="text-sm font-bold text-white uppercase tracking-widest"
            style={{ fontFamily: 'var(--font-space-mono), monospace' }}
          >
            AI PROJECT ANALYSIS
          </h2>
          <span
            className="ml-auto text-xs text-[#22c55e] bg-[#22c55e11] border border-[#22c55e33] px-2 py-0.5 rounded uppercase tracking-wider"
            style={{ fontFamily: 'var(--font-space-mono), monospace' }}
          >
            Complete
          </span>
        </div>

        {/* Feature columns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#22c55e11] border border-[#22c55e33] rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle size={14} className="text-[#22c55e]" />
              <h3
                className="text-xs font-bold text-[#22c55e] uppercase tracking-wider"
                style={{ fontFamily: 'var(--font-space-mono), monospace' }}
              >
                CORE FEATURES
              </h3>
            </div>
            <ul className="space-y-2">
              {analysis.coreFeatures.map((f, i) => (
                <li key={i} className="text-xs text-[#22c55e] opacity-90 leading-relaxed">
                  • {f}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-[#3b82f611] border border-[#3b82f633] rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Zap size={14} className="text-[#3b82f6]" />
              <h3
                className="text-xs font-bold text-[#3b82f6] uppercase tracking-wider"
                style={{ fontFamily: 'var(--font-space-mono), monospace' }}
              >
                NICE TO HAVE
              </h3>
            </div>
            <ul className="space-y-2">
              {analysis.niceToHave.map((f, i) => (
                <li key={i} className="text-xs text-[#3b82f6] opacity-90 leading-relaxed">
                  • {f}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-[#55555511] border border-[#33333333] rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock size={14} className="text-[#888888]" />
              <h3
                className="text-xs font-bold text-[#888888] uppercase tracking-wider"
                style={{ fontFamily: 'var(--font-space-mono), monospace' }}
              >
                OUT OF SCOPE
              </h3>
            </div>
            <ul className="space-y-2">
              {analysis.outOfScope.map((f, i) => (
                <li key={i} className="text-xs text-[#555555] leading-relaxed">
                  • {f}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="bg-[#8b5cf611] rounded-lg p-4">
          <h3
            className="text-xs font-bold text-[#8b5cf6] uppercase tracking-wider mb-3"
            style={{ fontFamily: 'var(--font-space-mono), monospace' }}
          >
            RECOMMENDED TECH STACK
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Object.entries(analysis.techStack).map(([key, value]) => (
              <div key={key}>
                <span className="text-xs text-[#8b5cf6] font-bold uppercase">{key}: </span>
                <span className="text-xs text-[#8b5cf6] opacity-80">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Execution Plan */}
      <div className="bg-[#111111] border border-[#222222] rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2
            className="text-sm font-bold text-white uppercase tracking-widest"
            style={{ fontFamily: 'var(--font-space-mono), monospace' }}
          >
            EXECUTION PLAN ({tasks.length} tasks)
          </h2>
          <span className="text-xs text-[#888888]">~{analysis.estimatedDays} days</span>
        </div>
        <div className="space-y-6">
          {taskGroups.map((group) => {
            const groupTasks = tasks.filter((t) => group.phases.includes(t.phase))
            if (groupTasks.length === 0) return null
            return (
              <div key={group.label}>
                <p
                  className="text-xs text-[#888888] uppercase tracking-widest mb-3"
                  style={{ fontFamily: 'var(--font-space-mono), monospace' }}
                >
                  {group.label}
                </p>
                <div className="space-y-2">
                  {groupTasks.map((task) => {
                    const tag = phaseTagColors[task.phase] ?? phaseTagColors.build
                    return (
                      <div
                        key={task.id}
                        className="flex items-center gap-3 bg-[#0a0a0a] rounded-lg px-3 py-2.5"
                      >
                        <span
                          className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded flex-shrink-0"
                          style={{
                            backgroundColor: tag.bg,
                            color: tag.text,
                            fontFamily: 'var(--font-space-mono), monospace',
                          }}
                        >
                          {task.phase}
                        </span>
                        <span className="text-sm text-white flex-1">{task.title}</span>
                        <span className="text-xs text-[#555555] flex-shrink-0">
                          {task.estimated_hours}h
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Risk Assessment */}
      <div className="bg-[#111111] border border-[#222222] rounded-xl p-6">
        <h2
          className="text-sm font-bold text-white uppercase tracking-widest mb-4"
          style={{ fontFamily: 'var(--font-space-mono), monospace' }}
        >
          RISK ASSESSMENT
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {analysis.risks.map((risk, i) => (
            <div
              key={i}
              className="bg-[#f59e0b11] border border-[#f59e0b33] rounded-lg p-4 flex gap-3"
            >
              <AlertTriangle size={14} className="text-[#f59e0b] flex-shrink-0 mt-0.5" />
              <p className="text-xs text-[#f59e0b] opacity-90 leading-relaxed">{risk}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#111111] border border-[#222222] rounded-xl p-6">
        <p className="text-sm text-[#888888]">
          In your own project, AI generates this entire plan in under 30 seconds.
        </p>
        <Link
          href="/signup"
          className="flex items-center gap-2 bg-white text-black font-bold text-xs uppercase tracking-widest py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors whitespace-nowrap"
          style={{ fontFamily: 'var(--font-space-mono), monospace' }}
        >
          Start Your Project
          <ChevronRight size={14} />
        </Link>
      </div>
    </div>
  )
}
