'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { getFreelancerProfile, updateFreelancerProfile } from '@/utils/database/profiles'
import { FreelancerProfile, AvailabilityStatus } from '@/types/database.types'

const COMMON_SKILLS = [
  'React', 'Next.js', 'TypeScript', 'JavaScript', 'Node.js', 'Python', 'Java',
  'UI/UX Design', 'Figma', 'Graphic Design', 'Content Writing', 'SEO',
  'Marketing', 'Sales', 'Data Analysis', 'Project Management', 'WordPress',
  'Mobile Development', 'iOS', 'Android', 'DevOps', 'AWS', 'Docker'
]

export default function FreelancerProfileEdit() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Form fields
  const [title, setTitle] = useState('')
  const [bio, setBio] = useState('')
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [customSkill, setCustomSkill] = useState('')
  const [hourlyRate, setHourlyRate] = useState<number | ''>('')
  const [portfolioUrl, setPortfolioUrl] = useState('')
  const [yearsOfExperience, setYearsOfExperience] = useState<number | ''>('')
  const [availability, setAvailability] = useState<AvailabilityStatus>('available')

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

      const profile = await getFreelancerProfile(user.id)

      // Pre-fill form with existing data
      if (profile.freelancer_profile?.[0]) {
        const fp = profile.freelancer_profile[0]
        setTitle(fp.title || '')
        setBio(fp.bio || '')
        setSelectedSkills(fp.skills || [])
        setHourlyRate(fp.hourly_rate || '')
        setPortfolioUrl(fp.portfolio_url || '')
        setYearsOfExperience(fp.years_of_experience || '')
        setAvailability(fp.availability || 'available')
      }
    } catch (err: any) {
      console.error('Error loading profile:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSkillToggle = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill))
    } else {
      setSelectedSkills([...selectedSkills, skill])
    }
  }

  const handleAddCustomSkill = () => {
    const trimmed = customSkill.trim()
    if (trimmed && !selectedSkills.includes(trimmed)) {
      setSelectedSkills([...selectedSkills, trimmed])
      setCustomSkill('')
    }
  }

  const handleRemoveSkill = (skill: string) => {
    setSelectedSkills(selectedSkills.filter(s => s !== skill))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setSaving(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      await updateFreelancerProfile(user.id, {
        title,
        bio,
        skills: selectedSkills,
        hourly_rate: hourlyRate === '' ? undefined : Number(hourlyRate),
        portfolio_url: portfolioUrl || undefined,
        years_of_experience: yearsOfExperience === '' ? undefined : Number(yearsOfExperience),
        availability,
      })

      setSuccess(true)
      setTimeout(() => {
        router.push('/dashboard/freelancer')
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
              Complete Your Freelancer Profile
            </h1>
            <p className="text-white/80">
              Help clients find you by showcasing your skills and experience
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
            {/* Title */}
            <div>
              <label className="text-white/90 mb-2 font-medium block">
                Professional Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Full Stack Developer, UI/UX Designer"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="bg-white/95 placeholder-gray-500 text-gray-900 p-3 rounded-xl w-full focus:outline-0 focus:ring-2 focus:ring-primary shadow-lg font-medium"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="text-white/90 mb-2 font-medium block">
                Bio <span className="text-red-400">*</span>
              </label>
              <textarea
                placeholder="Tell clients about yourself, your experience, and what makes you unique..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                required
                rows={5}
                className="bg-white/95 placeholder-gray-500 text-gray-900 p-3 rounded-xl w-full focus:outline-0 focus:ring-2 focus:ring-primary shadow-lg font-medium resize-none"
              />
            </div>

            {/* Skills */}
            <div>
              <label className="text-white/90 mb-2 font-medium block">
                Skills <span className="text-red-400">*</span>
              </label>

              {/* Selected Skills */}
              {selectedSkills.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {selectedSkills.map(skill => (
                    <span
                      key={skill}
                      className="bg-primary/90 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="hover:bg-white/20 rounded-full p-0.5"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Common Skills */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 mb-3">
                <p className="text-white/70 text-sm mb-2">Select from common skills:</p>
                <div className="flex flex-wrap gap-2">
                  {COMMON_SKILLS.map(skill => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => handleSkillToggle(skill)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                        selectedSkills.includes(skill)
                          ? 'bg-primary text-white'
                          : 'bg-white/20 text-white/90 hover:bg-white/30'
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Skill Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add custom skill"
                  value={customSkill}
                  onChange={(e) => setCustomSkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomSkill())}
                  className="bg-white/95 placeholder-gray-500 text-gray-900 p-3 rounded-xl flex-1 focus:outline-0 focus:ring-2 focus:ring-primary shadow-lg font-medium"
                />
                <button
                  type="button"
                  onClick={handleAddCustomSkill}
                  className="bg-white/20 backdrop-blur-xl border-2 border-white/30 text-white font-semibold px-6 rounded-xl hover:bg-white/30 transition-all"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Hourly Rate */}
            <div>
              <label className="text-white/90 mb-2 font-medium block">
                Hourly Rate (USD) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                placeholder="e.g. 50"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value === '' ? '' : Number(e.target.value))}
                required
                min="1"
                step="0.01"
                className="bg-white/95 placeholder-gray-500 text-gray-900 p-3 rounded-xl w-full focus:outline-0 focus:ring-2 focus:ring-primary shadow-lg font-medium"
              />
            </div>

            {/* Years of Experience */}
            <div>
              <label className="text-white/90 mb-2 font-medium block">
                Years of Experience
              </label>
              <input
                type="number"
                placeholder="e.g. 5"
                value={yearsOfExperience}
                onChange={(e) => setYearsOfExperience(e.target.value === '' ? '' : Number(e.target.value))}
                min="0"
                max="50"
                className="bg-white/95 placeholder-gray-500 text-gray-900 p-3 rounded-xl w-full focus:outline-0 focus:ring-2 focus:ring-primary shadow-lg font-medium"
              />
            </div>

            {/* Portfolio URL */}
            <div>
              <label className="text-white/90 mb-2 font-medium block">
                Portfolio URL
              </label>
              <input
                type="url"
                placeholder="https://yourportfolio.com"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                className="bg-white/95 placeholder-gray-500 text-gray-900 p-3 rounded-xl w-full focus:outline-0 focus:ring-2 focus:ring-primary shadow-lg font-medium"
              />
            </div>

            {/* Availability */}
            <div>
              <label className="text-white/90 mb-2 font-medium block">
                Availability Status
              </label>
              <select
                value={availability}
                onChange={(e) => setAvailability(e.target.value as AvailabilityStatus)}
                className="bg-white/95 text-gray-900 p-3 rounded-xl w-full focus:outline-0 focus:ring-2 focus:ring-primary shadow-lg font-medium"
              >
                <option value="available">Available</option>
                <option value="busy">Busy</option>
                <option value="unavailable">Unavailable</option>
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={saving || selectedSkills.length === 0}
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
