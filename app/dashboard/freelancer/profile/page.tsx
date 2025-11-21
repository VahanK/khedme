'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Card, CardBody, CardHeader, Button, Input, Textarea, Chip } from '@heroui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'

export default function FreelancerProfilePage() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [bio, setBio] = useState('')
  const [hourlyRate, setHourlyRate] = useState('')
  const [portfolioUrl, setPortfolioUrl] = useState('')
  const [skillInput, setSkillInput] = useState('')
  const [skills, setSkills] = useState<string[]>([])

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

      const { data: freelancerProfile } = await supabase
        .from('freelancer_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (freelancerProfile) {
        setBio(freelancerProfile.bio || '')
        setHourlyRate(freelancerProfile.hourly_rate?.toString() || '')
        setPortfolioUrl(freelancerProfile.portfolio_url || '')
        setSkills(freelancerProfile.skills || [])
      }
    } catch (err: any) {
      console.error('Error loading profile:', err)
    } finally {
      setInitialLoading(false)
    }
  }

  const addSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault()
      if (!skills.includes(skillInput.trim())) {
        setSkills([...skills, skillInput.trim()])
        setSkillInput('')
      }
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove))
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
        .from('freelancer_profiles')
        .upsert({
          id: user.id,
          bio,
          hourly_rate: parseFloat(hourlyRate) || null,
          portfolio_url: portfolioUrl || null,
          skills
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
            onClick={() => router.push('/dashboard/freelancer')}
            className="mb-4"
          >
            ← Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Freelancer Profile</h1>
          <p className="text-gray-600 mt-1">Update your professional information</p>
        </div>

        <Card className="border-2 border-gray-100">
          <CardHeader className="bg-gradient-to-r from-rose-50 to-pink-50 border-b border-rose-100">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
              <p className="text-sm text-gray-600">Make your profile stand out to potential clients</p>
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
              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Professional Bio
                </label>
                <Textarea
                  placeholder="Tell clients about your experience, expertise, and what makes you unique..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  minRows={4}
                  classNames={{
                    input: "text-base",
                    inputWrapper: "border-2 border-gray-200 hover:border-rose-300"
                  }}
                />
              </div>

              {/* Hourly Rate */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hourly Rate ($)
                </label>
                <Input
                  type="number"
                  placeholder="50"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                  min="0"
                  step="0.01"
                  size="lg"
                  startContent={<span className="text-gray-500">$</span>}
                  endContent={<span className="text-gray-500">/hr</span>}
                  classNames={{
                    input: "text-base",
                    inputWrapper: "border-2 border-gray-200 hover:border-rose-300"
                  }}
                />
              </div>

              {/* Portfolio URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Portfolio URL
                </label>
                <Input
                  type="url"
                  placeholder="https://yourportfolio.com"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  size="lg"
                  classNames={{
                    input: "text-base",
                    inputWrapper: "border-2 border-gray-200 hover:border-rose-300"
                  }}
                />
              </div>

              {/* Skills */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skills
                </label>
                <Input
                  placeholder="Type a skill and press Enter (e.g., React, Node.js, UI/UX)"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={addSkill}
                  size="lg"
                  classNames={{
                    input: "text-base",
                    inputWrapper: "border-2 border-gray-200 hover:border-rose-300"
                  }}
                />
                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {skills.map((skill, index) => (
                      <Chip
                        key={index}
                        onClose={() => removeSkill(skill)}
                        variant="flat"
                        color="danger"
                        endContent={
                          <button type="button" onClick={() => removeSkill(skill)}>
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        }
                      >
                        {skill}
                      </Chip>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <Button
                  type="button"
                  variant="flat"
                  color="default"
                  onClick={() => router.push('/dashboard/freelancer')}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  color="danger"
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
