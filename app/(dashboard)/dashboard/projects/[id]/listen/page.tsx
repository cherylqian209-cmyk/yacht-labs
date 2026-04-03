'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Check, ChevronRight, TrendingUp, TrendingDown, AlertTriangle, Sparkles } from 'lucide-react'
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

const mockMetrics = [
  { label: 'ACTIVE USERS', value: '142', change: '+12%', up: true },
  { label: 'PAGE LOAD', value: '1.8s', change: '-0.3s', up: true },
  { label: 'ERROR RATE', value: '0.4%', change: '-0.1%', up: true },
  { label: 'SATISFACTION', value: '4.2/5', change: '+0.3', up: true },
]

const mockInsights = [
  {
    type: 'warning',
    title: 'Onboarding Drop-off',
    description: '38% of new users abandon during step 3 of onboarding.',
    action: 'Simplify step 3 — consider removing optional fields.',
    impact: 'HIGH',
  },
  {
    type: 'success',
    title: 'Strong Core Retention',
    description: 'Users who complete onboarding return 4.1x more often.',
    action: 'Invest in improving the onboarding completion rate.',
    impact: 'HIGH',
  },
  {
    type: 'info',
    title: 'Feature Request Pattern',
    description: '6 users independently requested dark mode toggle.',
    action: 'Add to backlog for next iteration sprint.',
    impact: 'MED',
  },
]

const mockFeedback = [
  {
    initials: 'AK',
    name: 'Alex K.',
    rating: '★★★★★',
    comment: 'The AI task generation is incredible — saved me days of planning.',
    sentiment: 'positive',
    color: '#14b8a6',
  },
  {
    initials: 'SR',
    name: 'Sarah R.',
    rating: '★★★☆☆',
    comment: 'Love the concept. The onboarding flow needs work — got confused on step 3.',
    sentiment: 'mixed',
    color: '#f97316',
  },
  {
    initials: 'MJ',
    name: 'Marcus J.',
    rating: '★★★★☆',
    comment: 'Really solid tool. Would love a dark mode and keyboard shortcuts.',
    sentiment: 'positive',
    color: '#3b82f6',
  },
]

export default function ListenPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [advancing, setAdvancing] = useState(false)

  useEffect(() => {
    const fetchProject = async () => {
      const supabase = createClient()
      const { data } = await supabase.from('projects').select('*').eq('id', id).single()
      setProject(data)
      setLoading(false)
    }
    fetchProject()
  }, [id])

  const handleAdvance = async () => {
    setAdvancing(true)
    const supabase = createClient()
    await supabase.from('projects').update({ phase: 'repeat' }).eq('id', id)
    router.push(`/dashboard/projects/${id}/repeat`)
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
          PHASE 04
        </p>
        <h1
          className="text-3xl font-bold text-white uppercase tracking-widest"
          style={{ fontFamily: 'var(--font-space-mono), monospace' }}
        >
          LISTEN: MISSION CONTROL
        </h1>
        <p className="text-[#888888] text-sm mt-1">{project.name} · Live data</p>
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
            const isComplete = ['think', 'build', 'ship'].includes(step.key)
            const isActive = step.key === 'listen'
            return (
              <div key={step.key} className="flex items-center gap-2 flex-shrink-0">
                <div
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider ${
                    isComplete
                      ? 'bg-[#22c55e22] text-[#22c55e] border border-[#22c55e44]'
                      : isActive
                      ? 'bg-[#8b5cf622] text-[#8b5cf6] border-2 border-[#8b5cf6]'
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

      {/* Key Metrics */}
      <div>
        <h2
          className="text-xs font-bold text-[#555555] uppercase tracking-widest mb-4"
          style={{ fontFamily: 'var(--font-space-mono), monospace' }}
        >
          KEY METRICS · LAST 7 DAYS
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {mockMetrics.map((metric) => (
            <div
              key={metric.label}
              className="bg-[#111111] border border-[#222222] rounded-xl p-4"
            >
              <p
                className="text-xs text-[#555555] uppercase tracking-wider mb-2"
                style={{ fontFamily: 'var(--font-space-mono), monospace' }}
              >
                {metric.label}
              </p>
              <p
                className="text-3xl font-bold text-white mb-1"
                style={{ fontFamily: 'var(--font-space-mono), monospace' }}
              >
                {metric.value}
              </p>
              <div className="flex items-center gap-1">
                {metric.up ? (
                  <TrendingUp size={12} className="text-[#22c55e]" />
                ) : (
                  <TrendingDown size={12} className="text-[#ef4444]" />
                )}
                <span className={`text-xs ${metric.up ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                  {metric.change}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-[#111111] border border-[#222222] rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={16} className="text-[#8b5cf6]" />
          <h2
            className="text-sm font-bold text-white uppercase tracking-widest"
            style={{ fontFamily: 'var(--font-space-mono), monospace' }}
          >
            AI INSIGHTS
          </h2>
        </div>
        <div className="space-y-3">
          {mockInsights.map((insight, i) => (
            <div
              key={i}
              className={`p-4 rounded-xl border-l-2 ${
                insight.type === 'warning'
                  ? 'bg-[#f59e0b08] border-[#f59e0b]'
                  : insight.type === 'success'
                  ? 'bg-[#22c55e08] border-[#22c55e]'
                  : 'bg-[#3b82f608] border-[#3b82f6]'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2 flex-1">
                  {insight.type === 'warning' ? (
                    <AlertTriangle size={14} className="text-[#f59e0b] flex-shrink-0 mt-0.5" />
                  ) : insight.type === 'success' ? (
                    <Check size={14} className="text-[#22c55e] flex-shrink-0 mt-0.5" />
                  ) : (
                    <Sparkles size={14} className="text-[#3b82f6] flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3
                        className="text-sm font-bold text-white"
                        style={{ fontFamily: 'var(--font-space-mono), monospace' }}
                      >
                        {insight.title}
                      </h3>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          insight.impact === 'HIGH'
                            ? 'bg-[#ef444422] text-[#ef4444]'
                            : 'bg-[#f59e0b22] text-[#f59e0b]'
                        }`}
                        style={{ fontFamily: 'var(--font-space-mono), monospace' }}
                      >
                        {insight.impact} IMPACT
                      </span>
                    </div>
                    <p className="text-xs text-[#888888] mb-1">{insight.description}</p>
                    <p className="text-xs text-[#555555]">→ {insight.action}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User Feedback */}
      <div className="bg-[#111111] border border-[#222222] rounded-xl p-6">
        <h2
          className="text-sm font-bold text-white uppercase tracking-widest mb-4"
          style={{ fontFamily: 'var(--font-space-mono), monospace' }}
        >
          RECENT USER FEEDBACK
        </h2>
        <div className="space-y-3">
          {mockFeedback.map((fb, i) => (
            <div
              key={i}
              className={`p-4 rounded-xl border-l-2 ${
                fb.sentiment === 'positive'
                  ? 'bg-[#22c55e08] border-[#22c55e]'
                  : 'bg-[#f59e0b08] border-[#f59e0b]'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white"
                  style={{ backgroundColor: fb.color }}
                >
                  {fb.initials}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-white">{fb.name}</span>
                    <span className="text-xs text-[#f59e0b]">{fb.rating}</span>
                  </div>
                  <p className="text-sm text-[#888888] leading-relaxed">{fb.comment}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="flex justify-end">
        <button
          onClick={handleAdvance}
          disabled={advancing}
          className="flex items-center gap-2 bg-white text-black font-bold text-xs uppercase tracking-widest py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
          style={{ fontFamily: 'var(--font-space-mono), monospace' }}
        >
          {advancing ? 'LOADING...' : 'START NEXT ITERATION'}
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  )
}
