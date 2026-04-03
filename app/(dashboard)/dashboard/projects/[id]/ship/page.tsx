'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Check, AlertTriangle, Clock, ChevronRight, Loader2, ExternalLink } from 'lucide-react'
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

const preflightItems = [
  { label: 'Environment variables configured', status: 'pass', detail: '.env.local present and valid' },
  { label: 'Build passing (npm run build)', status: 'pass', detail: 'No TypeScript or lint errors' },
  { label: 'Authentication flow tested', status: 'pass', detail: 'Login, signup, and signout verified' },
  { label: 'Database migrations applied', status: 'warn', detail: 'Run SQL migrations in Supabase dashboard' },
  { label: 'Production secrets rotated', status: 'pending', detail: 'Use unique keys for production env' },
]

const deploymentOptions = [
  {
    id: 'deploy-now',
    label: 'DEPLOY NOW',
    description: 'Push to production immediately. Best for MVPs and fast iterations.',
    recommended: true,
  },
  {
    id: 'preview',
    label: 'PREVIEW DEPLOY',
    description: 'Deploy to a preview URL for testing before going live.',
    recommended: false,
  },
  {
    id: 'schedule',
    label: 'SCHEDULE DEPLOY',
    description: 'Pick a time to auto-deploy. Good for planned launches.',
    recommended: false,
  },
]

const postDeployActions = [
  'Verify production auth flow end-to-end',
  'Test all AI API endpoints with real keys',
  'Set up uptime monitoring (e.g. Better Uptime, UptimeRobot)',
  'Share your launch URL and start collecting feedback',
]

export default function ShipPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedDeploy, setSelectedDeploy] = useState('deploy-now')
  const [deploying, setDeploying] = useState(false)
  const [deployed, setDeployed] = useState(false)

  useEffect(() => {
    const fetchProject = async () => {
      const supabase = createClient()
      const { data } = await supabase.from('projects').select('*').eq('id', id).single()
      setProject(data)
      setLoading(false)
    }
    fetchProject()
  }, [id])

  const handleDeploy = async () => {
    setDeploying(true)
    await new Promise((r) => setTimeout(r, 2000))
    const supabase = createClient()
    await supabase.from('projects').update({ phase: 'listen' }).eq('id', id)
    setDeployed(true)
    setDeploying(false)
  }

  const handleContinue = () => {
    router.push(`/dashboard/projects/${id}/listen`)
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
          PHASE 03
        </p>
        <h1
          className="text-3xl font-bold text-white uppercase tracking-widest"
          style={{ fontFamily: 'var(--font-space-mono), monospace' }}
        >
          SHIP: DEPLOYMENT
        </h1>
        <p className="text-[#888888] text-sm mt-1">{project.name}</p>
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
            const isComplete = step.key === 'think' || step.key === 'build'
            const isActive = step.key === 'ship'
            return (
              <div key={step.key} className="flex items-center gap-2 flex-shrink-0">
                <div
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider ${
                    isComplete
                      ? 'bg-[#22c55e22] text-[#22c55e] border border-[#22c55e44]'
                      : isActive
                      ? 'bg-[#f97316cc] text-white border-2 border-[#f97316]'
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

      {/* Pre-flight Checklist */}
      <div className="bg-[#111111] border border-[#222222] rounded-xl p-6">
        <h2
          className="text-sm font-bold text-white uppercase tracking-widest mb-4"
          style={{ fontFamily: 'var(--font-space-mono), monospace' }}
        >
          PRE-FLIGHT CHECKLIST
        </h2>
        <div className="space-y-3">
          {preflightItems.map((item, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 p-3 rounded-lg border-l-2 ${
                item.status === 'pass'
                  ? 'bg-[#22c55e08] border-[#22c55e]'
                  : item.status === 'warn'
                  ? 'bg-[#f59e0b08] border-[#f59e0b]'
                  : 'bg-[#55555508] border-[#333333]'
              }`}
            >
              <div className="flex-shrink-0 mt-0.5">
                {item.status === 'pass' ? (
                  <Check size={14} className="text-[#22c55e]" />
                ) : item.status === 'warn' ? (
                  <AlertTriangle size={14} className="text-[#f59e0b]" />
                ) : (
                  <Clock size={14} className="text-[#555555]" />
                )}
              </div>
              <div>
                <p
                  className={`text-sm font-medium ${
                    item.status === 'pass'
                      ? 'text-white'
                      : item.status === 'warn'
                      ? 'text-[#f59e0b]'
                      : 'text-[#888888]'
                  }`}
                >
                  {item.label}
                </p>
                <p className="text-xs text-[#555555] mt-0.5">{item.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Deployment Strategy */}
      <div className="bg-[#111111] border border-[#222222] rounded-xl p-6">
        <h2
          className="text-sm font-bold text-white uppercase tracking-widest mb-4"
          style={{ fontFamily: 'var(--font-space-mono), monospace' }}
        >
          DEPLOYMENT STRATEGY
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {deploymentOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setSelectedDeploy(opt.id)}
              className={`text-left p-4 rounded-xl border-2 transition-all ${
                selectedDeploy === opt.id
                  ? 'border-[#f97316] bg-[#f9731611]'
                  : 'border-[#222222] bg-[#0a0a0a] hover:border-[#333333]'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <h3
                  className="text-xs font-bold uppercase tracking-wider text-white"
                  style={{ fontFamily: 'var(--font-space-mono), monospace' }}
                >
                  {opt.label}
                </h3>
                {opt.recommended && (
                  <span
                    className="text-[10px] font-bold text-[#f97316] uppercase tracking-wider"
                    style={{ fontFamily: 'var(--font-space-mono), monospace' }}
                  >
                    ★ REC
                  </span>
                )}
              </div>
              <p className="text-xs text-[#555555] leading-relaxed">{opt.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Post-Deployment Actions */}
      <div className="bg-[#111111] border border-[#222222] rounded-xl p-6">
        <h2
          className="text-sm font-bold text-white uppercase tracking-widest mb-4"
          style={{ fontFamily: 'var(--font-space-mono), monospace' }}
        >
          POST-DEPLOYMENT ACTIONS
        </h2>
        <ol className="space-y-3">
          {postDeployActions.map((action, i) => (
            <li key={i} className="flex items-start gap-3">
              <span
                className="text-xs font-bold text-[#f97316] flex-shrink-0 w-5"
                style={{ fontFamily: 'var(--font-space-mono), monospace' }}
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <p className="text-sm text-[#888888]">{action}</p>
            </li>
          ))}
        </ol>
      </div>

      {/* CTA */}
      {deployed ? (
        <div className="bg-[#22c55e11] border border-[#22c55e33] rounded-xl p-6 text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Check size={20} className="text-[#22c55e]" />
            <h2
              className="text-lg font-bold text-[#22c55e] uppercase tracking-widest"
              style={{ fontFamily: 'var(--font-space-mono), monospace' }}
            >
              SHIPPED!
            </h2>
          </div>
          <p className="text-[#888888] text-sm">Your project is live. Now listen to your users.</p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={handleContinue}
              className="flex items-center gap-2 bg-white text-black font-bold text-xs uppercase tracking-widest py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors"
              style={{ fontFamily: 'var(--font-space-mono), monospace' }}
            >
              GO TO LISTEN PHASE
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#888888] text-xs">
            <ExternalLink size={14} />
            <span>Will deploy via Vercel + Supabase</span>
          </div>
          <button
            onClick={handleDeploy}
            disabled={deploying}
            className="flex items-center gap-2 bg-[#f97316] text-white font-bold text-xs uppercase tracking-widest py-3 px-6 rounded-lg hover:bg-[#ea6c0a] transition-colors disabled:opacity-50"
            style={{ fontFamily: 'var(--font-space-mono), monospace' }}
          >
            {deploying ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                DEPLOYING...
              </>
            ) : (
              <>
                DEPLOY TO PRODUCTION
                <ChevronRight size={14} />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
