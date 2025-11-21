'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SelectRolePage() {
  const [role, setRole] = useState<'freelancer' | 'client'>('freelancer')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/signin')
      } else {
        setUserId(user.id)

        // Check if user already has a role
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        if (profile?.role) {
          router.push(`/dashboard/${profile.role}`)
        }
      }
    }
    checkAuth()
  }, [router, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return

    setError(null)
    setLoading(true)

    try {
      // Update profile with selected role
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', userId)

      if (updateError) throw updateError

      // Redirect to dashboard
      router.push(`/dashboard/${role}`)
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving your role')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-2xl border-2 border-white/20 rounded-3xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <Link href="/" className="text-3xl font-bold text-white hover:text-white/90 transition-colors">
              Khedme
            </Link>
            <h1 className="text-3xl font-bold text-white mt-6 mb-2">
              Choose your role
            </h1>
            <p className="text-white/80">
              Let us know how you plan to use Khedme
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 backdrop-blur-sm border border-red-500/30 rounded-2xl text-white text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="space-y-3">
              <label className="text-sm font-medium text-white/90 mb-2 block">
                Select your role
              </label>

              <div
                onClick={() => setRole('freelancer')}
                className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${
                  role === 'freelancer'
                    ? 'bg-white/20 border-white/50'
                    : 'bg-white/5 border-white/20 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    role === 'freelancer' ? 'border-white' : 'border-white/40'
                  }`}>
                    {role === 'freelancer' && (
                      <div className="w-3 h-3 rounded-full bg-white"></div>
                    )}
                  </div>
                  <div>
                    <p className="text-white font-semibold">I'm a Freelancer</p>
                    <p className="text-white/70 text-sm">I want to find work and offer my services</p>
                  </div>
                </div>
              </div>

              <div
                onClick={() => setRole('client')}
                className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${
                  role === 'client'
                    ? 'bg-white/20 border-white/50'
                    : 'bg-white/5 border-white/20 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    role === 'client' ? 'border-white' : 'border-white/40'
                  }`}>
                    {role === 'client' && (
                      <div className="w-3 h-3 rounded-full bg-white"></div>
                    )}
                  </div>
                  <div>
                    <p className="text-white font-semibold">I'm a Client</p>
                    <p className="text-white/70 text-sm">I want to hire freelancers for my projects</p>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 px-4 rounded-xl hover:shadow-xl transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Continue'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
