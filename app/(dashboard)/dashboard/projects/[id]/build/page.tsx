'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Check, Clock, Zap, Code, TrendingUp, ChevronRight, Loader2, Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import DailyCheckInModal from '@/components/streak/DailyCheckInModal'
import StreakWidget from '@/components/streak/StreakWidget'
import { shouldShowCheckIn } from '@/lib/streak/checkInPrompt'

interface Task {
  id: string
  title: string
  description: string
  phase: string
  priority: string
  estimated_hours: number
  status: string
  ai_generated: boolean
}

interface Project {
  id: string
  name: string
  phase: string
  tasks: Task[]
  current_streak?: number
  longest_streak?: number
  last_ship_date?: string | null
}

const pipelineSteps = [
  { key: 'think', label: 'Think' },
  { key: 'build', label: 'Build' },
  { key: 'ship', label: 'Ship' },
  { key: 'listen', label: 'Listen' },
  { key: 'repeat', label: 'Repeat' },
]

export default function BuildPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [advancing, setAdvancing] = useState(false)
  const [updatingTask, setUpdatingTask] = useState<string | null>(null)
  const [generatingCode, setGeneratingCode] = useState<string | null>(null)
  const [showCheckIn, setShowCheckIn] = useState(false)

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

      if (data && shouldShowCheckIn(data.last_ship_date)) {
        const timer = setTimeout(() => setShowCheckIn(true), 3000)
        return () => clearTimeout(timer)
      }
    }
    fetchProject()
  }, [id])

  const handleLogShip = async (description: string) => {
    const res = await fetch('/api/ships/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId: id, description }),
    })
    const data = await res.json()
    if (data.success) {
      setProject((prev) =>
        prev
          ? {
              ...prev,
              current_streak: data.streak,
              longest_streak: data.longestStreak,
              last_ship_date: new Date().toISOString().split('T')[0],
            }
          : prev
      )
    }
    setShowCheckIn(false)
  }

  const toggleTask = async (task: Task) => {
    setUpdatingTask(task.id)
    const supabase = createClient()
    const newStatus = task.status === 'done' ? 'todo' : 'done'
    await supabase.from('tasks').update({ status: newStatus }).eq('id', task.id)
    setProject((prev) =>
      prev
        ? {
            ...prev,
            tasks: prev.tasks.map((t) =>
              t.id === task.id ? { ...t, status: newStatus } : t
            ),
          }
        : prev
    )
    setUpdatingTask(null)
  }

  const generateCode = async (task: Task) => {
    setGeneratingCode(task.id)
    try {
      const response = await fetch('/api/ai/generate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: task.title,
          context: task.description,
        }),
      })
      const { code, explanation } = await response.json()
      alert(`Code generated!\n\n${explanation}\n\n---\n${code}`)
    } catch {
      // ignore
    }
    setGeneratingCode(null)
  }

  const handleAdvance = async () => {
    setAdvancing(true)
    const supabase = createClient()
    await supabase.from('projects').update({ phase: 'ship' }).eq('id', id)
    router.push(`/dashboard/projects/${id}/ship`)
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

  const tasks = project.tasks ?? []
  const doneTasks = tasks.filter((t) => t.status === 'done').length
  const progress = tasks.length > 0 ? Math.round((doneTasks / tasks.length) * 100) : 0

  const totalHours = tasks.reduce((sum, t) => sum + (t.estimated_hours ?? 0), 0)
  const aiTasks = tasks.filter((t) => t.ai_generated).length

  return (
    <div className="px-6 py-10 max-w-5xl mx-auto space-y-8">
      {/* Daily check-in modal */}
      {showCheckIn && project && (
        <DailyCheckInModal
          projectName={project.name}
          currentStreak={project.current_streak ?? 0}
          onClose={() => setShowCheckIn(false)}
          onSubmit={handleLogShip}
        />
      )}

      {/* Header */}
      <div>
        <p
          className="text-xs text-[#555555] uppercase tracking-widest mb-2"
          style={{ fontFamily: 'var(--font-space-mono), monospace' }}
        >
          PHASE 02
        </p>
        <h1
          className="text-3xl font-bold text-white uppercase tracking-widest"
          style={{ fontFamily: 'var(--font-space-mono), monospace' }}
        >
          BUILD PHASE
        </h1>
        <p className="text-[#888888] text-sm mt-1">{project.name}</p>
      </div>

      {/* Execution Pipeline */}
      <div className="bg-[#111111] border border-[#222222] rounded-xl p-6">
        <h2
          className="text-xs font-bold text-[#888888] uppercase tracking-widest mb-4"
          style={{ fontFamily: 'var(--font-space-mono), monospace' }}
        >
          EXECUTION PIPELINE
        </h2>
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {pipelineSteps.map((step, idx) => {
            const isComplete = step.key === 'think'
            const isActive = step.key === 'build'
            const isPending = !isComplete && !isActive
            return (
              <div key={step.key} className="flex items-center gap-2 flex-shrink-0">
                <div
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider ${
                    isComplete
                      ? 'bg-[#22c55e22] text-[#22c55e] border border-[#22c55e44]'
                      : isActive
                      ? 'bg-[#3b82f622] text-[#3b82f6] border-2 border-[#3b82f6]'
                      : 'bg-[#0a0a0a] text-[#555555] border border-[#222222]'
                  }`}
                  style={{ fontFamily: 'var(--font-space-mono), monospace' }}
                >
                  {isComplete && <Check size={12} />}
                  {step.label}
                </div>
                {idx < pipelineSteps.length - 1 && (
                  <ChevronRight
                    size={14}
                    className={isComplete ? 'text-[#22c55e]' : 'text-[#333333]'}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            icon: Clock,
            label: 'TIME TO SHIP',
            value: `${totalHours}h`,
            color: '#f59e0b',
          },
          {
            icon: Sparkles,
            label: 'AI ASSISTS',
            value: `${aiTasks}`,
            color: '#8b5cf6',
          },
          {
            icon: Code,
            label: 'TASKS TOTAL',
            value: `${tasks.length}`,
            color: '#3b82f6',
          },
          {
            icon: TrendingUp,
            label: 'VELOCITY',
            value: `${progress}%`,
            color: '#22c55e',
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-[#111111] border border-[#222222] rounded-xl p-4"
          >
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

      {/* Streak Widget */}
      {(project.current_streak ?? 0) > 0 || project.last_ship_date ? (
        <StreakWidget
          currentStreak={project.current_streak ?? 0}
          longestStreak={project.longest_streak ?? 0}
        />
      ) : null}

      {/* Task List */}
      <div className="bg-[#111111] border border-[#222222] rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2
            className="text-sm font-bold text-white uppercase tracking-widest"
            style={{ fontFamily: 'var(--font-space-mono), monospace' }}
          >
            TASKS ({doneTasks}/{tasks.length})
          </h2>
          <span className="text-xs text-[#888888]">{progress}% complete</span>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-[#1a1a1a] rounded-full mb-6 overflow-hidden">
          <div
            className="h-full bg-[#3b82f6] rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="space-y-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`flex items-center gap-3 rounded-lg px-3 py-3 transition-colors ${
                task.status === 'done' ? 'bg-[#22c55e08]' : 'bg-[#0a0a0a]'
              }`}
            >
              <button
                onClick={() => toggleTask(task)}
                disabled={updatingTask === task.id}
                className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                  task.status === 'done'
                    ? 'bg-[#22c55e] border-[#22c55e]'
                    : 'border-[#333333] hover:border-[#555555]'
                }`}
              >
                {updatingTask === task.id ? (
                  <Loader2 size={10} className="animate-spin text-white" />
                ) : task.status === 'done' ? (
                  <Check size={11} className="text-white" />
                ) : null}
              </button>

              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm ${
                    task.status === 'done'
                      ? 'text-[#555555] line-through'
                      : 'text-white'
                  }`}
                >
                  {task.title}
                </p>
                {task.description && (
                  <p className="text-xs text-[#555555] mt-0.5 truncate">{task.description}</p>
                )}
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <span
                  className="text-xs px-2 py-0.5 rounded"
                  style={{
                    backgroundColor:
                      task.priority === 'high'
                        ? '#ef444422'
                        : task.priority === 'medium'
                        ? '#f59e0b22'
                        : '#55555522',
                    color:
                      task.priority === 'high'
                        ? '#ef4444'
                        : task.priority === 'medium'
                        ? '#f59e0b'
                        : '#888888',
                    fontFamily: 'var(--font-space-mono), monospace',
                  }}
                >
                  {task.priority}
                </span>
                <span className="text-xs text-[#555555]">{task.estimated_hours}h</span>
                {task.ai_generated && (
                  <button
                    onClick={() => generateCode(task)}
                    disabled={generatingCode === task.id}
                    className="flex items-center gap-1 text-xs text-[#8b5cf6] hover:text-[#a78bfa] transition-colors"
                    title="Generate code"
                  >
                    {generatingCode === task.id ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Zap size={12} />
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}

          {tasks.length === 0 && (
            <p className="text-[#555555] text-sm text-center py-8">
              No tasks yet. They will be generated from your project plan.
            </p>
          )}
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
          {advancing ? 'LOADING...' : 'READY TO SHIP'}
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  )
}
