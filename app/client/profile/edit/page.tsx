'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { getClientProfile, updateClientProfile } from '@/utils/database/profiles'

export default function ClientProfileEdit() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Form fields
  const [companyName, setCompanyName] = useState('')
  const [companyDescription, setCompanyDescription] = useState('')
  const [companyWebsite, setCompanyWebsite] = useState('')

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/signin')
        return
      }

      const profile = await getClientProfile(user.id)

      // Pre-fill form with existing data
      if (profile.client_profile?.[0]) {
        const cp = profile.client_profile[0]
        setCompanyName(cp.company_name || '')
        setCompanyDescription(cp.company_description || '')
        setCompanyWebsite(cp.company_website || '')
      }
    } catch (err: any) {
      console.error('Error loading profile:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setSaving(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      await updateClientProfile(user.id, {
        company_name: companyName,
        company_description: companyDescription,
        company_website: companyWebsite || undefined,
      })

      setSuccess(true)
      setTimeout(() => {
        router.push('/dashboard/client')
      }, 1500)
    } catch (err: any) {
      console.error('Error saving profile:', err)
      setError(err.message || 'Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-white text-xl">Loading profile...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-4 py-12 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="max-w-3xl mx-auto relative z-10">
        <div className="bg-white/10 backdrop-blur-2xl border-2 border-white/20 rounded-3xl shadow-2xl p-8 lg:p-10">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              Complete Your Client Profile
            </h1>
            <p className="text-white/80">
              Tell freelancers about your company and build trust
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 backdrop-blur-sm border border-red-500/30 rounded-2xl text-white text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-500/20 backdrop-blur-sm border border-green-500/30 rounded-2xl text-white text-sm">
              Profile saved successfully! Redirecting...
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Company Name */}
            <div>
              <label className="text-white/90 mb-2 font-medium block">
                Company Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Acme Corporation"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
                className="bg-white/95 placeholder-gray-500 text-gray-900 p-3 rounded-xl w-full focus:outline-0 focus:ring-2 focus:ring-primary shadow-lg font-medium"
              />
              <p className="text-white/60 text-sm mt-2">
                This will be visible to freelancers when you post projects
              </p>
            </div>

            {/* Company Description */}
            <div>
              <label className="text-white/90 mb-2 font-medium block">
                Company Description <span className="text-red-400">*</span>
              </label>
              <textarea
                placeholder="Tell freelancers about your company, what you do, and your mission..."
                value={companyDescription}
                onChange={(e) => setCompanyDescription(e.target.value)}
                required
                rows={6}
                className="bg-white/95 placeholder-gray-500 text-gray-900 p-3 rounded-xl w-full focus:outline-0 focus:ring-2 focus:ring-primary shadow-lg font-medium resize-none"
              />
              <p className="text-white/60 text-sm mt-2">
                A detailed description helps freelancers understand your business
              </p>
            </div>

            {/* Company Website */}
            <div>
              <label className="text-white/90 mb-2 font-medium block">
                Company Website (Optional)
              </label>
              <input
                type="url"
                placeholder="https://yourcompany.com"
                value={companyWebsite}
                onChange={(e) => setCompanyWebsite(e.target.value)}
                className="bg-white/95 placeholder-gray-500 text-gray-900 p-3 rounded-xl w-full focus:outline-0 focus:ring-2 focus:ring-primary shadow-lg font-medium"
              />
              <p className="text-white/60 text-sm mt-2">
                Adding a website helps establish credibility
              </p>
            </div>

            {/* Privacy Notice */}
            <div className="bg-blue-500/10 backdrop-blur-sm border border-blue-500/20 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-white/90 font-medium text-sm mb-1">Privacy & Security</p>
                  <p className="text-white/70 text-sm">
                    Your contact information remains private. Freelancers can only message you through our platform until a project is completed and paid.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-gradient-to-r from-primary to-emerald-600 text-white font-semibold py-4 px-4 rounded-xl hover:shadow-xl transition-all duration-300 shadow-lg disabled:opacity-50 mt-4"
            >
              {saving ? 'Saving...' : 'Save Profile'}
            </button>

            <button
              type="button"
              onClick={() => router.back()}
              className="w-full bg-white/20 backdrop-blur-xl border-2 border-white/30 text-white font-semibold py-3 px-4 rounded-xl hover:bg-white/30 transition-all"
            >
              Cancel
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
