'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function DashboardNav({ userEmail }: { userEmail: string }) {
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a] border-b border-[#222222] h-16 flex items-center justify-between px-6">
      <Link
        href="/dashboard"
        className="text-xs font-bold tracking-widest uppercase text-white hover:text-[#888888] transition-colors"
        style={{ fontFamily: 'var(--font-space-mono), monospace' }}
      >
        ✦✦ YACHT LABS
      </Link>

      <div className="flex items-center gap-4">
        <span className="text-[#555555] text-xs hidden sm:block">{userEmail}</span>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 text-[#888888] hover:text-white transition-colors text-xs uppercase tracking-wider"
          style={{ fontFamily: 'var(--font-space-mono), monospace' }}
        >
          <LogOut size={14} />
          <span className="hidden sm:inline">Sign out</span>
        </button>
      </div>
    </nav>
  )
}
