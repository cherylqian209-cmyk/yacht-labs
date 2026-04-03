'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Check } from 'lucide-react'

const phases = [
  { id: 'overview', label: 'Overview', path: '/demo/project' },
  { id: 'think', label: 'Think', path: '/demo/project/think' },
  { id: 'build', label: 'Build', path: '/demo/project/build' },
  { id: 'ship', label: 'Ship', path: '/demo/project/ship' },
  { id: 'listen', label: 'Listen', path: '/demo/project/listen' },
  { id: 'repeat', label: 'Repeat', path: '/demo/project/repeat' },
]

const phaseStatus: Record<string, 'complete' | 'active' | 'pending'> = {
  overview: 'active',
  think: 'complete',
  build: 'active',
  ship: 'pending',
  listen: 'pending',
  repeat: 'pending',
}

export default function PhaseNav() {
  const pathname = usePathname()

  const current = phases.find((p) => p.path === pathname)?.id ?? 'overview'

  // Determine status relative to current page
  const statusFor = (id: string): 'complete' | 'active' | 'pending' => {
    if (id === current) return 'active'
    return phaseStatus[id] === 'complete' ? 'complete' : 'pending'
  }

  return (
    <div className="flex gap-1.5 overflow-x-auto pb-0.5 mb-8">
      {phases.map((phase) => {
        const s = statusFor(phase.id)
        return (
          <Link
            key={phase.id}
            href={phase.path}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${
              s === 'active'
                ? 'bg-[#8b5cf622] text-[#8b5cf6] border-2 border-[#8b5cf6]'
                : s === 'complete'
                ? 'bg-[#22c55e11] text-[#22c55e] border border-[#22c55e33]'
                : 'bg-[#0a0a0a] text-[#555555] border border-[#222222]'
            }`}
            style={{ fontFamily: 'var(--font-space-mono), monospace' }}
          >
            {s === 'complete' && <Check size={10} />}
            {phase.label}
          </Link>
        )
      })}
    </div>
  )
}
