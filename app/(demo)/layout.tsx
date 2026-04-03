import Link from 'next/link'
import DemoBanner from '@/components/demo/DemoBanner'

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <DemoBanner />
      <nav className="flex items-center justify-between px-6 py-4 border-b border-[#1a1a1a]">
        <Link
          href="/"
          className="text-xs font-bold tracking-widest uppercase text-white"
          style={{ fontFamily: 'var(--font-space-mono), monospace' }}
        >
          ✦✦ YACHT LABS
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-xs text-[#888888] hover:text-white transition-colors uppercase tracking-widest"
            style={{ fontFamily: 'var(--font-space-mono), monospace' }}
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="px-4 py-2 bg-white text-black text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-gray-100 transition-colors"
            style={{ fontFamily: 'var(--font-space-mono), monospace' }}
          >
            Sign Up Free
          </Link>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  )
}
