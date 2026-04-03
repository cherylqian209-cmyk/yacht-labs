'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail, Lock, User, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  const handleGoogleLogin = async () => {
    setGoogleLoading(true)
    setError('')

    const supabase = createClient()
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (oauthError) {
      setError(oauthError.message)
      setGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      {/* Top nav */}
      <nav className="p-6">
        <Link
          href="/"
          className="text-xs font-bold tracking-widest uppercase text-white font-mono hover:text-[#888888] transition-colors"
          style={{ fontFamily: 'var(--font-space-mono), monospace' }}
        >
          ✦✦ YACHT LABS
        </Link>
      </nav>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <h1
              className="text-2xl font-bold text-white uppercase tracking-widest mb-2"
              style={{ fontFamily: 'var(--font-space-mono), monospace' }}
            >
              GET STARTED
            </h1>
            <p className="text-[#888888] text-sm">Create your account and start building.</p>
          </div>

          <div className="bg-[#111111] border border-[#222222] rounded-xl p-6 space-y-4">
            {/* Google button */}
            <button
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              className="w-full flex items-center justify-center gap-3 bg-white text-black font-semibold py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
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
              {googleLoading ? 'Redirecting...' : 'Continue with Google'}
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-[#222222]" />
              <span className="text-[#555555] text-xs uppercase tracking-widest">or</span>
              <div className="flex-1 h-px bg-[#222222]" />
            </div>

            <form onSubmit={handleSignup} className="space-y-3">
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555555]" />
                <input
                  type="text"
                  placeholder="Full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg py-3 pl-10 pr-4 text-white placeholder-[#555555] text-sm focus:outline-none focus:border-[#8b5cf6] transition-colors"
                />
              </div>

              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555555]" />
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg py-3 pl-10 pr-4 text-white placeholder-[#555555] text-sm focus:outline-none focus:border-[#8b5cf6] transition-colors"
                />
              </div>

              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555555]" />
                <input
                  type="password"
                  placeholder="Password (min. 8 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg py-3 pl-10 pr-4 text-white placeholder-[#555555] text-sm focus:outline-none focus:border-[#8b5cf6] transition-colors"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-[#1a0a0a] border border-[#ef4444]/30 rounded-lg p-3">
                  <AlertCircle size={14} className="text-[#ef4444] flex-shrink-0" />
                  <p className="text-[#ef4444] text-xs">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1a1a1a] text-white font-semibold py-3 px-6 rounded-lg border border-[#333333] hover:bg-[#222222] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Mail size={16} />
                {loading ? 'Creating account...' : 'Sign up with email'}
              </button>
            </form>
          </div>

          <p className="text-center text-[#555555] text-sm mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-[#8b5cf6] hover:text-[#a78bfa] transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
