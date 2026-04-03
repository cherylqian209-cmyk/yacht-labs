import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { Check, Clock, ChevronRight, Eye } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'
import type { Metadata } from 'next'

interface DailyShip {
  id: string
  ship_description: string
  ship_date: string
}

interface Task {
  id: string
  title: string
  description: string
  status: string
  phase: string
  estimated_hours: number
  actual_hours: number | null
}

interface Project {
  id: string
  name: string
  description: string
  phase: string
  created_at: string
  view_count: number
  tasks: Task[]
  daily_ships: DailyShip[]
  current_streak: number
  longest_streak: number
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data } = await supabase
    .from('projects')
    .select('name, description')
    .eq('slug', slug)
    .eq('is_public', true)
    .single()

  if (!data) return {}

  return {
    title: `${data.name} — Built with Yacht Labs`,
    description: data.description ?? `Follow ${data.name}'s shipping journey on Yacht Labs.`,
  }
}

const phaseOrder = ['think', 'build', 'ship', 'listen', 'repeat']
const phaseColors: Record<string, string> = {
  think: '#8b5cf6',
  build: '#3b82f6',
  ship: '#f97316',
  listen: '#22c55e',
  repeat: '#f59e0b',
}

export default async function PublicProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: project, error } = await supabase
    .from('projects')
    .select('*, tasks(*), daily_ships(*)')
    .eq('slug', slug)
    .eq('is_public', true)
    .single<Project>()

  if (error || !project) notFound()

  // Increment view count (fire and forget)
  supabase
    .from('projects')
    .update({ view_count: (project.view_count ?? 0) + 1 })
    .eq('id', project.id)
    .then(() => {})

  const tasks: Task[] = project.tasks ?? []
  const ships: DailyShip[] = project.daily_ships ?? []
  const completedTasks = tasks.filter((t) => t.status === 'done').length
  const progress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0
  const daysElapsed = Math.floor(
    (Date.now() - new Date(project.created_at).getTime()) / (1000 * 60 * 60 * 24)
  )
  const currentPhaseIdx = phaseOrder.indexOf(project.phase)

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-[#1a1a1a]">
        <Link
          href="/"
          className="text-xs font-bold tracking-widest uppercase text-white"
          style={{ fontFamily: 'var(--font-space-mono), monospace' }}
        >
          ✦✦ YACHT LABS
        </Link>
        <Link
          href="/signup"
          className="px-4 py-2 bg-white text-black text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-gray-100 transition-colors"
          style={{ fontFamily: 'var(--font-space-mono), monospace' }}
        >
          Start Your Project
        </Link>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <span
              className="text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider"
              style={{
                backgroundColor: `${phaseColors[project.phase] ?? '#888888'}22`,
                color: phaseColors[project.phase] ?? '#888888',
                fontFamily: 'var(--font-space-mono), monospace',
              }}
            >
              {project.phase} phase
            </span>
            {(project.current_streak ?? 0) > 0 && (
              <span className="text-xs text-[#f59e0b]">
                🔥 {project.current_streak}-day streak
              </span>
            )}
          </div>
          <h1
            className="text-3xl sm:text-4xl font-bold text-white uppercase tracking-widest mb-3"
            style={{ fontFamily: 'var(--font-space-mono), monospace' }}
          >
            {project.name}
          </h1>
          {project.description && (
            <p className="text-[#888888] text-sm max-w-xl leading-relaxed">{project.description}</p>
          )}
          <div className="flex items-center gap-5 mt-3 text-xs text-[#555555]">
            <span className="flex items-center gap-1.5">
              <Clock size={11} />
              {daysElapsed === 0 ? 'Started today' : `${daysElapsed}d in progress`}
            </span>
            <span>{progress}% complete</span>
            {(project.view_count ?? 0) > 0 && (
              <span className="flex items-center gap-1.5">
                <Eye size={11} />
                {project.view_count} views
              </span>
            )}
          </div>
        </div>

        {/* Execution Pipeline */}
        <div className="bg-[#111111] border border-[#222222] rounded-xl p-6">
          <h2
            className="text-xs font-bold text-[#888888] uppercase tracking-widest mb-4"
            style={{ fontFamily: 'var(--font-space-mono), monospace' }}
          >
            EXECUTION PIPELINE
          </h2>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {phaseOrder.map((phase, idx) => {
              const isComplete = idx < currentPhaseIdx
              const isActive = idx === currentPhaseIdx
              return (
                <div key={phase} className="flex items-center gap-2 flex-shrink-0">
                  <div
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider ${
                      isComplete
                        ? 'bg-[#22c55e22] text-[#22c55e] border border-[#22c55e44]'
                        : isActive
                        ? 'bg-[#3b82f622] text-[#3b82f6] border-2 border-[#3b82f6]'
                        : 'bg-[#0a0a0a] text-[#555555] border border-[#222222]'
                    }`}
                    style={{ fontFamily: 'var(--font-space-mono), monospace' }}
                  >
                    {isComplete && <Check size={11} />}
                    {phase}
                  </div>
                  {idx < phaseOrder.length - 1 && (
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

        {/* Progress */}
        {tasks.length > 0 && (
          <div className="bg-[#111111] border border-[#222222] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2
                className="text-sm font-bold text-white uppercase tracking-widest"
                style={{ fontFamily: 'var(--font-space-mono), monospace' }}
              >
                BUILD PROGRESS ({completedTasks}/{tasks.length})
              </h2>
              <span className="text-xs text-[#888888]">{progress}%</span>
            </div>
            <div className="h-1.5 bg-[#1a1a1a] rounded-full mb-6 overflow-hidden">
              <div
                className="h-full bg-[#3b82f6] rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="space-y-2">
              {tasks
                .filter((t) => t.status === 'done')
                .map((task) => (
                  <div
                    key={task.id}
                    className="flex items-start gap-3 bg-[#22c55e08] rounded-lg px-3 py-2.5"
                  >
                    <div className="flex-shrink-0 w-4 h-4 rounded bg-[#22c55e] flex items-center justify-center mt-0.5">
                      <Check size={9} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#888888] line-through">{task.title}</p>
                    </div>
                    {task.actual_hours && (
                      <span className="text-xs text-[#444444] flex-shrink-0">{task.actual_hours}h</span>
                    )}
                  </div>
                ))}
              {tasks
                .filter((t) => t.status !== 'done')
                .slice(0, 3)
                .map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 bg-[#0a0a0a] rounded-lg px-3 py-2.5"
                  >
                    <div className="flex-shrink-0 w-4 h-4 rounded border-2 border-[#333333]" />
                    <p className="text-sm text-white">{task.title}</p>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Ship Log */}
        {ships.length > 0 && (
          <div className="bg-[#111111] border border-[#222222] rounded-xl p-6">
            <h2
              className="text-sm font-bold text-white uppercase tracking-widest mb-4"
              style={{ fontFamily: 'var(--font-space-mono), monospace' }}
            >
              SHIPPING LOG ({ships.length} entries)
            </h2>
            <div className="space-y-3">
              {[...ships]
                .sort((a, b) => new Date(b.ship_date).getTime() - new Date(a.ship_date).getTime())
                .map((ship) => (
                  <div key={ship.id} className="flex gap-4 bg-[#0a0a0a] rounded-lg px-4 py-3">
                    <div className="flex-shrink-0 text-right min-w-[72px]">
                      <p
                        className="text-xs text-[#555555] uppercase tracking-wider"
                        style={{ fontFamily: 'var(--font-space-mono), monospace' }}
                      >
                        {new Date(ship.ship_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                    <p className="text-sm text-[#888888] leading-relaxed">{ship.ship_description}</p>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="bg-[#111111] border border-[#8b5cf644] rounded-xl p-8 text-center">
          <p
            className="text-sm font-bold text-white uppercase tracking-widest mb-2"
            style={{ fontFamily: 'var(--font-space-mono), monospace' }}
          >
            Want to ship like this?
          </p>
          <p className="text-xs text-[#888888] mb-6 max-w-sm mx-auto">
            Yacht Labs gives you the framework, accountability, and AI tools to go from idea to shipped product in days.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 bg-white text-black font-bold text-xs uppercase tracking-widest py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors"
            style={{ fontFamily: 'var(--font-space-mono), monospace' }}
          >
            Start Your Project Free
            <ChevronRight size={14} />
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#1a1a1a] py-6 mt-12">
        <p className="text-center text-xs text-[#555555]" style={{ fontFamily: 'var(--font-space-mono), monospace' }}>
          Built with{' '}
          <Link href="/" className="text-[#8b5cf6] hover:text-[#a78bfa] transition-colors">
            ✦✦ YACHT LABS
          </Link>{' '}
          · Think · Build · Ship · Listen · Repeat
        </p>
      </footer>
    </div>
  )
}
