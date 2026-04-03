'use client'

import Link from 'next/link'
import { X } from 'lucide-react'
import { useState } from 'react'

export default function DemoBanner() {
  const [visible, setVisible] = useState(true)

  if (!visible) return null

  return (
    <div className="bg-[#8b5cf6] text-white px-4 py-2.5">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <span
            className="text-xs font-bold uppercase tracking-widest flex-shrink-0"
            style={{ fontFamily: 'var(--font-space-mono), monospace' }}
          >
            DEMO MODE
          </span>
          <span className="hidden sm:inline text-xs text-white/80 truncate">
            Explore a live example project — no signup required
          </span>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <Link
            href="/signup"
            className="px-3 py-1 bg-white text-[#8b5cf6] text-xs font-bold uppercase tracking-widest rounded hover:bg-purple-50 transition-colors"
            style={{ fontFamily: 'var(--font-space-mono), monospace' }}
          >
            Start Free →
          </Link>
          <button
            onClick={() => setVisible(false)}
            className="p-1 hover:bg-white/20 rounded transition-colors"
            aria-label="Dismiss banner"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
