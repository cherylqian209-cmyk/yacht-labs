import Link from 'next/link'
import { Mail } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      {/* Top nav */}
      <nav className="p-6">
        <span
          className="text-xs font-bold tracking-widest uppercase text-white"
          style={{ fontFamily: 'var(--font-space-mono), monospace' }}
        >
          ✦✦ YACHT LABS
        </span>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="max-w-4xl w-full">
          {/* Big heading */}
          <h1
            className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold text-white leading-none tracking-tight mb-8"
            style={{ fontFamily: 'var(--font-space-mono), monospace' }}
          >
            <span className="block">BUILD IT.</span>
            <span className="block">SHIP IT. DONE.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-[#888888] text-lg sm:text-xl max-w-xl mx-auto mb-12 leading-relaxed">
            Stop pushing pixels and start onboarding users. Yacht Labs is the
            workbench for your next big move.
          </p>

          {/* Buttons */}
          <div className="flex flex-col items-center gap-4 max-w-xs mx-auto">
            {/* Google button */}
            <Link
              href="/login"
              className="w-full flex items-center justify-center gap-3 bg-white text-black font-semibold py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {/* Google G icon */}
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path
                  d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
                  fill="#4285F4"
                />
                <path
                  d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"
                  fill="#34A853"
                />
                <path
                  d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
                  fill="#FBBC05"
                />
                <path
                  d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </Link>

            {/* Email button */}
            <Link
              href="/login"
              className="w-full flex items-center justify-center gap-3 bg-[#1a1a1a] text-white font-semibold py-3 px-6 rounded-lg border border-[#333333] hover:bg-[#222222] transition-colors"
            >
              <Mail size={18} />
              Sign up with email
            </Link>
          </div>
        </div>
      </main>

      {/* Footer hint */}
      <footer className="p-6 text-center">
        <p className="text-[#555555] text-xs tracking-wider uppercase" style={{ fontFamily: 'var(--font-space-mono), monospace' }}>
          Think · Build · Ship · Listen · Repeat
        </p>
      </footer>
    </div>
  )
}
