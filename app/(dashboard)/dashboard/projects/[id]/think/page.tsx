'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Sparkles, ChevronRight, AlertTriangle, CheckCircle, Clock, Zap } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Project {
  id: string
  name: string
  description: string
  idea: string
  analysis: {
    projectName?: string
    coreFeatures?: string[]
    niceToHave?: string[]
    outOfScope?: string[]
    techStack?: Record<string, string>
    estimatedDays?: number
    risks?: string[]
  }
  tasks: Task[]
  phase: string
}

interface Task {
  id: string
  title: string
  phase: string
  priority: string
  estimated_hours: number
}

const phaseTagColors: Record<string, { bg: string; text: string }> = {
  setup: { bg: '#8b5cf622', text: '#8b5cf6' },
  build: { bg: '#14b8a622', text: '#14b8a6' },
  ship: { bg: '#3b82f622', text: '#3b82f6' },
}

const taskGroups = [
  { label: 'Days 1-2: Foundation', phases: ['setup'] },
  { label: 'Days 3-4: Core Build', phases: ['build'] },
  { label: 'Days 5-7: Ship & Polish', phases: ['ship'] },
]

export default function ThinkPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [advancing, setAdvancing] = useState(false)

  useEffect(() => {
    const fetchProject = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('projects')
        .select('*, tasks(*)')
        .eq('id', id)
        .single()

      setProject(data)
      setLoading(false)
    }
    fetchProject()
  }, [id])

  const handleStartBuilding = async () => {
    setAdvancing(true)
    const supabase = createClient()
    await supabase.from('projects').update({ phase: 'build' }).eq('id', id)
    router.push(`/dashboard/projects/${id}/build`)
  }

  if (loading) {
    return (
      <div className="px-6 py-10 max-w-5xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-[#111111] rounded w-1/3" />
          <div className="h-4 bg-[#111111] rounded w-1/2" />
          <div className="h-48 bg-[#111111] rounded-xl" />
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="px-6 py-10 max-w-5xl mx-auto text-center">
        <p className="text-[#888888]">Project not found.</p>
      </div>
    )
  }

  const analysis = project.analysis ?? {}
  const tasks: Task[] = project.tasks ?? []

  return (
    <div className="px-6 py-10 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <p
          className="text-xs text-[#555555] uppercase tracking-widest mb-2"
          style={{ fontFamily: 'var(--font-space-mono), monospace' }}
        >
          PHASE 01
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

      {/* Project Brief */}
      <div className="bg-[#111111] border border-[#222222] rounded-xl p-6">
        <h2
          className="text-xs font-bold text-[#888888] uppercase tracking-widest mb-4"
          style={{ fontFamily: 'var(--font-space-mono), monospace' }}
        >
          PROJECT BRIEF
        </h2>
        <div className="border-l-2 border-[#8b5cf6] pl-4">
          <p className="text-white font-semibold mb-1">{project.name}</p>
          <p className="text-[#888888] text-sm leading-relaxed">{project.idea || project.description}</p>
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
        </div>

        {/* Feature columns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Core features */}
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
              {(analysis.coreFeatures ?? []).map((f: string, i: number) => (
                <li key={i} className="text-xs text-[#22c55e] opacity-90 leading-relaxed">
                  • {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Nice to have */}
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
              {(analysis.niceToHave ?? []).map((f: string, i: number) => (
                <li key={i} className="text-xs text-[#3b82f6] opacity-90 leading-relaxed">
                  • {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Out of scope */}
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
              {(analysis.outOfScope ?? []).map((f: string, i: number) => (
                <li key={i} className="text-xs text-[#555555] leading-relaxed">
                  • {f}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Tech Stack */}
        {analysis.techStack && (
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
                  <span className="text-xs text-[#8b5cf6] opacity-80">{value as string}</span>
                </div>
              ))}
            </div>
          </div>
        )}
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
          {analysis.estimatedDays && (
            <span className="text-xs text-[#888888]">~{analysis.estimatedDays} days</span>
          )}
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

          {tasks.length === 0 && (
            <p className="text-[#555555] text-sm text-center py-4">
              No tasks generated yet. Tasks will appear here after AI analysis.
            </p>
          )}
        </div>
      </div>

      {/* Risk Assessment */}
      {(analysis.risks ?? []).length > 0 && (
        <div className="bg-[#111111] border border-[#222222] rounded-xl p-6">
          <h2
            className="text-sm font-bold text-white uppercase tracking-widest mb-4"
            style={{ fontFamily: 'var(--font-space-mono), monospace' }}
          >
            RISK ASSESSMENT
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(analysis.risks ?? []).map((risk: string, i: number) => (
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
      )}

      {/* CTA */}
      <div className="flex justify-end">
        <button
          onClick={handleStartBuilding}
          disabled={advancing}
          className="flex items-center gap-2 bg-white text-black font-bold text-xs uppercase tracking-widest py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
          style={{ fontFamily: 'var(--font-space-mono), monospace' }}
        >
          {advancing ? 'LOADING...' : 'START BUILDING'}
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  )
}
