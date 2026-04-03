'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, FolderOpen, Clock, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatDistanceToNow } from 'date-fns'

interface Project {
  id: string
  name: string
  description: string
  phase: string
  status: string
  created_at: string
}

const phaseColors: Record<string, string> = {
  think: '#8b5cf6',
  build: '#3b82f6',
  ship: '#14b8a6',
  listen: '#22c55e',
  repeat: '#f59e0b',
}

const statusColors: Record<string, { bg: string; text: string }> = {
  active: { bg: '#22c55e22', text: '#22c55e' },
  draft: { bg: '#55555522', text: '#888888' },
  shipped: { bg: '#14b8a622', text: '#14b8a6' },
  archived: { bg: '#33333322', text: '#555555' },
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProjects = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setLoading(false)
        return
      }

      const { data } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      setProjects(data ?? [])
      setLoading(false)
    }

    fetchProjects()
  }, [])

  return (
    <div className="px-6 py-10 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p
            className="text-xs text-[#555555] uppercase tracking-widest mb-1"
            style={{ fontFamily: 'var(--font-space-mono), monospace' }}
          >
            WORKSPACE
          </p>
          <h1
            className="text-3xl font-bold text-white uppercase tracking-widest"
            style={{ fontFamily: 'var(--font-space-mono), monospace' }}
          >
            MY PROJECTS
          </h1>
        </div>
        <Link
          href="/dashboard/projects/new"
          className="flex items-center gap-2 bg-white text-black text-xs font-bold uppercase tracking-widest py-3 px-4 rounded-lg hover:bg-gray-100 transition-colors"
          style={{ fontFamily: 'var(--font-space-mono), monospace' }}
        >
          <Plus size={14} />
          NEW PROJECT
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-[#111111] border border-[#222222] rounded-xl p-6 animate-pulse">
              <div className="h-4 bg-[#222222] rounded mb-3 w-3/4" />
              <div className="h-3 bg-[#1a1a1a] rounded mb-2 w-full" />
              <div className="h-3 bg-[#1a1a1a] rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 bg-[#111111] border border-[#222222] rounded-xl flex items-center justify-center mb-4">
            <FolderOpen size={28} className="text-[#555555]" />
          </div>
          <h2
            className="text-lg font-bold text-white uppercase tracking-widest mb-2"
            style={{ fontFamily: 'var(--font-space-mono), monospace' }}
          >
            NO PROJECTS YET
          </h2>
          <p className="text-[#888888] text-sm mb-8 max-w-xs">
            Start your first project and let AI help you plan, build, and ship it.
          </p>
          <Link
            href="/dashboard/projects/new"
            className="flex items-center gap-2 bg-[#8b5cf6] text-white text-xs font-bold uppercase tracking-widest py-3 px-6 rounded-lg hover:bg-[#7c3aed] transition-colors"
            style={{ fontFamily: 'var(--font-space-mono), monospace' }}
          >
            <Plus size={14} />
            CREATE FIRST PROJECT
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => {
            const phaseColor = phaseColors[project.phase] ?? '#888888'
            const statusStyle = statusColors[project.status] ?? statusColors.draft

            return (
              <Link
                key={project.id}
                href={`/dashboard/projects/${project.id}`}
                className="bg-[#111111] border border-[#222222] rounded-xl p-6 flex flex-col gap-4 hover:border-[#2a2a2a] transition-colors group"
              >
                <div className="flex items-start justify-between gap-2">
                  <h2
                    className="text-sm font-bold text-white uppercase tracking-wide leading-snug"
                    style={{ fontFamily: 'var(--font-space-mono), monospace' }}
                  >
                    {project.name}
                  </h2>
                  <span
                    className="flex-shrink-0 text-xs font-bold uppercase tracking-wider px-2 py-1 rounded"
                    style={{
                      backgroundColor: statusStyle.bg,
                      color: statusStyle.text,
                      fontFamily: 'var(--font-space-mono), monospace',
                    }}
                  >
                    {project.status}
                  </span>
                </div>

                {project.description && (
                  <p className="text-[#888888] text-xs leading-relaxed line-clamp-2">
                    {project.description}
                  </p>
                )}

                <div className="flex items-center justify-between mt-auto pt-2 border-t border-[#1a1a1a]">
                  <span
                    className="text-xs font-bold uppercase tracking-widest px-2 py-1 rounded"
                    style={{
                      backgroundColor: `${phaseColor}22`,
                      color: phaseColor,
                      fontFamily: 'var(--font-space-mono), monospace',
                    }}
                  >
                    {project.phase}
                  </span>
                  <div className="flex items-center gap-1 text-[#555555] text-xs">
                    <Clock size={11} />
                    <span>
                      {formatDistanceToNow(new Date(project.created_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[#555555] text-xs group-hover:text-[#888888] transition-colors">
                  <ArrowRight size={12} />
                  <span
                    className="uppercase tracking-widest"
                    style={{ fontFamily: 'var(--font-space-mono), monospace' }}
                  >
                    OPEN PROJECT
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
