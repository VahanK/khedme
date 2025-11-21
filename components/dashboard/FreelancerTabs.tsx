'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/lib/context/ToastContext'
import InfoButton from '@/components/ui/InfoButton'
import GradientCard from '@/components/ui/GradientCard'
import NotificationBell from '@/components/notifications/NotificationBell'
import {
  UserCircleIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  DocumentTextIcon,
  PaperAirplaneIcon,
  RocketLaunchIcon,
  BriefcaseIcon,
  LinkIcon,
  SparklesIcon,
  CheckCircleIcon,
  StarIcon,
} from '@heroicons/react/24/outline'

const commonSkills = [
  'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java',
  'UI/UX Design', 'Graphic Design', 'Content Writing', 'SEO',
  'Digital Marketing', 'Video Editing', 'Photography', 'Mobile Development',
  'DevOps', 'Data Analysis', 'Project Management', 'Consulting'
]

const commonLanguages = [
  'English', 'Arabic', 'French', 'Spanish', 'German', 'Chinese',
  'Japanese', 'Russian', 'Portuguese', 'Italian', 'Turkish', 'Korean'
]

interface FreelancerTabsProps {
  profileCompletion: number
  totalEarnings: number
  activeProjectsCount: number
  pendingProposalsCount: number
  profile: any
  freelancerProfile: any
  proposals: any[]
  availableProjects: any[]
  completedProjects: any[]
  activeProjects: any[]
  userRole?: 'freelancer' | 'client'
}

export default function FreelancerTabs({
  profileCompletion,
  totalEarnings,
  activeProjectsCount,
  pendingProposalsCount,
  profile,
  freelancerProfile,
  proposals,
  availableProjects,
  completedProjects,
  activeProjects,
  userRole = 'freelancer',
}: FreelancerTabsProps) {
  const router = useRouter()
  const { showSuccess, showError } = useToast()
  const [activeSection, setActiveSection] = useState('profile')
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedProject, setSelectedProject] = useState<any>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [showProposalForm, setShowProposalForm] = useState(false)
  const [showProposalPreview, setShowProposalPreview] = useState(false)
  const [proposalFormData, setProposalFormData] = useState({
    cover_letter: '',
    proposed_budget: '',
    estimated_duration: '',
  })

  // Prevent going back to OAuth pages
  useEffect(() => {
    // Push a state when dashboard loads to prevent back navigation to OAuth flow
    window.history.pushState(null, '', window.location.href)

    const handlePopState = () => {
      // If user tries to go back, push them forward again
      window.history.pushState(null, '', window.location.href)
    }

    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    bio: freelancerProfile?.bio || '',
    title: freelancerProfile?.title || '',
    skills: freelancerProfile?.skills || [],
    languages: freelancerProfile?.languages || [],
    hourly_rate: freelancerProfile?.hourly_rate || '',
    portfolio_url: freelancerProfile?.portfolio_url || '',
    avatar_url: freelancerProfile?.avatar_url || '',
    years_of_experience: freelancerProfile?.years_of_experience || '',
    availability_status: freelancerProfile?.availability || 'available',
    service_packages: freelancerProfile?.service_packages || [],
  })

  const [customSkill, setCustomSkill] = useState('')
  const [customLanguage, setCustomLanguage] = useState('')
  const [newPackage, setNewPackage] = useState({
    name: '',
    description: '',
    price_min: '',
    price_max: '',
  })

  // Color themes for different user roles
  const colorThemes = {
    freelancer: {
      sidebarBg: 'bg-gradient-to-b from-purple-50 to-purple-100',
      sidebarBorder: 'border-purple-200',
      activeItemBg: 'bg-purple-600',
      activeItemText: 'text-white',
      inactiveItemText: 'text-gray-700',
      inactiveItemHover: 'hover:bg-purple-50',
      accent: 'purple',
    },
  }

  const theme = colorThemes.freelancer

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      showError('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.')
      return
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      showError('File too large. Maximum size is 5MB.')
      return
    }

    setUploadingAvatar(true)

    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)

      const response = await fetch('/api/upload/avatar', {
        method: 'POST',
        body: uploadFormData,
      })

      const data = await response.json()

      if (response.ok) {
        // Just update the preview, don't reload page
        setFormData(prev => ({ ...prev, avatar_url: data.url }))
        showSuccess('Avatar selected. Click Save to apply changes.')
      } else {
        showError(data.error || 'Failed to upload avatar')
      }
    } catch (error) {
      showError('An error occurred while uploading.')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleRemoveAvatar = () => {
    // Just clear the preview, actual deletion happens on Save
    setFormData(prev => ({ ...prev, avatar_url: '' }))
    showSuccess('Avatar will be removed when you Save.')
  }

  const sections = [
    { id: 'profile', label: 'Profile', icon: UserCircleIcon },
    { id: 'browse', label: 'Browse Projects', icon: SparklesIcon },
    { id: 'proposals', label: 'Active Proposals', icon: DocumentTextIcon },
    { id: 'projects', label: 'Active Projects', icon: ChartBarIcon },
    { id: 'earnings', label: 'Earnings', icon: CurrencyDollarIcon },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Automatically add any package that's been filled out but not yet added
      let finalServicePackages = [...formData.service_packages]
      if (newPackage.name.trim() && newPackage.description.trim() && newPackage.price_min && newPackage.price_max) {
        finalServicePackages = [...finalServicePackages, { ...newPackage }]
        setNewPackage({ name: '', description: '', price_min: '', price_max: '' })
      }

      const dataToSubmit = {
        ...formData,
        service_packages: finalServicePackages
      }

      const response = await fetch('/api/freelancer/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSubmit),
      })

      const data = await response.json()

      if (response.ok) {
        showSuccess('Profile updated successfully!')
        setIsEditing(false)
        // Reload page to update sidebar with new avatar
        window.location.reload()
      } else {
        showError(data.error || 'Failed to update profile')
      }
    } catch (error) {
      showError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const toggleSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s: string) => s !== skill)
        : [...prev.skills, skill]
    }))
  }

  const addCustomSkill = () => {
    if (customSkill.trim() && !formData.skills.includes(customSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, customSkill.trim()]
      }))
      setCustomSkill('')
    }
  }

  const removeSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter((s: string) => s !== skill)
    }))
  }

  const addCustomLanguage = () => {
    const trimmed = customLanguage.trim()
    if (trimmed) {
      // Capitalize first letter of each word
      const capitalized = trimmed
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')

      if (!formData.languages.includes(capitalized)) {
        setFormData(prev => ({
          ...prev,
          languages: [...prev.languages, capitalized]
        }))
        setCustomLanguage('')
      }
    }
  }

  const removeLanguage = (language: string) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.filter((l: string) => l !== language)
    }))
  }

  const addServicePackage = () => {
    if (newPackage.name.trim() && newPackage.description.trim() && newPackage.price_min && newPackage.price_max) {
      setFormData(prev => ({
        ...prev,
        service_packages: [...prev.service_packages, { ...newPackage }]
      }))
      setNewPackage({ name: '', description: '', price_min: '', price_max: '' })
    }
  }

  const removeServicePackage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      service_packages: prev.service_packages.filter((_: any, i: number) => i !== index)
    }))
  }

  const handleShowProposalPreview = (e: React.FormEvent) => {
    e.preventDefault()
    setShowProposalPreview(true)
  }

  const handleConfirmSubmitProposal = async () => {
    setLoading(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('proposals')
        .insert({
          project_id: selectedProject.id,
          freelancer_id: user.id,
          cover_letter: proposalFormData.cover_letter,
          proposed_budget: Number(proposalFormData.proposed_budget),
          estimated_duration: proposalFormData.estimated_duration,
          status: 'pending'
        })

      if (error) throw error

      showSuccess('Proposal submitted successfully!')
      setProposalFormData({
        cover_letter: '',
        proposed_budget: '',
        estimated_duration: '',
      })
      setShowProposalPreview(false)
      setShowProposalForm(false)
      setSelectedProject(null)

      // Refresh the page data
      setTimeout(() => {
        router.refresh()
      }, 1000)
    } catch (error: any) {
      showError(error.message || 'Failed to submit proposal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="flex flex-col md:flex-row w-full">
      {/* Fixed Left Sidebar */}
      <aside className="hidden md:block md:w-64 md:flex-shrink-0 md:h-screen md:sticky md:top-0 md:overflow-y-auto">
        <div className={`h-full border-r shadow-lg ${theme.sidebarBg} ${theme.sidebarBorder} flex flex-col`}>
          {/* User Info Section */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                {freelancerProfile?.avatar_url ? (
                  <img
                    src={freelancerProfile.avatar_url}
                    alt={profile?.full_name || 'User'}
                    className="w-full h-full object-cover"
                    key={freelancerProfile.avatar_url}
                  />
                ) : (
                  <span>{(profile?.full_name || profile?.email || 'U').charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{profile?.full_name || 'User'}</p>
                <p className="text-xs text-gray-600 truncate">{profile?.email}</p>
              </div>
            </div>
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">General</h2>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-1">
            {sections.map((section) => {
              const Icon = section.icon
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeSection === section.id
                      ? `${theme.activeItemBg} ${theme.activeItemText} shadow-md`
                      : `${theme.inactiveItemText} ${theme.inactiveItemHover}`
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {section.label}
                </button>
              )
            })}
          </nav>

          {/* Bottom Actions */}
          <div className="p-3 border-t border-gray-200 space-y-2">
            {/* Notifications */}
            <div className="flex items-center gap-3 px-3 py-2.5">
              <span className="text-sm font-medium flex-1 text-gray-700">Notifications</span>
              <NotificationBell />
            </div>

            <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-gray-700 hover:bg-white/50 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Help & Support
            </button>
            <button
              onClick={async () => {
                const supabase = await createClient()
                await supabase.auth.signOut()
                window.location.href = '/auth/signin'
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Log Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 w-full md:overflow-y-auto">
        {/* Mobile Navigation Tabs */}
        <div className="md:hidden bg-white border-b border-gray-200 sticky top-0 z-10 overflow-x-auto">
          <div className="flex gap-1 p-2">
            {sections.map((section) => {
              const Icon = section.icon
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    activeSection === section.id
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {section.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Content Container */}
        <div className="p-3 md:p-4">
            {/* Profile Section */}
            {activeSection === 'profile' && (
              <div className="space-y-4">
                {/* Section Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-gray-900">Profile Overview</h2>
                    <p className="text-sm text-gray-600 mt-1">This is how clients see your profile</p>
                  </div>
                  {!isEditing && (
                    <div className="flex gap-3">
                      <button
                        onClick={async () => {
                          const profileUrl = `${window.location.origin}/freelancer/${profile?.id}`
                          await navigator.clipboard.writeText(profileUrl)
                          showSuccess('Profile link copied to clipboard!')
                        }}
                        className="px-4 py-2 bg-white border-2 border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 hover:shadow-lg transition-all duration-200 font-medium text-sm shadow-sm flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                        Share Profile
                      </button>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:shadow-lg transition-all duration-200 font-medium text-sm shadow-sm"
                      >
                        Edit Profile
                      </button>
                    </div>
                  )}
                </div>

                {isEditing ? (
                  /* Edit Mode */
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Basic Information */}
                    <div className="bg-gradient-to-br from-white to-gray-50 rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                      <div className="flex items-center gap-2 mb-4">
                        <UserCircleIcon className="w-5 h-5 text-purple-600" />
                        <h3 className="text-base font-bold text-gray-900">Basic Information</h3>
                        <InfoButton content="Your basic information visible to clients when they view your profile." />
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name *
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.full_name}
                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="John Doe"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Professional Title *
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="Full Stack Developer"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <div className="flex items-center gap-1">
                              <UserCircleIcon className="w-4 h-4" />
                              Profile Picture
                            </div>
                          </label>

                          <div className="flex items-center gap-4">
                            {formData.avatar_url && (
                              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-purple-200 flex-shrink-0">
                                <img
                                  src={formData.avatar_url}
                                  alt="Avatar preview"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}

                            <div className="flex-1">
                              <div className="flex gap-2">
                                <label className="cursor-pointer">
                                  <div className="px-4 py-2.5 bg-purple-50 border-2 border-purple-200 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors inline-flex items-center gap-2 font-medium">
                                    <UserCircleIcon className="w-5 h-5" />
                                    {uploadingAvatar ? 'Uploading...' : 'Choose Photo'}
                                  </div>
                                  <input
                                    type="file"
                                    accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                                    onChange={handleAvatarUpload}
                                    disabled={uploadingAvatar}
                                    className="hidden"
                                  />
                                </label>
                                {formData.avatar_url && (
                                  <button
                                    type="button"
                                    onClick={handleRemoveAvatar}
                                    disabled={uploadingAvatar}
                                    className="px-4 py-2.5 bg-red-50 border-2 border-red-200 text-red-700 rounded-lg hover:bg-red-100 transition-colors inline-flex items-center gap-2 font-medium disabled:opacity-50"
                                  >
                                    Remove Photo
                                  </button>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 mt-2">
                                Upload a profile picture (JPEG, PNG, WebP, or GIF). Max size: 5MB
                              </p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Bio *
                          </label>
                          <textarea
                            required
                            rows={4}
                            value={formData.bio}
                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="Tell clients about your experience, expertise, and what makes you unique..."
                          />
                          <p className="text-xs text-gray-500 mt-1">{formData.bio.length} characters</p>
                        </div>
                      </div>
                    </div>

                    {/* Skills */}
                    <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-5 border border-gray-200 shadow-md hover:shadow-lg transition-shadow duration-200">
                      <div className="flex items-center gap-3 mb-6">
                        <SparklesIcon className="w-6 h-6 text-purple-600" />
                        <h3 className="text-base font-bold text-gray-900">Skills</h3>
                        <InfoButton content="Select your skills to help clients find you for relevant projects." />
                      </div>

                      {/* Selected Skills */}
                      {formData.skills.length > 0 && (
                        <div className="mb-4 p-3 bg-purple-50 rounded-lg">
                          <p className="text-xs font-medium text-purple-900 mb-2">Selected Skills ({formData.skills.length})</p>
                          <div className="flex flex-wrap gap-2">
                            {formData.skills.map((skill: string) => (
                              <span
                                key={skill}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                              >
                                {skill}
                                <button
                                  type="button"
                                  onClick={() => removeSkill(skill)}
                                  className="hover:text-purple-900"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Common Skills */}
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Popular Skills</p>
                        <div className="flex flex-wrap gap-2">
                          {commonSkills.map((skill) => (
                            <button
                              key={skill}
                              type="button"
                              onClick={() => toggleSkill(skill)}
                              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                formData.skills.includes(skill)
                                  ? 'bg-purple-600 text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {skill}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Custom Skill */}
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Add Custom Skill</p>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={customSkill}
                            onChange={(e) => setCustomSkill(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomSkill())}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="Enter a skill..."
                          />
                          <button
                            type="button"
                            onClick={addCustomSkill}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Languages */}
                    <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-5 border border-gray-200 shadow-md hover:shadow-lg transition-shadow duration-200">
                      <div className="flex items-center gap-3 mb-6">
                        <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                        </svg>
                        <h3 className="text-base font-bold text-gray-900">Languages</h3>
                        <InfoButton content="Select languages you can communicate in with clients." />
                      </div>

                      {/* Selected Languages */}
                      {formData.languages.length > 0 && (
                        <div className="mb-4 p-3 bg-purple-50 rounded-lg">
                          <p className="text-xs font-medium text-purple-900 mb-2">Selected Languages ({formData.languages.length})</p>
                          <div className="flex flex-wrap gap-2">
                            {formData.languages.map((language: string) => (
                              <span
                                key={language}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                              >
                                {language}
                                <button
                                  type="button"
                                  onClick={() => removeLanguage(language)}
                                  className="hover:text-purple-900"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Common Languages */}
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Popular Languages</p>
                        <div className="flex flex-wrap gap-2">
                          {commonLanguages.map((language) => (
                            <button
                              key={language}
                              type="button"
                              onClick={() => {
                                if (formData.languages.includes(language)) {
                                  removeLanguage(language)
                                } else {
                                  setFormData(prev => ({ ...prev, languages: [...prev.languages, language] }))
                                }
                              }}
                              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                formData.languages.includes(language)
                                  ? 'bg-purple-600 text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {language}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Custom Language */}
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Add Custom Language</p>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={customLanguage}
                            onChange={(e) => setCustomLanguage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomLanguage())}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="Enter a language..."
                          />
                          <button
                            type="button"
                            onClick={addCustomLanguage}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Professional Details */}
                    <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-5 border border-gray-200 shadow-md hover:shadow-lg transition-shadow duration-200">
                      <div className="flex items-center gap-3 mb-6">
                        <BriefcaseIcon className="w-6 h-6 text-purple-600" />
                        <h3 className="text-base font-bold text-gray-900">Professional Details</h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Years of Experience
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="50"
                            value={formData.years_of_experience}
                            onChange={(e) => setFormData({ ...formData, years_of_experience: e.target.value })}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="5"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            <div className="flex items-center gap-1">
                              <LinkIcon className="w-4 h-4" />
                              Portfolio URL
                            </div>
                          </label>
                          <input
                            type="url"
                            value={formData.portfolio_url}
                            onChange={(e) => setFormData({ ...formData, portfolio_url: e.target.value })}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="https://yourportfolio.com"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Availability Status
                          </label>
                          <select
                            value={formData.availability_status}
                            onChange={(e) => setFormData({ ...formData, availability_status: e.target.value })}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          >
                            <option value="available">Available</option>
                            <option value="busy">Busy</option>
                            <option value="unavailable">Unavailable</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Service Packages */}
                    <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-5 border border-gray-200 shadow-md hover:shadow-lg transition-shadow duration-200">
                      <div className="flex items-center gap-3 mb-6">
                        <RocketLaunchIcon className="w-6 h-6 text-purple-600" />
                        <h3 className="text-base font-bold text-gray-900">Service Packages</h3>
                        <InfoButton content="Define your service offerings with price ranges to help clients understand what you provide." />
                      </div>

                      {/* Existing Packages */}
                      {formData.service_packages.length > 0 && (
                        <div className="mb-4 space-y-3">
                          {formData.service_packages.map((pkg: any, index: number) => (
                            <div key={index} className="p-4 bg-white rounded-lg border border-gray-200">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-900">{pkg.name}</h4>
                                  <p className="text-sm text-gray-600 mt-1">{pkg.description}</p>
                                  <p className="text-sm font-medium text-purple-600 mt-2">
                                    ${pkg.price_min} - ${pkg.price_max}
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeServicePackage(index)}
                                  className="text-red-600 hover:text-red-800 ml-2"
                                >
                                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add New Package */}
                      <div className="space-y-4">
                        <p className="text-sm font-medium text-gray-700">Add New Package</p>
                        <div className="grid grid-cols-1 gap-3">
                          <input
                            type="text"
                            value={newPackage.name}
                            onChange={(e) => setNewPackage({ ...newPackage, name: e.target.value })}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="Package name (e.g., Basic Website Design)"
                          />
                          <textarea
                            rows={2}
                            value={newPackage.description}
                            onChange={(e) => setNewPackage({ ...newPackage, description: e.target.value })}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="What's included in this package..."
                          />
                          <div className="grid grid-cols-2 gap-3">
                            <input
                              type="number"
                              min="0"
                              value={newPackage.price_min}
                              onChange={(e) => setNewPackage({ ...newPackage, price_min: e.target.value })}
                              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              placeholder="Min price ($)"
                            />
                            <input
                              type="number"
                              min="0"
                              value={newPackage.price_max}
                              onChange={(e) => setNewPackage({ ...newPackage, price_max: e.target.value })}
                              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              placeholder="Max price ($)"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={addServicePackage}
                            className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg font-medium hover:bg-purple-200 transition-colors"
                          >
                            Add Package
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex gap-4 pt-4">
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-8 py-4 rounded-xl font-semibold text-base hover:shadow-xl hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                      >
                        {loading ? 'Saving...' : 'Save Profile'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-8 py-4 border-2 border-gray-300 rounded-xl font-semibold text-base text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  /* View Mode */
                  <div className="space-y-4">
                    {/* Hero Section - Name & Title */}
                    <div className="bg-gradient-to-br from-white to-purple-50 rounded-xl p-4 border border-purple-200 shadow-lg">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                          {freelancerProfile?.avatar_url ? (
                            <img
                              src={freelancerProfile.avatar_url}
                              alt={profile?.full_name || 'Profile'}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span>{profile?.full_name?.charAt(0).toUpperCase() || 'F'}</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <h1 className="text-base font-bold text-gray-900 mb-0.5">{profile?.full_name || 'Not set'}</h1>
                          <p className="text-base text-purple-600 font-semibold mb-2">{freelancerProfile?.title || 'Professional Title Not Set'}</p>
                          <div className="flex items-center gap-4 text-xs mt-2">
                            <div className="flex items-center gap-1.5">
                              <BriefcaseIcon className="w-4 h-4 text-purple-600" />
                              <span className="font-semibold text-gray-900">{freelancerProfile?.years_of_experience || 0}</span>
                              <span className="text-gray-600">years experience</span>
                            </div>
                          </div>
                          {freelancerProfile?.availability && (
                            <div className="mt-2">
                              <span className={`inline-block px-3 py-1.5 rounded-full text-xs font-semibold ${
                                freelancerProfile.availability === 'available' ? 'bg-green-100 text-green-700' :
                                freelancerProfile.availability === 'busy' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {freelancerProfile.availability === 'available' ? '✓ Available for work' :
                                 freelancerProfile.availability === 'busy' ? 'Busy' : 'Unavailable'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Profile Completion Card or Quick Actions */}
                    {profileCompletion < 100 ? (
                      <div className="bg-gradient-to-r from-purple-50 to-purple-50 border-2 border-purple-200 rounded-xl p-4 shadow-md">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900">Profile Completion</h3>
                            <p className="text-sm text-gray-600 mt-1">Complete your profile to attract more clients</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-3xl font-bold text-purple-600">{profileCompletion}%</div>
                            <button
                              onClick={() => setIsEditing(true)}
                              className="px-3 py-1.5 text-xs font-medium text-purple-700 bg-white border border-purple-300 rounded-lg hover:bg-purple-50 transition-colors"
                            >
                              Complete
                            </button>
                          </div>
                        </div>
                        <div className="w-full bg-white rounded-full h-3 overflow-hidden shadow-inner">
                          <div
                            className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-500"
                            style={{ width: `${profileCompletion}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 shadow-lg text-white">
                        <div className="flex items-start gap-3 mb-4">
                          <div className="text-3xl">🎉</div>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold mb-1">Profile Complete! You're All Set!</h3>
                            <p className="text-purple-50 text-sm">Your profile is ready to impress clients. Start finding projects today</p>
                          </div>
                        </div>
                        <div className="flex gap-3 mt-4">
                          <button
                            onClick={() => setActiveSection('browse')}
                            className="flex-1 px-4 py-3 bg-white text-purple-600 rounded-lg hover:bg-purple-50 transition-all font-semibold text-sm shadow-md hover:shadow-lg hover:scale-[1.02] duration-200"
                          >
                            🚀 Browse Projects
                          </button>
                          <button
                            onClick={() => setIsEditing(false)}
                            className="flex-1 px-4 py-3 bg-purple-700 text-white rounded-lg hover:bg-purple-800 transition-all font-semibold text-sm shadow-md hover:shadow-lg hover:scale-[1.02] duration-200"
                          >
                            View My Profile
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Skills Section */}
                    {freelancerProfile?.skills && freelancerProfile.skills.length > 0 && (
                      <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Skills</h3>
                        <div className="flex flex-wrap gap-2">
                          {freelancerProfile.skills.map((skill: string) => (
                            <span key={skill} className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* About/Bio Section */}
                    {freelancerProfile?.bio && (
                      <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-md">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">About</h3>
                        <p className="text-base text-gray-700 leading-relaxed whitespace-pre-wrap">{freelancerProfile.bio}</p>
                      </div>
                    )}

                    {/* Languages Section */}
                    {freelancerProfile?.languages && freelancerProfile.languages.length > 0 && (
                      <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300">
                        <div className="flex items-center gap-3 mb-6">
                          <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                          </svg>
                          <h3 className="text-lg font-bold text-gray-900">Languages</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {freelancerProfile.languages.map((language: string) => (
                            <span key={language} className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                              {language}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Service Packages Section */}
                    {freelancerProfile?.service_packages && freelancerProfile.service_packages.length > 0 && (
                      <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300">
                        <div className="flex items-center gap-3 mb-6">
                          <RocketLaunchIcon className="w-6 h-6 text-purple-600" />
                          <h3 className="text-lg font-bold text-gray-900">Service Packages</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {freelancerProfile.service_packages.map((pkg: any, index: number) => (
                            <div key={index} className="p-4 bg-gradient-to-br from-purple-50 to-white rounded-lg border border-purple-200">
                              <h4 className="font-semibold text-gray-900 mb-2">{pkg.name}</h4>
                              <p className="text-sm text-gray-600 mb-3">{pkg.description}</p>
                              <div className="flex items-center justify-between">
                                <span className="text-lg font-bold text-purple-600">
                                  ${pkg.price_min} - ${pkg.price_max}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Past Projects Section */}
                    {completedProjects && completedProjects.length > 0 && (
                      <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300">
                        <div className="flex items-center gap-3 mb-6">
                          <CheckCircleIcon className="w-6 h-6 text-green-600" />
                          <h3 className="text-lg font-bold text-gray-900">Past Projects</h3>
                          <span className="ml-auto text-base font-semibold text-gray-600 bg-green-50 px-4 py-2 rounded-full">{completedProjects.length} completed</span>
                        </div>
                        <div className="space-y-4">
                          {completedProjects.map((project: any) => (
                            <div key={project.id} className="p-6 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all duration-300 cursor-pointer">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-900">{project.title}</h4>
                                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{project.description}</p>
                                </div>
                                <span className="ml-4 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium whitespace-nowrap">
                                  Completed
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-sm mt-3 pt-3 border-t border-gray-200">
                                <span className="text-gray-600">
                                  Client: <span className="font-medium text-gray-900">{project.profiles?.full_name || 'Anonymous'}</span>
                                </span>
                                {project.budget_max && (
                                  <span className="text-gray-600">
                                    Budget: <span className="font-medium text-gray-900">${project.budget_max}</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Browse Projects Section */}
            {activeSection === 'browse' && (
              <div className="space-y-10">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Browse Projects</h2>
                  <p className="text-sm text-gray-600 mt-1">Find new opportunities and submit proposals</p>
                </div>

                {availableProjects && availableProjects.length > 0 ? (
                  <div className="space-y-4">
                    {availableProjects.map((project: any) => (
                      <div key={project.id} className="bg-white rounded-xl p-5 border border-gray-200 shadow-md hover:shadow-xl hover:border-purple-300 transition-all duration-300">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h4 className="text-base font-bold text-gray-900 mb-2">{project.title}</h4>
                            <p className="text-base text-gray-600 mb-3">{project.description}</p>
                          </div>
                          <span className="ml-4 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold whitespace-nowrap">
                            Open
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Posted by</p>
                            <p className="font-semibold text-gray-900">{project.profiles?.full_name || 'Anonymous'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Budget</p>
                            <p className="font-semibold text-gray-900">
                              {project.budget_min && project.budget_max
                                ? `$${project.budget_min} - $${project.budget_max}`
                                : project.budget_max
                                  ? `$${project.budget_max}`
                                  : 'Not specified'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Posted</p>
                            <p className="font-semibold text-gray-900">
                              {new Date(project.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        {project.required_skills && project.required_skills.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <p className="text-sm text-gray-500 mb-2">Required Skills</p>
                            <div className="flex flex-wrap gap-2">
                              {project.required_skills.map((skill: string) => (
                                <span key={skill} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="mt-6 flex justify-end">
                          <button
                            onClick={() => {
                              setSelectedProject(project)
                              setShowProposalForm(true)
                            }}
                            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:shadow-lg hover:scale-[1.02] transition-all duration-200 font-semibold"
                          >
                            Submit Proposal
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 text-gray-500">
                    <SparklesIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">No available projects at the moment</p>
                    <p className="text-sm mt-2">Check back soon for new opportunities</p>
                  </div>
                )}
              </div>
            )}

            {/* Active Proposals Section */}
            {activeSection === 'proposals' && (
              <div className="space-y-10">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Active Proposals</h2>
                  <p className="text-sm text-gray-600 mt-1">Track all your submitted proposals and their status</p>
                </div>

                {proposals && proposals.length > 0 ? (
                  <div className="space-y-4">
                    {proposals.map((proposal) => (
                      <div key={proposal.id} className="bg-white rounded-xl p-5 border border-gray-200 shadow-md hover:shadow-xl hover:border-purple-300 transition-all duration-300">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            {/* @ts-ignore */}
                            <h4 className="font-bold text-gray-900">{proposal.projects?.title || 'Project'}</h4>
                            {/* @ts-ignore */}
                            <p className="text-sm text-gray-600 mt-1">{proposal.projects?.description?.substring(0, 150)}...</p>
                          </div>
                          <span className={`ml-4 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                            proposal.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            proposal.status === 'accepted' ? 'bg-green-100 text-green-700' :
                            proposal.status === 'rejected' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {proposal.status}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex gap-4">
                            <span className="text-gray-600">
                              Proposed Budget: <span className="font-medium text-gray-900">${proposal.proposed_budget}</span>
                            </span>
                            <span className="text-gray-600">
                              Timeline: <span className="font-medium text-gray-900">{proposal.estimated_duration}</span>
                            </span>
                          </div>
                          <span className="text-gray-500">{new Date(proposal.created_at).toLocaleDateString()}</span>
                        </div>
                        {proposal.cover_letter && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-xs text-gray-500 mb-1">Cover Letter</p>
                            <p className="text-sm text-gray-700 line-clamp-2">{proposal.cover_letter}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 text-gray-500">
                    <PaperAirplaneIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">No proposals yet</p>
                    <p className="text-sm mt-2">Start applying to projects to see your proposals here</p>
                    <Link
                      href="/dashboard/freelancer/projects"
                      className="inline-block mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Browse Projects
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Earnings Section */}
            {activeSection === 'earnings' && (
              <div className="space-y-10">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Earnings Overview</h2>
                  <p className="text-sm text-gray-600 mt-1">Track your income and payment history</p>
                </div>

                {/* Earnings Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="bg-gradient-to-br from-green-50 to-white rounded-xl p-5 border border-green-200 shadow-md hover:shadow-xl transition-all duration-300">
                    <p className="text-base font-semibold text-gray-600 mb-3">Total Earnings</p>
                    <p className="text-4xl font-bold text-gray-900">${totalEarnings.toLocaleString()}</p>
                    <p className="text-sm text-emerald-600 mt-3 font-medium">All time</p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-5 border border-blue-200 shadow-md hover:shadow-xl transition-all duration-300">
                    <p className="text-base font-semibold text-gray-600 mb-3">This Month</p>
                    <p className="text-4xl font-bold text-gray-900">$0</p>
                    <p className="text-sm text-gray-500 mt-3 font-medium">Coming soon</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl p-5 border border-purple-200 shadow-md hover:shadow-xl transition-all duration-300">
                    <p className="text-base font-semibold text-gray-600 mb-3">Pending</p>
                    <p className="text-4xl font-bold text-gray-900">$0</p>
                    <p className="text-sm text-gray-500 mt-3 font-medium">Coming soon</p>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-8 text-center border border-gray-200 shadow-sm">
                  <CurrencyDollarIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium text-gray-900">Detailed earnings breakdown coming soon</p>
                  <p className="text-sm text-gray-600 mt-2">You'll be able to see your payment history, invoices, and more</p>
                </div>
              </div>
            )}

            {/* Active Projects Section */}
            {activeSection === 'projects' && (
              <div className="space-y-10">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Active Projects</h2>
                  <p className="text-sm text-gray-600 mt-1">Manage your ongoing projects</p>
                </div>

                {activeProjects && activeProjects.length > 0 ? (
                  <div className="space-y-4">
                    {activeProjects.map((project: any) => (
                      <div key={project.id} className="bg-white rounded-xl p-5 border border-gray-200 shadow-md hover:shadow-xl hover:border-purple-300 transition-all duration-300">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h4 className="text-base font-bold text-gray-900 mb-2">{project.title}</h4>
                            <p className="text-base text-gray-600 mb-3">{project.description}</p>
                          </div>
                          <span className={`ml-4 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap ${
                            project.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                            project.status === 'in_review' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {project.status === 'in_progress' ? 'In Progress' :
                             project.status === 'in_review' ? 'In Review' : project.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Client</p>
                            <p className="font-semibold text-gray-900">{project.profiles?.full_name || 'Anonymous'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Your Earnings</p>
                            <p className="font-semibold text-purple-700 text-lg">
                              {project.freelancer_payout_amount
                                ? `$${project.freelancer_payout_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                                : project.escrow_amount
                                  ? `$${project.escrow_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                                  : 'Not set'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Deadline</p>
                            <p className="font-semibold text-gray-900">
                              {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'Not set'}
                            </p>
                          </div>
                        </div>

                        {project.required_skills && project.required_skills.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <p className="text-sm text-gray-500 mb-2">Required Skills</p>
                            <div className="flex flex-wrap gap-2">
                              {project.required_skills.map((skill: string) => (
                                <span key={skill} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="mt-6 flex justify-end">
                          <Link
                            href={`/dashboard/freelancer/projects/${project.id}`}
                            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:shadow-lg hover:scale-[1.02] transition-all duration-200 font-semibold"
                          >
                            View Project Workspace
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 text-gray-500">
                    <ChartBarIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">No active projects</p>
                    <p className="text-sm mt-2">Your accepted proposals will appear here as active projects</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Proposal Form Modal */}
      {showProposalForm && selectedProject && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full my-8">
            {showProposalPreview ? (
              /* Proposal Preview */
              <div className="p-8 space-y-4">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Review Your Proposal</h3>
                    <p className="text-gray-600">Please review before submitting</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowProposalForm(false)
                      setShowProposalPreview(false)
                      setSelectedProject(null)
                      setProposalFormData({
                        cover_letter: '',
                        proposed_budget: '',
                        estimated_duration: '',
                      })
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Project Info */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
                  <h4 className="text-base font-bold text-gray-900 mb-2">{selectedProject.title}</h4>
                  <p className="text-sm text-gray-600 line-clamp-2">{selectedProject.description}</p>
                </div>

                {/* Proposal Details */}
                <div className="space-y-4">
                  <div>
                    <h5 className="text-sm font-semibold text-gray-700 mb-2 uppercase">Cover Letter</h5>
                    <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
                      <p className="text-gray-900 whitespace-pre-wrap">{proposalFormData.cover_letter}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
                      <p className="text-sm font-semibold text-gray-700 mb-1">Your Bid</p>
                      <p className="text-2xl font-bold text-purple-600">${proposalFormData.proposed_budget}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
                      <p className="text-sm font-semibold text-gray-700 mb-1">Timeline</p>
                      <p className="text-lg font-bold text-gray-900">{proposalFormData.estimated_duration}</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4 border-t-2">
                  <button
                    type="button"
                    onClick={handleConfirmSubmitProposal}
                    disabled={loading}
                    className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:shadow-xl hover:scale-[1.02] transition-all duration-200 font-bold text-lg disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <PaperAirplaneIcon className="w-6 h-6" />
                        Confirm & Submit Proposal
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowProposalPreview(false)}
                    disabled={loading}
                    className="px-6 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-semibold disabled:opacity-50"
                  >
                    ← Back to Edit
                  </button>
                </div>
              </div>
            ) : (
              /* Proposal Form */
              <form onSubmit={handleShowProposalPreview} className="p-8 space-y-4">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Submit Proposal</h3>
                    <p className="text-gray-600">For: {selectedProject.title}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowProposalForm(false)
                      setSelectedProject(null)
                      setProposalFormData({
                        cover_letter: '',
                        proposed_budget: '',
                        estimated_duration: '',
                      })
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Cover Letter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cover Letter <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={6}
                    value={proposalFormData.cover_letter}
                    onChange={(e) => setProposalFormData({ ...proposalFormData, cover_letter: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all resize-none"
                    placeholder="Explain why you're the best fit for this project, your relevant experience, and your approach..."
                  />
                  <p className="text-xs text-gray-500 mt-1">{proposalFormData.cover_letter.length} characters</p>
                </div>

                {/* Budget & Timeline */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Bid (USD) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      step="0.01"
                      value={proposalFormData.proposed_budget}
                      onChange={(e) => setProposalFormData({ ...proposalFormData, proposed_budget: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                      placeholder="1000"
                    />
                    {selectedProject.budget_min && selectedProject.budget_max && (
                      <p className="text-xs text-gray-500 mt-1">
                        Client's budget: ${selectedProject.budget_min} - ${selectedProject.budget_max}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estimated Timeline <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={proposalFormData.estimated_duration}
                      onChange={(e) => setProposalFormData({ ...proposalFormData, estimated_duration: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                      placeholder="e.g. 2 weeks, 10 days"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4 border-t">
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:shadow-lg hover:scale-[1.02] transition-all duration-200 font-semibold"
                  >
                    Preview Proposal →
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowProposalForm(false)
                      setSelectedProject(null)
                      setProposalFormData({
                        cover_letter: '',
                        proposed_budget: '',
                        estimated_duration: '',
                      })
                    }}
                    className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
