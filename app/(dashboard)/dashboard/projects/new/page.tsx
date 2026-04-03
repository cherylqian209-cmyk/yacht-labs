'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Sparkles,
  LayoutDashboard,
  Globe,
  Server,
  Puzzle,
  Smartphone,
  Grid,
  Loader2,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const templates = [
  {
    icon: LayoutDashboard,
    title: 'SaaS Dashboard',
    description: 'Full-featured admin dashboard with auth, billing, and analytics.',
    tags: ['React', 'Supabase', 'Stripe'],
    color: '#8b5cf6',
    idea: 'A SaaS dashboard application with user authentication, subscription billing via Stripe, analytics charts, and a settings panel. Built with React and Supabase.',
  },
  {
    icon: Globe,
    title: 'Landing Page',
    description: 'High-conversion landing page with hero, features, and pricing.',
    tags: ['Next.js', 'Tailwind'],
    color: '#14b8a6',
    idea: 'A high-conversion SaaS landing page with hero section, feature highlights, pricing tiers, testimonials, and a contact form. Built with Next.js and Tailwind CSS.',
  },
  {
    icon: Server,
    title: 'REST API',
    description: 'Production-ready REST API with auth middleware and docs.',
    tags: ['Node.js', 'Express', 'PostgreSQL'],
    color: '#3b82f6',
    idea: 'A production-ready REST API with JWT authentication, rate limiting, request validation, error handling, PostgreSQL database, and auto-generated API documentation.',
  },
  {
    icon: Puzzle,
    title: 'Chrome Extension',
    description: 'Browser extension with popup, content script, and background worker.',
    tags: ['JavaScript', 'Manifest V3'],
    color: '#f97316',
    idea: 'A Chrome extension with popup UI, content script for page interaction, background service worker, and Chrome storage API integration. Uses Manifest V3.',
  },
  {
    icon: Smartphone,
    title: 'Mobile App',
    description: 'Cross-platform mobile app with navigation and offline support.',
    tags: ['React Native', 'Expo'],
    color: '#ec4899',
    idea: 'A cross-platform mobile app with tab navigation, authentication flow, offline data sync, push notifications, and native device features using React Native and Expo.',
  },
  {
    icon: Grid,
    title: 'Browse All Templates',
    description: 'Explore our full library of project starters.',
    tags: [],
    color: '#555555',
    idea: '',
  },
]

export default function NewProjectPage() {
  const router = useRouter()
  const [idea, setIdea] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleGenerate = async () => {
    if (!idea.trim()) {
      setError('Please describe your idea first.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      const response = await fetch('/api/ai/analyze-idea', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea, userId: user?.id }),
      })

      if (!response.ok) {
        throw new Error('Failed to analyze idea')
      }

      const { project } = await response.json()
      router.push(`/dashboard/projects/${project.id}/think`)
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  const handleTemplate = (template: (typeof templates)[0]) => {
    if (!template.idea) return
    setIdea(template.idea)
  }

  return (
    <div className="px-6 py-10 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <p
          className="text-xs text-[#555555] uppercase tracking-widest mb-2"
          style={{ fontFamily: 'var(--font-space-mono), monospace' }}
        >
          NEW PROJECT
        </p>
        <h1
          className="text-3xl sm:text-4xl font-bold text-white uppercase tracking-widest"
          style={{ fontFamily: 'var(--font-space-mono), monospace' }}
        >
          START A NEW PROJECT
        </h1>
      </div>

      {/* Idea input */}
      <div className="bg-[#111111] border border-[#222222] rounded-xl p-6 mb-6">
        <label
          className="block text-xs font-bold text-[#888888] uppercase tracking-widest mb-3"
          style={{ fontFamily: 'var(--font-space-mono), monospace' }}
        >
          DESCRIBE YOUR IDEA
        </label>
        <textarea
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          placeholder="Describe your idea... e.g. 'A SaaS tool that helps freelancers track time and invoice clients automatically. Should integrate with Stripe and send email reminders.'"
          rows={5}
          className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg p-4 text-white placeholder-[#555555] text-sm leading-relaxed resize-none focus:outline-none focus:border-[#8b5cf6] transition-colors"
        />

        {error && (
          <p className="text-[#ef4444] text-xs mt-2">{error}</p>
        )}

        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={handleGenerate}
            disabled={loading || !idea.trim()}
            className="flex items-center gap-2 bg-[#8b5cf6] text-white text-xs font-bold uppercase tracking-widest py-3 px-5 rounded-lg hover:bg-[#7c3aed] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontFamily: 'var(--font-space-mono), monospace' }}
          >
            {loading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Sparkles size={14} />
            )}
            {loading ? 'GENERATING...' : 'GENERATE PROJECT PLAN'}
          </button>

          <button
            disabled
            className="flex items-center gap-2 bg-[#1a1a1a] text-[#555555] text-xs font-bold uppercase tracking-widest py-3 px-5 rounded-lg border border-[#222222] cursor-not-allowed"
            style={{ fontFamily: 'var(--font-space-mono), monospace' }}
          >
            <Grid size={14} />
            BROWSE TEMPLATES
          </button>
        </div>
      </div>

      {/* Quick start templates */}
      <div>
        <p
          className="text-xs text-[#555555] uppercase tracking-widest mb-4"
          style={{ fontFamily: 'var(--font-space-mono), monospace' }}
        >
          QUICK START TEMPLATES
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {templates.map((template) => (
            <button
              key={template.title}
              onClick={() => handleTemplate(template)}
              disabled={!template.idea}
              className="bg-[#111111] border border-[#222222] rounded-xl p-4 text-left hover:border-[#2a2a2a] transition-colors disabled:cursor-default group"
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
                style={{ backgroundColor: `${template.color}22` }}
              >
                <template.icon size={18} style={{ color: template.color }} />
              </div>
              <h3
                className="text-xs font-bold text-white uppercase tracking-wide mb-1"
                style={{ fontFamily: 'var(--font-space-mono), monospace' }}
              >
                {template.title}
              </h3>
              <p className="text-[#555555] text-xs leading-relaxed mb-3">
                {template.description}
              </p>
              {template.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {template.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-0.5 bg-[#1a1a1a] text-[#555555] rounded border border-[#222222]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
