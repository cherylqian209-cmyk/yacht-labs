'use client'

import Link from 'next/link'
import { Calendar, Clock, Eye, TrendingUp } from 'lucide-react'
import ViewTracker from './ViewTracker'
import ShareButtons from './ShareButtons'
import PhaseTimeline from './PhaseTimeline'
import TaskList from './TaskList'
import ShippingLog from './ShippingLog'

interface Task {
  id: string
  title: string
  description?: string
  phase: string
  status: string
  priority: string
  estimated_hours: number
  actual_hours?: number
  completed_at?: string
  ai_generated?: boolean
  order_index?: number
}

interface DailyShip {
  id: string
  ship_description: string
  ship_date: string
}

interface Project {
  id: string
  name: string
  description?: string
  phase: string
  status?: string
  slug: string
  created_at: string
  ship_date?: string
  view_count?: number
  shared_count?: number
  current_streak?: number
  tech_stack?: Record<string, string>
  tasks: Task[]
  daily_ships: DailyShip[]
}

export default function PublicProjectView({ project }: { project: Project }) {
  const completedTasks = project.tasks?.filter((t) => t.status === 'done').length ?? 0
  const totalTasks = project.tasks?.length ?? 0
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const startDate = new Date(project.created_at)
  const daysElapsed = Math.floor((Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  const isShipped = project.phase === 'listen' || project.phase === 'repeat'
  const shipDate = project.ship_date ? new Date(project.ship_date) : null
  const timeToShip =
    isShipped && shipDate
      ? Math.floor((shipDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
      : null

  const totalHours = project.tasks?.reduce(
    (sum, t) => sum + (t.actual_hours ?? t.estimated_hours ?? 0),
    0
  ) ?? 0

  const completedTaskList = project.tasks
    ?.filter((t) => t.status === 'done')
    .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0)) ?? []

  const sortedShips = [...(project.daily_ships ?? [])].sort(
    (a, b) => new Date(b.ship_date).getTime() - new Date(a.ship_date).getTime()
  )

  return (
    <>
      <ViewTracker slug={project.slug} />

      <div className="min-h-screen bg-gray-50">
        {/* Hero */}
        <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-blue-600 text-white">
          <div className="max-w-5xl mx-auto px-6 py-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm mb-5">
              <TrendingUp size={14} />
              <span>Shipped with Yacht Labs</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight">{project.name}</h1>

            {project.description && (
              <p className="text-lg text-purple-100 mb-8 max-w-2xl leading-relaxed">
                {project.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-5 text-sm text-purple-100">
              <span className="flex items-center gap-2">
                <Calendar size={14} className="text-purple-200" />
                {isShipped && timeToShip != null
                  ? `Shipped in ${timeToShip} days`
                  : `Building for ${daysElapsed} day${daysElapsed !== 1 ? 's' : ''}`}
              </span>
              <span className="flex items-center gap-2">
                <Clock size={14} className="text-purple-200" />
                {totalHours}h total
              </span>
              <span className="flex items-center gap-2">
                <TrendingUp size={14} className="text-purple-200" />
                {progress}% complete
              </span>
              {(project.view_count ?? 0) > 0 && (
                <span className="flex items-center gap-2">
                  <Eye size={14} className="text-purple-200" />
                  {project.view_count} views
                </span>
              )}
              {(project.current_streak ?? 0) > 0 && (
                <span>🔥 {project.current_streak}-day streak</span>
              )}
            </div>

            <div className="mt-8">
              <ShareButtons project={project} />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-5xl mx-auto px-6 py-12 space-y-12">
          {/* Phase Timeline */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Execution Timeline</h2>
            <PhaseTimeline project={project} />
          </section>

          {/* Tech Stack */}
          {project.tech_stack && Object.keys(project.tech_stack).length > 0 && (
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Tech Stack</h2>
              <div className="flex flex-wrap gap-3">
                {Object.entries(project.tech_stack).map(([key, value]) => (
                  <div
                    key={key}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm"
                  >
                    <span className="text-gray-500 capitalize">{key}:</span>
                    <span className="ml-1.5 font-medium text-gray-900">{value}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Completed Tasks */}
          {completedTaskList.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Completed Tasks ({completedTasks}/{totalTasks})
              </h2>
              <TaskList tasks={completedTaskList} />
            </section>
          )}

          {/* Shipping Log */}
          {sortedShips.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Shipping Log ({sortedShips.length} entries)
              </h2>
              <ShippingLog ships={sortedShips} />
            </section>
          )}

          {/* CTA */}
          <section>
            <div className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-blue-50 to-purple-50 border-2 border-purple-200 rounded-2xl p-10 text-center">
              <div className="absolute top-0 right-0 -mt-12 -mr-12 w-40 h-40 bg-purple-200 rounded-full opacity-20 blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-40 h-40 bg-blue-200 rounded-full opacity-20 blur-3xl pointer-events-none" />

              <div className="relative">
                <div className="text-5xl mb-5">🚀</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Ready to ship your idea?</h3>
                <p className="text-gray-600 mb-8 max-w-xl mx-auto leading-relaxed">
                  Join builders using Yacht Labs to go from idea → shipped product in days, not
                  months. Framework-driven execution with AI assistance.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link
                    href="/demo"
                    className="px-7 py-3 bg-white border-2 border-purple-600 text-purple-600 font-semibold rounded-lg hover:bg-purple-50 transition-colors"
                  >
                    Try Interactive Demo
                  </Link>
                  <Link
                    href="/signup"
                    className="px-7 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Start Your Project →
                  </Link>
                </div>
                <p className="mt-5 text-sm text-gray-500">Free to start · No credit card required</p>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <footer className="border-t bg-white py-10 mt-8">
          <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-gray-900 font-medium">
                Built with{' '}
                <Link href="/" className="text-purple-600 hover:text-purple-700 font-semibold">
                  Yacht Labs
                </Link>
              </p>
              <p className="text-sm text-gray-500 mt-0.5">
                Think → Build → Ship → Listen → Repeat
              </p>
            </div>
            <div className="flex gap-5 text-sm text-gray-500">
              <Link href="/demo" className="hover:text-gray-900 transition-colors">Demo</Link>
              <Link href="/signup" className="text-purple-600 hover:text-purple-700 font-medium transition-colors">
                Start Building
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
