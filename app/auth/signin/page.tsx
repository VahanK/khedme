'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // First, check if this email is linked to a Google account
      const { data: userData, error: userError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (userError) {
        // Check if the error is due to invalid credentials
        if (userError.message.includes('Invalid') || userError.message.includes('invalid')) {
          // Try to check if user exists with Google
          const { data: existingUser } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', email)
            .single()

          if (existingUser) {
            // User exists but can't sign in with password - likely Google account
            setError('This account was created using Google. Please sign in with Google instead.')
            setLoading(false)
            return
          }
        }
        throw userError
      }

      // Check if user signed up with Google OAuth
      if (userData.user?.app_metadata?.provider === 'google') {
        setError('This account was created using Google. Please sign in with Google instead.')
        await supabase.auth.signOut()
        setLoading(false)
        return
      }

      // Get user profile to determine role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userData.user.id)
        .single()

      if (profile?.role) {
        router.push(`/dashboard/${profile.role}`)
      } else {
        router.push('/auth/select-role')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during sign in')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setError(null)
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account', // Always ask which account to use
          },
        },
      })

      if (error) throw error
    } catch (err: any) {
      setError(err.message || 'An error occurred with Google sign in')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-4 py-12 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/10 backdrop-blur-2xl border-2 border-white/20 rounded-3xl shadow-2xl p-8 lg:p-10">
          <div className="text-center mb-8">
            <div className="flex items-center justify-between mb-6">
              <Link href="/" className="text-3xl font-bold text-white hover:text-white/90 transition-colors">
                Khedme
              </Link>
              <Link
                href="/auth/signup"
                className="text-sm text-white/90 hover:text-white font-medium underline underline-offset-4"
              >
                Sign up instead
              </Link>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Welcome back
            </h1>
            <p className="text-white/80">
              Sign in to continue your journey
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 backdrop-blur-sm border border-red-500/30 rounded-2xl text-white text-sm">
              {error}
            </div>
          )}

          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full mb-6 bg-white/20 backdrop-blur-xl border-2 border-white/30 text-white font-semibold py-3 px-4 rounded-2xl hover:bg-white/30 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-transparent text-white/70">Or continue with email</span>
            </div>
          </div>

          {/* Email Sign In Form */}
          <form onSubmit={handleEmailSignIn} className="flex flex-col gap-5">
            <div>
              <p className="text-white/90 mb-2 font-medium">Email</p>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white/95 placeholder-gray-500 text-gray-900 p-3 rounded-xl w-full focus:outline-0 focus:ring-2 focus:ring-primary shadow-lg font-medium"
              />
            </div>

            <div>
              <p className="text-white/90 mb-2 font-medium">Password</p>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white/95 placeholder-gray-500 text-gray-900 p-3 rounded-xl w-full focus:outline-0 focus:ring-2 focus:ring-primary shadow-lg font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary to-emerald-600 text-white font-semibold py-3 px-4 rounded-xl hover:shadow-xl transition-all duration-300 shadow-lg disabled:opacity-50 mt-2"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
