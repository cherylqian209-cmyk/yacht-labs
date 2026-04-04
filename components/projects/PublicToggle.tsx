'use client'

import { useState } from 'react'
import { Globe, Copy } from 'lucide-react'

interface Project {
  id: string
  name: string
  is_public?: boolean
  slug?: string | null
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 60)
}

export default function PublicToggle({ project }: { project: Project }) {
  const [isPublic, setIsPublic] = useState(project.is_public ?? false)
  const [slug, setSlug] = useState(project.slug ?? generateSlug(project.name))
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const publicUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/p/${slug}`

  const handleToggle = async () => {
    setLoading(true)
    const newState = !isPublic
    const res = await fetch(`/api/projects/${project.id}/visibility`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_public: newState, slug }),
    })
    if (res.ok) setIsPublic(newState)
    setLoading(false)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleTweet = () => {
    const text = `Just shipped ${project.name} with @yachtlabs! 🚀`
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(publicUrl)}`,
      '_blank'
    )
  }

  return (
    <div className="bg-[#111111] border border-[#222222] rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Globe size={14} className={isPublic ? 'text-[#22c55e]' : 'text-[#555555]'} />
          <div>
            <p
              className="text-xs font-bold text-white uppercase tracking-widest"
              style={{ fontFamily: 'var(--font-space-mono), monospace' }}
            >
              PUBLIC PROJECT PAGE
            </p>
            <p className="text-xs text-[#555555] mt-0.5">
              Share your execution timeline publicly
            </p>
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

      {isPublic && (
        <div className="bg-[#0a0a0a] border border-[#222222] rounded-lg p-3 space-y-3">
          <p
            className="text-xs text-[#555555] uppercase tracking-widest"
            style={{ fontFamily: 'var(--font-space-mono), monospace' }}
          >
            PUBLIC URL
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs text-[#888888] truncate">/p/{slug}</code>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#1a1a1a] border border-[#222222] text-xs text-[#888888] hover:text-white rounded-lg transition-colors"
            >
              <Copy size={11} />
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button
              onClick={handleTweet}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#1a1a1a] border border-[#222222] text-xs text-[#888888] hover:text-white rounded-lg transition-colors"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              Tweet
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
