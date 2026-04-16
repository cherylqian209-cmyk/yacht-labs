'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ChevronRight, Loader2, RefreshCw, Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Analysis {
  projectName?: string
  coreFeatures?: string[]
  niceToHave?: string[]
  outOfScope?: string[]
  risks?: string[]
}

interface Project {
  id: string
  name: string
  phase: string
  analysis: Analysis
}

export default function RepeatPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [patching, setPatching] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchProject = async () => {
      const supabase = createClient()
      const { data } = await supabase.from('projects').select('*').eq('id', id).single()
      setProject(data)
      setLoading(false)
    }
    fetchProject()
  }, [id])

  const handleIterate = async () => {
    if (!prompt.trim()) {
      setError('Describe what you want to change or improve.')
      return
    }

    setPatching(true)
    setError('')

    try {
      const response = await fetch('/api/ai/patch-spec', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: id, prompt }),
      })

      if (!response.ok) {
        throw new Error('Failed to update spec')
      }

      // Navigate to think phase so user reviews the updated plan
      router.push(`/dashboard/projects/${id}/think`)
    } catch {
      setError('Something went wrong. Please try again.')
      setPatching(false)
    }
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

  const analysis = project.analysis ?? {}
  const coreFeatures = analysis.coreFeatures ?? []

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
          REPEAT: ITERATE
        </h1>
        <p className="text-[#888888] text-sm mt-1">
          {project.name} · Tell AI what to change
        </p>
      </div>

      {/* Current spec summary */}
      {coreFeatures.length > 0 && (
        <div className="bg-[#111111] border border-[#222222] rounded-xl p-6">
          <h2
            className="text-xs font-bold text-[#888888] uppercase tracking-widest mb-4"
            style={{ fontFamily: 'var(--font-space-mono), monospace' }}
          >
            CURRENT SPEC
          </h2>
          <ul className="space-y-1">
            {coreFeatures.map((f: string, i: number) => (
              <li key={i} className="text-sm text-[#888888]">
                • {f}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Iteration prompt */}
      <div className="bg-[#111111] border-2 border-[#14b8a6] rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <RefreshCw size={16} className="text-[#14b8a6]" />
          <h2
            className="text-sm font-bold text-white uppercase tracking-widest"
            style={{ fontFamily: 'var(--font-space-mono), monospace' }}
          >
            WHAT SHOULD WE IMPROVE?
          </h2>
        </div>

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. 'Add team collaboration features, remove the analytics dashboard, and make the onboarding simpler...'"
          rows={4}
          disabled={patching}
          className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg p-4 text-white placeholder-[#555555] text-sm leading-relaxed resize-none focus:outline-none focus:border-[#14b8a6] transition-colors disabled:opacity-50"
        />

        {error && (
          <p className="text-[#ef4444] text-xs mt-2">{error}</p>
        )}

        <div className="flex justify-end mt-4">
          <button
            onClick={handleIterate}
            disabled={patching || !prompt.trim()}
            className="flex items-center gap-2 bg-[#14b8a6] text-white font-bold text-xs uppercase tracking-widest py-3 px-6 rounded-lg hover:bg-[#0d9488] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontFamily: 'var(--font-space-mono), monospace' }}
          >
            {patching ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Sparkles size={14} />
            )}
            {patching ? 'UPDATING SPEC...' : 'UPDATE SPEC'}
            {!patching && <ChevronRight size={14} />}
          </button>
        </div>
      </div>
    </div>
  )
}
