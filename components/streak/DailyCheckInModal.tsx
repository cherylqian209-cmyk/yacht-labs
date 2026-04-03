'use client'

import { useState } from 'react'
import { X, Rocket } from 'lucide-react'

interface Props {
  projectName: string
  currentStreak: number
  onClose: () => void
  onSubmit: (description: string) => Promise<void>
}

export default function DailyCheckInModal({ projectName, currentStreak, onClose, onSubmit }: Props) {
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim()) return
    setLoading(true)
    await onSubmit(description.trim())
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#111111] border border-[#222222] rounded-xl max-w-md w-full">
        <div className="flex items-start justify-between p-5 border-b border-[#222222]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Rocket size={14} className="text-[#f59e0b]" />
              <p
                className="text-xs text-[#f59e0b] uppercase tracking-widest font-bold"
                style={{ fontFamily: 'var(--font-space-mono), monospace' }}
              >
                DAILY SHIP LOG
              </p>
            </div>
            <h3 className="text-white font-semibold">What did you ship today?</h3>
            <p className="text-xs text-[#555555] mt-0.5">{projectName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-[#1a1a1a] rounded-lg transition-colors mt-0.5"
          >
            <X size={14} className="text-[#555555]" />
          </button>
        </div>

        {currentStreak > 0 && (
          <div className="px-5 pt-4">
            <div className="flex items-center gap-2 bg-[#f59e0b11] border border-[#f59e0b33] rounded-lg px-3 py-2">
              <span className="text-lg">🔥</span>
              <p className="text-xs text-[#f59e0b]" style={{ fontFamily: 'var(--font-space-mono), monospace' }}>
                <strong>{currentStreak}-day streak</strong> — keep it alive!
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. 'Shipped auth flow and deployed to staging' or 'Fixed 3 bugs and added CSV export'"
            className="w-full h-28 bg-[#0a0a0a] border border-[#222222] text-white text-sm rounded-lg px-3 py-2.5 resize-none placeholder-[#444444] focus:outline-none focus:border-[#f59e0b] transition-colors"
            autoFocus
          />

          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-[#555555] hover:text-[#888888] uppercase tracking-wider transition-colors"
              style={{ fontFamily: 'var(--font-space-mono), monospace' }}
            >
              Skip today
            </button>
            <button
              type="submit"
              disabled={loading || !description.trim()}
              className="flex items-center gap-2 bg-[#f59e0b] text-black font-bold text-xs uppercase tracking-widest py-2.5 px-5 rounded-lg hover:bg-[#d97706] transition-colors disabled:opacity-50"
              style={{ fontFamily: 'var(--font-space-mono), monospace' }}
            >
              {loading ? 'LOGGING...' : 'LOG SHIP 🚀'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
