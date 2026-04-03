import Link from 'next/link'
import { Check, Clock, Zap, TrendingUp, Code, ChevronRight } from 'lucide-react'
import PhaseNav from '@/components/demo/PhaseNav'
import { demoProject } from '@/lib/demo/demoData'

const pipelineSteps = [
  { key: 'think', label: 'Think', status: 'complete' },
  { key: 'build', label: 'Build', status: 'active' },
  { key: 'ship', label: 'Ship', status: 'pending' },
  { key: 'listen', label: 'Listen', status: 'pending' },
  { key: 'repeat', label: 'Repeat', status: 'pending' },
]

export default function DemoProjectPage() {
  const { name, description, stats, build_phase } = demoProject
  const tasks = build_phase.tasks
  const doneTasks = tasks.filter((t) => t.status === 'complete').length
  const progress = Math.round(build_phase.progress * 100)

  return (
    <div className="px-6 py-10 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1
            className="text-3xl font-bold text-white uppercase tracking-widest"
            style={{ fontFamily: 'var(--font-space-mono), monospace' }}
          >
            {name}
          </h1>
          <span
            className="px-2 py-0.5 bg-[#8b5cf622] text-[#8b5cf6] border border-[#8b5cf644] text-xs font-bold uppercase tracking-wider rounded"
            style={{ fontFamily: 'var(--font-space-mono), monospace' }}
          >
            Demo
          </span>
        </div>
        <p className="text-[#888888] text-sm max-w-xl">{description}</p>
        <p className="text-xs text-[#555555] mt-1.5">
          Started 3 days ago · {progress}% complete · Ships in 2 days
        </p>
      </div>

      {/* Phase Nav */}
      <PhaseNav />

      {/* Execution Pipeline */}
      <div className="bg-[#111111] border border-[#222222] rounded-xl p-6">
        <h2
          className="text-xs font-bold text-[#888888] uppercase tracking-widest mb-4"
          style={{ fontFamily: 'var(--font-space-mono), monospace' }}
        >
          EXECUTION PIPELINE
        </h2>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {pipelineSteps.map((step, idx) => (
            <div key={step.key} className="flex items-center gap-2 flex-shrink-0">
              <div
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider ${
                  step.status === 'complete'
                    ? 'bg-[#22c55e22] text-[#22c55e] border border-[#22c55e44]'
                    : step.status === 'active'
                    ? 'bg-[#3b82f622] text-[#3b82f6] border-2 border-[#3b82f6]'
                    : 'bg-[#0a0a0a] text-[#555555] border border-[#222222]'
                }`}
                style={{ fontFamily: 'var(--font-space-mono), monospace' }}
              >
                {step.status === 'complete' && <Check size={11} />}
                {step.label}
              </div>
              {idx < pipelineSteps.length - 1 && (
                <ChevronRight
                  size={14}
                  className={step.status === 'complete' ? 'text-[#22c55e]' : 'text-[#333333]'}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: Clock, label: 'TIME TO SHIP', value: stats.time_to_ship, color: '#f59e0b' },
          { icon: Zap, label: 'AI ASSISTS', value: String(stats.ai_assists), color: '#8b5cf6' },
          { icon: Code, label: 'LINES GENERATED', value: stats.code_generated.toLocaleString(), color: '#3b82f6' },
          { icon: TrendingUp, label: 'VELOCITY BOOST', value: `+${stats.velocity_increase}%`, color: '#22c55e' },
        ].map((s) => (
          <div key={s.label} className="bg-[#111111] border border-[#222222] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <s.icon size={14} style={{ color: s.color }} />
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

      {/* Build progress snapshot */}
      <div className="bg-[#111111] border border-[#222222] rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2
            className="text-sm font-bold text-white uppercase tracking-widest"
            style={{ fontFamily: 'var(--font-space-mono), monospace' }}
          >
            BUILD PROGRESS ({doneTasks}/{tasks.length} tasks)
          </h2>
          <Link
            href="/demo/project/build"
            className="text-xs text-[#8b5cf6] hover:text-[#a78bfa] transition-colors uppercase tracking-wider"
            style={{ fontFamily: 'var(--font-space-mono), monospace' }}
          >
            View all →
          </Link>
        </div>
        <div className="h-1.5 bg-[#1a1a1a] rounded-full mb-4 overflow-hidden">
          <div
            className="h-full bg-[#3b82f6] rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="space-y-2">
          {tasks.slice(0, 4).map((task) => (
            <div
              key={task.id}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 ${
                task.status === 'complete' ? 'bg-[#22c55e08]' : 'bg-[#0a0a0a]'
              }`}
            >
              <div
                className={`flex-shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center ${
                  task.status === 'complete'
                    ? 'bg-[#22c55e] border-[#22c55e]'
                    : task.status === 'in_progress'
                    ? 'border-[#3b82f6]'
                    : 'border-[#333333]'
                }`}
              >
                {task.status === 'complete' && <Check size={9} className="text-white" />}
              </div>
              <span
                className={`text-sm flex-1 ${
                  task.status === 'complete' ? 'text-[#555555] line-through' : 'text-white'
                }`}
              >
                {task.title}
              </span>
              {task.status === 'in_progress' && (
                <span className="text-xs text-[#3b82f6] font-bold uppercase tracking-wider" style={{ fontFamily: 'var(--font-space-mono), monospace' }}>
                  Active
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-[#111111] border border-[#8b5cf644] rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p
            className="text-sm font-bold text-white uppercase tracking-widest mb-1"
            style={{ fontFamily: 'var(--font-space-mono), monospace' }}
          >
            Ready to build your own?
          </p>
          <p className="text-xs text-[#888888]">
            Start with your idea. AI handles the rest.
          </p>
        </div>
        <Link
          href="/signup"
          className="flex items-center gap-2 bg-white text-black font-bold text-xs uppercase tracking-widest py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors whitespace-nowrap"
          style={{ fontFamily: 'var(--font-space-mono), monospace' }}
        >
          Start Free
          <ChevronRight size={14} />
        </Link>
      </div>
    </div>
  )
}
