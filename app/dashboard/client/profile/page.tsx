'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Card, CardBody, CardHeader, Button, Input, Textarea } from '@heroui/react'

export default function ClientProfilePage() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

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

      const { data: clientProfile } = await supabase
        .from('client_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (clientProfile) {
        setCompanyName(clientProfile.company_name || '')
        setCompanyDescription(clientProfile.company_description || '')
        setCompanyWebsite(clientProfile.company_website || '')
      }
    } catch (err: any) {
      console.error('Error loading profile:', err)
    } finally {
      setInitialLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/signin')
        return
      }

      const { error: upsertError } = await supabase
        .from('client_profiles')
        .upsert({
          id: user.id,
          company_name: companyName || null,
          company_description: companyDescription || null,
          company_website: companyWebsite || null
        })

      if (upsertError) throw upsertError

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <Button
            variant="light"
            onClick={() => router.push('/dashboard/client')}
            className="mb-4"
          >
            ← Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Client Profile</h1>
          <p className="text-gray-600 mt-1">Update your company information</p>
        </div>

        <Card className="border-2 border-gray-100">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50 border-b border-emerald-100">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Company Information</h2>
              <p className="text-sm text-gray-600">Help freelancers learn about your business</p>
            </div>
          </CardHeader>

          <CardBody className="gap-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm">
                ✓ Profile updated successfully!
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Company Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name
                </label>
                <Input
                  placeholder="Your Company Name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  size="lg"
                  classNames={{
                    input: "text-base",
                    inputWrapper: "border-2 border-gray-200 hover:border-emerald-300"
                  }}
                />
              </div>

              {/* Company Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Description
                </label>
                <Textarea
                  placeholder="Tell freelancers about your company, mission, and what you do..."
                  value={companyDescription}
                  onChange={(e) => setCompanyDescription(e.target.value)}
                  minRows={4}
                  classNames={{
                    input: "text-base",
                    inputWrapper: "border-2 border-gray-200 hover:border-emerald-300"
                  }}
                />
              </div>

              {/* Company Website */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Website
                </label>
                <Input
                  type="url"
                  placeholder="https://yourcompany.com"
                  value={companyWebsite}
                  onChange={(e) => setCompanyWebsite(e.target.value)}
                  size="lg"
                  classNames={{
                    input: "text-base",
                    inputWrapper: "border-2 border-gray-200 hover:border-emerald-300"
                  }}
                />
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <Button
                  type="button"
                  variant="flat"
                  color="default"
                  onClick={() => router.push('/dashboard/client')}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  color="success"
                  isLoading={loading}
                  className="flex-1"
                  size="lg"
                >
                  {loading ? 'Saving...' : 'Save Profile'}
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
