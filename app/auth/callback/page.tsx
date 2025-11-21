'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the current session - this will automatically handle the OAuth callback
        // and exchange the code using the PKCE verifier from localStorage
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (sessionError) throw sessionError

        if (!session) {
          throw new Error('No session found after OAuth callback')
        }

        const user = session.user

        // Check if user has a profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profileError && profileError.code !== 'PGRST116') {
          // PGRST116 is "not found" error, which is expected for new users
          throw profileError
        }

        if (!profile) {
          // New Google user - create profile without role
          const { error: insertError } = await supabase.from('profiles').insert([
            {
              id: user.id,
              email: user.email,
              full_name: user.user_metadata.full_name || user.user_metadata.name,
            },
          ])

          if (insertError) throw insertError

          // Redirect to role selection
          router.replace('/auth/select-role')
          return
        }

        if (!profile.role) {
          // Existing user without role
          router.push('/auth/select-role')
          return
        }

        // User has profile and role
        // Use push instead of replace to ensure proper history management
        router.push(`/dashboard/${profile.role}`)
      } catch (err: any) {
        console.error('Auth callback error:', err)
        setError(err.message || 'Authentication failed')
        setTimeout(() => {
          router.push(`/auth/signin?error=${encodeURIComponent(err.message)}`)
        }, 2000)
      }
    }

    handleCallback()
  }, [router, supabase])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="text-center">
        {error ? (
          <div className="text-white">
            <div className="text-xl font-semibold mb-2">Authentication Error</div>
            <div className="text-white/80 mb-2">{error}</div>
            <div className="text-sm text-white/60">Redirecting to sign in...</div>
          </div>
        ) : (
          <div className="text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <div className="text-xl font-semibold mb-2">Completing sign in...</div>
            <div className="text-white/80">Please wait a moment</div>
          </div>
        )}
      </div>
    </div>
  )
}
