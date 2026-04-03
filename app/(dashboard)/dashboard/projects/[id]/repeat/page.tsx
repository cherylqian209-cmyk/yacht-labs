'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Check, ChevronRight, RefreshCw, Zap, TrendingUp, AlertTriangle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Project {
  id: string
  name: string
  phase: string
}

const pipelineSteps = [
  { key: 'think', label: 'Think' },
  { key: 'build', label: 'Build' },
  { key: 'ship', label: 'Ship' },
  { key: 'listen', label: 'Listen' },
  { key: 'repeat', label: 'Repeat' },
]

const improvements = [
  {
    rank: 1,
    title: 'Fix onboarding drop-off at step 3',
    effort: 'LOW',
    impact: 'HIGH',
    source: 'User feedback + metrics',
    type: 'fix',
    color: '#ef4444',
  },
  {
    rank: 2,
    title: 'Add dark mode toggle',
    effort: 'LOW',
    impact: 'MED',
    source: '6 user requests',
    type: 'feature',
    color: '#8b5cf6',
  },
  {
    rank: 3,
    title: 'Optimize page load below 1.5s',
    effort: 'MED',
    impact: 'HIGH',
    source: 'Performance metrics',
    type: 'performance',
    color: '#f59e0b',
  },
  {
    rank: 4,
    title: 'Add keyboard shortcuts for power users',
    effort: 'MED',
    impact: 'MED',
    source: 'User feedback',
    type: 'feature',
    color: '#3b82f6',
  },
  {
    rank: 5,
    title: 'Implement team collaboration features',
    effort: 'HIGH',
    impact: 'HIGH',
    source: 'Sales requests',
    type: 'feature',
    color: '#14b8a6',
  },
]

const iterationStats = [
  { label: 'ITERATION', value: '#2', icon: RefreshCw, color: '#14b8a6' },
  { label: 'FIXES QUEUED', value: '1', icon: AlertTriangle, color: '#ef4444' },
  { label: 'FEATURES', value: '4', icon: Zap, color: '#8b5cf6' },
  { label: 'VELOCITY GAIN', value: '+23%', icon: TrendingUp, color: '#22c55e' },
]

export default function RepeatPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState(false)
  const [selected, setSelected] = useState<number[]>([1, 2, 3])

  useEffect(() => {
    const fetchProject = async () => {
      const supabase = createClient()
      const { data } = await supabase.from('projects').select('*').eq('id', id).single()
      setProject(data)
      setLoading(false)
    }
    fetchProject()
  }, [id])

  const toggleItem = (rank: number) => {
    setSelected((prev) =>
      prev.includes(rank) ? prev.filter((r) => r !== rank) : [...prev, rank]
    )
  }

  const handleStartIteration = async () => {
    setStarting(true)
    const supabase = createClient()
    await supabase.from('projects').update({ phase: 'build' }).eq('id', id)
    router.push(`/dashboard/projects/${id}/build`)
  }

  if (loading || !project) {
    return (
      <div className="px-6 py-10 max-w-5xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-[#111111] rounded w-1/3" />
          <div className="h-48 bg-[#111111] rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="px-6 py-10 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <p
          className="text-xs text-[#555555] uppercase tracking-widest mb-2"
          style={{ fontFamily: 'var(--font-space-mono), monospace' }}
        >
          PHASE 05
        </p>
        <h1
          className="text-3xl font-bold text-white uppercase tracking-widest"
          style={{ fontFamily: 'var(--font-space-mono), monospace' }}
        >
          REPEAT: NEXT ITERATION
        </h1>
        <p className="text-[#888888] text-sm mt-1">{project.name} · AI-prioritized improvements</p>
      </div>

      {/* Pipeline */}
      <div className="bg-[#111111] border border-[#222222] rounded-xl p-6">
        <h2
          className="text-xs font-bold text-[#888888] uppercase tracking-widest mb-4"
          style={{ fontFamily: 'var(--font-space-mono), monospace' }}
        >
          EXECUTION PIPELINE
        </h2>
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {pipelineSteps.map((step, idx) => {
            const isComplete = ['think', 'build', 'ship', 'listen'].includes(step.key)
            const isActive = step.key === 'repeat'
            return (
              <div key={step.key} className="flex items-center gap-2 flex-shrink-0">
                <div
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider ${
                    isComplete
                      ? 'bg-[#22c55e22] text-[#22c55e] border border-[#22c55e44]'
                      : isActive
                      ? 'bg-[#14b8a622] text-[#14b8a6] border-2 border-[#14b8a6]'
                      : 'bg-[#0a0a0a] text-[#555555] border border-[#222222]'
                  }`}
                  style={{ fontFamily: 'var(--font-space-mono), monospace' }}
                >
                  {isComplete && <Check size={12} />}
                  {step.label}
                </div>
                {idx < pipelineSteps.length - 1 && (
                  <ChevronRight size={14} className={isComplete ? 'text-[#22c55e]' : 'text-[#333333]'} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Iteration Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {iterationStats.map((stat) => (
          <div key={stat.label} className="bg-[#111111] border border-[#222222] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <stat.icon size={14} style={{ color: stat.color }} />
              <span
                className="text-xs text-[#555555] uppercase tracking-wider"
                style={{ fontFamily: 'var(--font-space-mono), monospace' }}
              >
                {stat.label}
              </span>
            </div>
            <p
              className="text-2xl font-bold text-white"
              style={{ fontFamily: 'var(--font-space-mono), monospace' }}
            >
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Prioritized Improvements */}
      <div className="bg-[#111111] border border-[#222222] rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2
            className="text-sm font-bold text-white uppercase tracking-widest"
            style={{ fontFamily: 'var(--font-space-mono), monospace' }}
          >
            AI-PRIORITIZED BACKLOG
          </h2>
          <span className="text-xs text-[#555555]">{selected.length} selected for next sprint</span>
        </div>

        <div className="space-y-3">
          {improvements.map((item) => (
            <button
              key={item.rank}
              onClick={() => toggleItem(item.rank)}
              className={`w-full text-left flex items-start gap-4 p-4 rounded-xl border transition-all ${
                selected.includes(item.rank)
                  ? 'border-[#333333] bg-[#1a1a1a]'
                  : 'border-[#1a1a1a] bg-[#0a0a0a] opacity-60'
              }`}
            >
              {/* Checkbox */}
              <div
                className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 transition-colors ${
                  selected.includes(item.rank)
                    ? 'bg-[#22c55e] border-[#22c55e]'
                    : 'border-[#333333]'
                }`}
              >
                {selected.includes(item.rank) && <Check size={11} className="text-white" />}
              </div>

              {/* Rank */}
              <span
                className="text-xs font-bold text-[#555555] flex-shrink-0 w-6 text-right mt-0.5"
                style={{ fontFamily: 'var(--font-space-mono), monospace' }}
              >
                #{item.rank}
              </span>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white mb-1">{item.title}</p>
                <p className="text-xs text-[#555555]">Source: {item.source}</p>
              </div>

              {/* Badges */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    item.impact === 'HIGH'
                      ? 'bg-[#22c55e22] text-[#22c55e]'
                      : 'bg-[#f59e0b22] text-[#f59e0b]'
                  }`}
                  style={{ fontFamily: 'var(--font-space-mono), monospace' }}
                >
                  {item.impact} IMPACT
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    item.effort === 'LOW'
                      ? 'bg-[#3b82f622] text-[#3b82f6]'
                      : item.effort === 'MED'
                      ? 'bg-[#f59e0b22] text-[#f59e0b]'
                      : 'bg-[#ef444422] text-[#ef4444]'
                  }`}
                  style={{ fontFamily: 'var(--font-space-mono), monospace' }}
                >
                  {item.effort} EFFORT
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-[#555555]">
          Starting iteration will return you to the Build phase with new tasks.
        </p>
        <button
          onClick={handleStartIteration}
          disabled={starting || selected.length === 0}
          className="flex items-center gap-2 bg-[#14b8a6] text-white font-bold text-xs uppercase tracking-widest py-3 px-6 rounded-lg hover:bg-[#0d9488] transition-colors disabled:opacity-50"
          style={{ fontFamily: 'var(--font-space-mono), monospace' }}
        >
          {starting ? 'STARTING...' : `START ITERATION (${selected.length})`}
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  )
}
