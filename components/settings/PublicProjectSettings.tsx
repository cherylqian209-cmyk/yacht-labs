'use client'

import { useState } from 'react'
import { Eye, EyeOff, Copy, Check, ExternalLink } from 'lucide-react'

interface Project {
  id: string
  name: string
  is_public?: boolean
  slug?: string | null
  view_count?: number
  shared_count?: number
}

interface Props {
  project: Project
  onUpdate?: (updated: Project) => void
}

export default function PublicProjectSettings({ project, onUpdate }: Props) {
  const [isPublic, setIsPublic] = useState(project.is_public ?? false)
  const [slug, setSlug] = useState(project.slug ?? '')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://yacht-labs.com'
  const publicUrl = `${origin}/p/${slug || 'your-project'}`

  const handleToggle = async () => {
    setLoading(true)
    const res = await fetch(`/api/projects/${project.id}/visibility`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_public: !isPublic }),
    })
    if (res.ok) {
      const { project: updated } = await res.json()
      setIsPublic(updated.is_public)
      setSlug(updated.slug ?? '')
      onUpdate?.(updated)
    }
    setLoading(false)
  }

  const copyLink = async () => {
    await navigator.clipboard.writeText(publicUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-[#111111] border border-[#222222] rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {isPublic
            ? <Eye size={14} className="text-[#22c55e]" />
            : <EyeOff size={14} className="text-[#555555]" />}
          <div>
            <p
              className="text-xs font-bold text-white uppercase tracking-widest"
              style={{ fontFamily: 'var(--font-space-mono), monospace' }}
            >
              PUBLIC PROJECT PAGE
            </p>
            <p className="text-xs text-[#555555] mt-0.5">Share your execution timeline</p>
          </div>
        </div>

        <button
          onClick={handleToggle}
          disabled={loading}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 ${
            isPublic ? 'bg-[#22c55e]' : 'bg-[#333333]'
          }`}
          aria-label={isPublic ? 'Make private' : 'Make public'}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              isPublic ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {isPublic && slug && (
        <div className="space-y-4">
          {/* URL + actions */}
          <div className="bg-[#0a0a0a] border border-[#222222] rounded-lg p-3">
            <p
              className="text-xs text-[#555555] uppercase tracking-widest mb-2"
              style={{ fontFamily: 'var(--font-space-mono), monospace' }}
            >
              PUBLIC URL
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs text-[#888888] truncate">/p/{slug}</code>
              <button
                onClick={copyLink}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#1a1a1a] border border-[#222222] text-xs text-[#888888] hover:text-white rounded-lg transition-colors"
              >
                {copied ? <><Check size={10} /> Copied</> : <><Copy size={10} /> Copy</>}
              </button>
              <a
                href={publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#1a1a1a] border border-[#222222] text-xs text-[#888888] hover:text-white rounded-lg transition-colors"
              >
                <ExternalLink size={10} /> View
              </a>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'VIEWS', value: project.view_count ?? 0 },
              { label: 'SHARES', value: project.shared_count ?? 0 },
            ].map((s) => (
              <div key={s.label} className="bg-[#0a0a0a] border border-[#222222] rounded-lg p-3">
                <p
                  className="text-xs text-[#555555] uppercase tracking-widest mb-1"
                  style={{ fontFamily: 'var(--font-space-mono), monospace' }}
                >
                  {s.label}
                </p>
                <p
                  className="text-2xl font-bold text-white"
                  style={{ fontFamily: 'var(--font-space-mono), monospace' }}
                >
                  {s.value}
                </p>
              </div>
            ))}
          </div>

          {/* Tips */}
          <div className="bg-[#8b5cf611] border border-[#8b5cf633] rounded-lg p-3">
            <p
              className="text-xs font-bold text-[#8b5cf6] uppercase tracking-widest mb-2"
              style={{ fontFamily: 'var(--font-space-mono), monospace' }}
            >
              SHARING TIPS
            </p>
            <ul className="space-y-1 text-xs text-[#8b5cf6] opacity-80">
              <li>• Share after completing major phases for maximum impact</li>
              <li>• Great for build-in-public content and portfolios</li>
              <li>• Each view = someone learning about Yacht Labs</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
