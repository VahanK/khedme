'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/lib/context/ToastContext'
import InfoButton from '@/components/ui/InfoButton'
import GradientCard from '@/components/ui/GradientCard'
import TaskListItem from '@/components/ui/TaskListItem'
import StatCard from '@/components/ui/StatCard'
import ProposalCard from '@/components/dashboard/ProposalCard'
import FreelancerCard from '@/components/browse/FreelancerCard'
import FreelancerFilters from '@/components/browse/FreelancerFilters'
import InviteToProjectModal from '@/components/modals/InviteToProjectModal'
import RequestQuoteModal from '@/components/modals/RequestQuoteModal'
import NotificationBell from '@/components/notifications/NotificationBell'
import {
  UserCircleIcon,
  ChartBarIcon,
  BriefcaseIcon,
  DocumentCheckIcon,
  UserGroupIcon,
  PlusIcon,
  BuildingOfficeIcon,
  GlobeAltIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline'

interface ClientTabsProps {
  profileCompletion: number
  totalSpent: number
  activeProjectsCount: number
  pendingProposalsCount: number
  uniqueFreelancersCount: number
  profile: any
  clientProfile: any
  projects: any[]
  activeProjects: any[]
  recentProposals: any[]
  completedProjects: any[]
  freelancers?: any[]
  availableSkills?: string[]
  availableLanguages?: string[]
  userRole?: 'freelancer' | 'client'
  onAcceptProposal?: (proposalId: string) => Promise<void>
  onDeclineProposal?: (proposalId: string) => Promise<void>
}

const COMMON_SKILLS = [
  'React', 'Next.js', 'TypeScript', 'JavaScript', 'Node.js', 'Python', 'Java',
  'UI/UX Design', 'Figma', 'Graphic Design', 'Content Writing', 'SEO',
  'Marketing', 'Sales', 'Data Analysis', 'Project Management', 'WordPress',
  'Mobile Development', 'iOS', 'Android', 'DevOps', 'AWS', 'Docker'
]

export default function ClientTabs({
  profileCompletion,
  totalSpent,
  activeProjectsCount,
  pendingProposalsCount,
  uniqueFreelancersCount,
  profile,
  clientProfile,
  projects,
  activeProjects,
  recentProposals,
  completedProjects,
  freelancers = [],
  availableSkills = [],
  availableLanguages = [],
  userRole = 'client',
  onAcceptProposal,
  onDeclineProposal,
}: ClientTabsProps) {
  const router = useRouter()
  const { showSuccess, showError } = useToast()
  const [activeSection, setActiveSection] = useState('profile')
  const [isEditing, setIsEditing] = useState(false)
  const [isPostingProject, setIsPostingProject] = useState(false)
  const [showProjectPreview, setShowProjectPreview] = useState(false)
  const [loading, setLoading] = useState(false)

  // Browse freelancers state
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<any>({})
  const [sortBy, setSortBy] = useState('rating')
  const [selectedFreelancer, setSelectedFreelancer] = useState<string | null>(null)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showQuoteModal, setShowQuoteModal] = useState(false)

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
    company_name: clientProfile?.company_name || '',
    company_description: clientProfile?.company_description || '',
    company_website: clientProfile?.company_website || '',
  })

  const [projectFormData, setProjectFormData] = useState({
    title: '',
    description: '',
    budget_min: '',
    budget_max: '',
    deadline: '',
    duration: '',
    required_skills: [] as string[],
  })

  const [customSkill, setCustomSkill] = useState('')
  const [calculatedCompletion, setCalculatedCompletion] = useState(profileCompletion)

  const supabase = createClient()

  // Calculate profile completion dynamically
  const calculateProfileCompletion = (profile: any, clientProfile: any) => {
    const items = [
      !!profile?.full_name,
      !!clientProfile?.company_name,
      !!clientProfile?.company_description,
      !!clientProfile?.company_website,
    ]
    const completed = items.filter(Boolean).length
    return Math.round((completed / items.length) * 100)
  }

  // Color themes for client
  const colorThemes = {
    client: {
      sidebarBg: 'bg-gradient-to-b from-green-50 to-green-100',
      sidebarBorder: 'border-green-200',
      activeItemBg: 'bg-green-600',
      activeItemText: 'text-white',
      inactiveItemText: 'text-gray-700',
      inactiveItemHover: 'hover:bg-green-50',
      accent: 'green',
    },
  }

  const theme = colorThemes.client

  const sections = [
    { id: 'profile', label: 'Profile', icon: UserCircleIcon },
    { id: 'projects', label: 'My Projects', icon: BriefcaseIcon },
    { id: 'active-projects', label: 'Active Projects', icon: ChartBarIcon },
    { id: 'proposals', label: 'Proposals', icon: DocumentCheckIcon },
    { id: 'browse', label: 'Browse Freelancers', icon: UserGroupIcon },
  ]

  const handleSaveProfile = async () => {
    setLoading(true)

    try {
      // Update profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ full_name: formData.full_name })
        .eq('id', profile.id)

      if (profileError) throw profileError

      // Update client_profiles table
      const { error: clientProfileError } = await supabase
        .from('client_profiles')
        .upsert({
          id: profile.id,
          company_name: formData.company_name,
          company_description: formData.company_description,
          company_website: formData.company_website,
        })

      if (clientProfileError) throw clientProfileError

      // Recalculate profile completion
      const newCompletion = calculateProfileCompletion(
        { ...profile, full_name: formData.full_name },
        {
          ...clientProfile,
          company_name: formData.company_name,
          company_description: formData.company_description,
          company_website: formData.company_website,
        }
      )
      setCalculatedCompletion(newCompletion)

      showSuccess('Profile updated successfully!')
      setIsEditing(false)

      // Refresh the page data
      setTimeout(() => {
        router.refresh()
      }, 1000)
    } catch (error: any) {
      showError(error.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleShowProjectPreview = (e: React.FormEvent) => {
    e.preventDefault()
    setShowProjectPreview(true)
  }

  const handleConfirmPostProject = async () => {
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('projects')
        .insert({
          client_id: user.id,
          title: projectFormData.title,
          description: projectFormData.description,
          budget_min: projectFormData.budget_min ? Number(projectFormData.budget_min) : null,
          budget_max: projectFormData.budget_max ? Number(projectFormData.budget_max) : null,
          deadline: projectFormData.deadline || null,
          duration: projectFormData.duration || null,
          required_skills: projectFormData.required_skills.length > 0 ? projectFormData.required_skills : null,
          status: 'open',
          payment_status: 'pending'
        })

      if (error) throw error

      showSuccess('Project posted successfully!')
      setProjectFormData({
        title: '',
        description: '',
        budget_min: '',
        budget_max: '',
        deadline: '',
        duration: '',
        required_skills: [],
      })
      setShowProjectPreview(false)
      setIsPostingProject(false)

      // Refresh the page data
      setTimeout(() => {
        router.refresh()
      }, 1000)
    } catch (error: any) {
      showError(error.message || 'Failed to post project')
    } finally {
      setLoading(false)
    }
  }

  const toggleSkill = (skill: string) => {
    setProjectFormData(prev => ({
      ...prev,
      required_skills: prev.required_skills.includes(skill)
        ? prev.required_skills.filter(s => s !== skill)
        : [...prev.required_skills, skill]
    }))
  }

  const addCustomSkill = () => {
    const trimmed = customSkill.trim()
    if (trimmed && !projectFormData.required_skills.includes(trimmed)) {
      setProjectFormData(prev => ({
        ...prev,
        required_skills: [...prev.required_skills, trimmed]
      }))
      setCustomSkill('')
    }
  }

  const removeSkill = (skill: string) => {
    setProjectFormData(prev => ({
      ...prev,
      required_skills: prev.required_skills.filter(s => s !== skill)
    }))
  }

  return (
    <div className="flex flex-col md:flex-row w-full">
      {/* Fixed Left Sidebar */}
      <aside className="hidden md:block md:w-64 md:flex-shrink-0 md:h-screen md:sticky md:top-0 md:overflow-y-auto">
        <div className={`h-full border-r shadow-lg ${theme.sidebarBg} ${theme.sidebarBorder} flex flex-col`}>
          {/* User Info Section */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                {clientProfile?.avatar_url ? (
                  <img
                    src={clientProfile.avatar_url}
                    alt={profile?.full_name || 'User'}
                    className="w-full h-full object-cover"
                    key={clientProfile.avatar_url}
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
          <div className="p-4 border-t border-gray-200 space-y-2">
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
                      ? 'bg-green-100 text-green-700'
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
                  <h2 className="text-lg font-bold text-gray-900">Company Profile</h2>
                  <p className="text-sm text-gray-600 mt-1">This is how freelancers see your company</p>
                </div>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:shadow-lg hover:scale-[1.02] transition-all duration-200 font-semibold text-sm shadow-md"
                  >
                    Edit Profile
                  </button>
                )}
              </div>

              {/* Profile Content */}
              <div className="space-y-4">
                {!isEditing && (
                  <>
                    {/* Hero Section - Company Info */}
                    <div className="bg-gradient-to-br from-white to-green-50 rounded-xl p-4 border border-green-200 shadow-xl">
                      <div className="flex items-start gap-6">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                          {clientProfile?.company_name?.charAt(0).toUpperCase() || profile?.full_name?.charAt(0).toUpperCase() || 'C'}
                        </div>
                        <div className="flex-1">
                          <h1 className="text-3xl font-bold text-gray-900 mb-1">
                            {clientProfile?.company_name || profile?.full_name || 'Company Profile'}
                          </h1>
                          <p className="text-lg text-gray-600 mb-4">{profile?.email}</p>
                          {clientProfile?.company_description && (
                            <p className="text-gray-700 leading-relaxed">{clientProfile.company_description}</p>
                          )}
                          {clientProfile?.company_website && (
                            <a
                              href={clientProfile.company_website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 mt-4 text-green-600 hover:text-green-700 font-medium transition-colors"
                            >
                              <GlobeAltIcon className="w-5 h-5" />
                              {clientProfile.company_website}
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Profile Completion Card or Quick Actions */}
                    {calculatedCompletion < 100 ? (
                      <div className="bg-gradient-to-r from-green-50 to-green-50 border-2 border-green-200 rounded-xl p-4 shadow-md">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900">Profile Completion</h3>
                            <p className="text-sm text-gray-600 mt-1">Complete your profile to attract top freelancers</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-3xl font-bold text-green-600">{calculatedCompletion}%</div>
                            <button
                              onClick={() => setIsEditing(true)}
                              className="px-3 py-1.5 text-xs font-medium text-green-700 bg-white border border-green-300 rounded-lg hover:bg-green-50 transition-colors"
                            >
                              Complete
                            </button>
                          </div>
                        </div>
                        <div className="w-full bg-white rounded-full h-3 overflow-hidden shadow-inner">
                          <div
                            className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-500"
                            style={{ width: `${calculatedCompletion}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 shadow-lg text-white">
                        <div className="flex items-start gap-3 mb-4">
                          <div className="text-3xl">🎉</div>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold mb-1">Profile Complete! Ready to Get Started?</h3>
                            <p className="text-green-50 text-sm">Your profile looks great! Let's find the perfect freelancer for your project</p>
                          </div>
                        </div>
                        <div className="flex gap-3 mt-4">
                          <button
                            onClick={() => setActiveSection('post-project')}
                            className="flex-1 px-4 py-3 bg-white text-green-600 rounded-lg hover:bg-green-50 transition-all font-semibold text-sm shadow-md hover:shadow-lg hover:scale-[1.02] duration-200"
                          >
                            🚀 Post a Project
                          </button>
                          <button
                            onClick={() => setActiveSection('browse')}
                            className="flex-1 px-4 py-3 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-all font-semibold text-sm shadow-md hover:shadow-lg hover:scale-[1.02] duration-200"
                          >
                            Browse Freelancers
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {isEditing && (
                  <form onSubmit={handleSaveProfile} className="space-y-8">
                    {/* Basic Information */}
                    <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-5 border border-gray-200 shadow-md hover:shadow-lg transition-shadow duration-200">
                  <div className="flex items-center gap-3 mb-6">
                    <BuildingOfficeIcon className="w-6 h-6 text-green-600" />
                    <h3 className="text-xl font-semibold text-gray-900">Basic Information</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Contact Name</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={formData.full_name}
                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                            placeholder="Your name"
                          />
                        ) : (
                          <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">{profile?.full_name || 'Not set'}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">{profile?.email}</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.company_name}
                          onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                          placeholder="Your company name"
                        />
                      ) : (
                        <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">{clientProfile?.company_name || 'Not set'}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Company Description</label>
                      {isEditing ? (
                        <textarea
                          value={formData.company_description}
                          onChange={(e) => setFormData({ ...formData, company_description: e.target.value })}
                          rows={4}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                          placeholder="Tell freelancers about your company..."
                        />
                      ) : (
                        <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900 whitespace-pre-wrap">{clientProfile?.company_description || 'Not set'}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <GlobeAltIcon className="w-4 h-4" />
                        Company Website
                      </label>
                      {isEditing ? (
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                            <span className="text-gray-500 text-sm font-medium">https://</span>
                          </div>
                          <input
                            type="text"
                            value={formData.company_website.replace(/^https?:\/\//, '')}
                            onChange={(e) => {
                              const value = e.target.value.replace(/^https?:\/\//, '')
                              setFormData({ ...formData, company_website: value ? `https://${value}` : '' })
                            }}
                            className="w-full pl-20 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                            placeholder="yourcompany.com"
                          />
                        </div>
                      ) : (
                        <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                          {clientProfile?.company_website ? (
                            <a href={clientProfile.company_website} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">
                              {clientProfile.company_website}
                            </a>
                          ) : (
                            'Not set'
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-4 border-t">
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:shadow-lg hover:scale-[1.02] transition-all duration-200 font-semibold disabled:opacity-50"
                      >
                        {loading ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(false)
                          setFormData({
                            full_name: profile?.full_name || '',
                            company_name: clientProfile?.company_name || '',
                            company_description: clientProfile?.company_description || '',
                            company_website: clientProfile?.company_website || '',
                          })
                        }}
                        disabled={loading}
                        className="px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-semibold disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* My Projects Section */}
          {activeSection === 'projects' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    {isPostingProject ? 'Post New Project' : 'My Projects'}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {isPostingProject ? 'Fill in the details below' : 'Manage your posted projects'}
                  </p>
                </div>
                {!isPostingProject && (
                  <button
                    onClick={() => setIsPostingProject(true)}
                    className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:shadow-lg hover:scale-[1.02] transition-all duration-200 font-semibold text-sm shadow-md flex items-center gap-2"
                  >
                    <PlusIcon className="w-5 h-5" />
                    Post New Project
                  </button>
                )}
              </div>

              {isPostingProject ? (
                showProjectPreview ? (
                  /* Project Preview */
                  <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg p-8 space-y-4 border border-gray-200">
                    <div className="border-l-4 border-green-600 pl-4 mb-6">
                      <h3 className="text-base font-bold text-gray-900 mb-2">Review Your Project</h3>
                      <p className="text-gray-600">Please review the details before posting</p>
                    </div>

                    {/* Project Title */}
                    <div className="bg-gradient-to-r from-green-50 to-green-50 rounded-xl p-6">
                      <h4 className="text-lg font-bold text-gray-900 mb-2">{projectFormData.title}</h4>
                      <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                        Open for proposals
                      </span>
                    </div>

                    {/* Description */}
                    <div>
                      <h5 className="text-sm font-semibold text-gray-700 mb-2 uppercase">Project Description</h5>
                      <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
                        <p className="text-gray-900 whitespace-pre-wrap">{projectFormData.description}</p>
                      </div>
                    </div>

                    {/* Project Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Budget */}
                      {(projectFormData.budget_min || projectFormData.budget_max) && (
                        <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
                          <p className="text-sm font-semibold text-gray-700 mb-2">Budget Range</p>
                          <p className="text-2xl font-bold text-green-600">
                            {projectFormData.budget_min && projectFormData.budget_max
                              ? `$${projectFormData.budget_min} - $${projectFormData.budget_max}`
                              : projectFormData.budget_min
                                ? `From $${projectFormData.budget_min}`
                                : `Up to $${projectFormData.budget_max}`}
                          </p>
                        </div>
                      )}

                      {/* Deadline */}
                      {projectFormData.deadline && (
                        <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
                          <p className="text-sm font-semibold text-gray-700 mb-2">Project Deadline</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {new Date(projectFormData.deadline).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      )}

                      {/* Duration */}
                      {projectFormData.duration && (
                        <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
                          <p className="text-sm font-semibold text-gray-700 mb-2">Estimated Duration</p>
                          <p className="text-lg font-semibold text-gray-900">{projectFormData.duration}</p>
                        </div>
                      )}
                    </div>

                    {/* Required Skills */}
                    {projectFormData.required_skills.length > 0 && (
                      <div>
                        <h5 className="text-sm font-semibold text-gray-700 mb-3 uppercase">Required Skills</h5>
                        <div className="flex flex-wrap gap-2">
                          {projectFormData.required_skills.map((skill) => (
                            <span
                              key={skill}
                              className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Company Info */}
                    <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
                      <div className="flex items-center gap-2 text-blue-800">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <p className="text-sm font-medium">
                          This project will be posted by <span className="font-bold">{clientProfile?.company_name || profile?.full_name}</span>
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-4 border-t-2">
                      <button
                        type="button"
                        onClick={handleConfirmPostProject}
                        disabled={loading}
                        className="flex-1 px-6 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:shadow-xl hover:scale-[1.02] transition-all duration-200 font-bold text-lg disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <>
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Posting...
                          </>
                        ) : (
                          <>
                            <CheckCircleIcon className="w-6 h-6" />
                            Confirm & Post Project
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowProjectPreview(false)}
                        disabled={loading}
                        className="px-6 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-semibold disabled:opacity-50"
                      >
                        ← Back to Edit
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Post Project Form */
                  <form onSubmit={handleShowProjectPreview} className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg p-8 space-y-4 border border-gray-200">
                  {/* Project Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={projectFormData.title}
                      onChange={(e) => setProjectFormData({ ...projectFormData, title: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                      placeholder="e.g. Build a modern e-commerce website"
                    />
                  </div>

                  {/* Project Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={6}
                      value={projectFormData.description}
                      onChange={(e) => setProjectFormData({ ...projectFormData, description: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all resize-none"
                      placeholder="Describe your project in detail, including requirements, goals, and any specific needs..."
                    />
                    <p className="text-xs text-gray-500 mt-1">{projectFormData.description.length} characters</p>
                  </div>

                  {/* Budget Range */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Minimum Budget (USD)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={projectFormData.budget_min}
                        onChange={(e) => setProjectFormData({ ...projectFormData, budget_min: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                        placeholder="500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Maximum Budget (USD)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={projectFormData.budget_max}
                        onChange={(e) => setProjectFormData({ ...projectFormData, budget_max: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                        placeholder="1000"
                      />
                    </div>
                  </div>

                  {/* Deadline & Duration */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Project Deadline (Optional)
                      </label>
                      <input
                        type="date"
                        value={projectFormData.deadline}
                        onChange={(e) => setProjectFormData({ ...projectFormData, deadline: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Estimated Duration (Optional)
                      </label>
                      <input
                        type="text"
                        value={projectFormData.duration}
                        onChange={(e) => setProjectFormData({ ...projectFormData, duration: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                        placeholder="e.g. 2 weeks, 1 month"
                      />
                    </div>
                  </div>

                  {/* Required Skills */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Required Skills
                    </label>

                    {/* Selected Skills */}
                    {projectFormData.required_skills.length > 0 && (
                      <div className="mb-3 p-3 bg-green-50 rounded-lg">
                        <p className="text-xs font-medium text-green-900 mb-2">
                          Selected Skills ({projectFormData.required_skills.length})
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {projectFormData.required_skills.map((skill) => (
                            <span
                              key={skill}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium"
                            >
                              {skill}
                              <button
                                type="button"
                                onClick={() => removeSkill(skill)}
                                className="hover:text-green-900"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Common Skills */}
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-2">Popular Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {COMMON_SKILLS.map((skill) => (
                          <button
                            key={skill}
                            type="button"
                            onClick={() => toggleSkill(skill)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                              projectFormData.required_skills.includes(skill)
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {skill}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Custom Skill */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customSkill}
                        onChange={(e) => setCustomSkill(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomSkill())}
                        className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Add custom skill..."
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

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-4 border-t">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:shadow-lg hover:scale-[1.02] transition-all duration-200 font-semibold disabled:opacity-50"
                    >
                      Preview Project →
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsPostingProject(false)
                        setShowProjectPreview(false)
                        setProjectFormData({
                          title: '',
                          description: '',
                          budget_min: '',
                          budget_max: '',
                          deadline: '',
                          required_skills: [],
                        })
                      }}
                      disabled={loading}
                      className="px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-semibold disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
                )
              ) : projects && projects.length > 0 ? (
                /* View Projects List */
                <div className="grid gap-6">
                  {projects.map((project: any) => (
                    <div key={project.id} className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-md p-8 hover:shadow-lg transition-shadow duration-200 border border-gray-200">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">{project.title}</h3>
                          <p className="text-gray-600 line-clamp-2">{project.description}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          project.status === 'open' ? 'bg-green-100 text-green-700' :
                          project.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                          project.status === 'completed' ? 'bg-gray-100 text-gray-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {project.status.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="flex items-center gap-6 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <DocumentCheckIcon className="w-5 h-5" />
                          <span>{project.proposals?.[0]?.count || 0} proposals</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-green-600">
                            ${project.budget_min} - ${project.budget_max}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t flex gap-3">
                        <Link
                          href={`/projects/${project.id}`}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                        >
                          View Details
                        </Link>
                        <Link
                          href="/dashboard/client/proposals"
                          className="px-4 py-2 bg-white border-2 border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors text-sm font-medium"
                        >
                          View All Proposals
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Empty State */
                <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-md p-8 text-center border border-gray-200">
                  <BriefcaseIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No projects yet</h3>
                  <p className="text-gray-600 mb-6">Post your first project to start hiring freelancers</p>
                  <button
                    onClick={() => setIsPostingProject(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:shadow-lg transition-all duration-200 font-semibold"
                  >
                    <PlusIcon className="w-5 h-5" />
                    Post Your First Project
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Active Projects Section */}
          {activeSection === 'active-projects' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Active Projects</h2>
                <p className="text-sm text-gray-600 mt-1">Manage your ongoing projects</p>
              </div>

              {activeProjects && activeProjects.length > 0 ? (
                <div className="space-y-4">
                  {activeProjects.map((project: any) => (
                    <div key={project.id} className="bg-white rounded-xl p-5 border border-gray-200 shadow-md hover:shadow-xl hover:border-green-300 transition-all duration-300">
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

                      {/* Freelancer Info */}
                      {project.freelancer && (
                        <div className="mb-4 pb-4 border-b border-gray-200">
                          <p className="text-sm text-gray-600 mb-2">Working with:</p>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-bold">
                              {project.freelancer.full_name?.charAt(0).toUpperCase() || 'F'}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{project.freelancer.full_name}</p>
                              <p className="text-sm text-gray-600">{project.freelancer.email}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Project Budget</p>
                          <p className="font-semibold text-gray-900">
                            ${project.escrow_amount ? project.escrow_amount.toLocaleString('en-US', { minimumFractionDigits: 2 }) : 'Not set'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Payment Status</p>
                          <p className="font-semibold text-green-700">{project.escrow_status === 'funded' ? 'Paid' : 'Pending'}</p>
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
                              <span key={skill} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="mt-6 flex justify-end">
                        <Link
                          href={`/dashboard/client/projects/${project.id}`}
                          className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:shadow-lg hover:scale-[1.02] transition-all duration-200 font-semibold"
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
                  <p className="text-sm mt-2">Your funded projects will appear here</p>
                </div>
              )}
            </div>
          )}

          {/* Proposals Section */}
          {activeSection === 'proposals' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Proposals</h2>
                <p className="text-sm text-gray-600 mt-1">Review proposals from freelancers</p>
              </div>

              {recentProposals && recentProposals.length > 0 ? (
                <div className="space-y-4">
                  {recentProposals.map((proposal: any, index: number) => (
                    <ProposalCard
                      key={proposal.id}
                      id={proposal.id}
                      projectTitle={proposal.projects?.title || 'Unknown Project'}
                      projectId={proposal.projects?.id}
                      projectDescription={proposal.projects?.description}
                      freelancerName={
                        proposal.profiles?.full_name ||
                        proposal.profiles?.email?.split('@')[0] ||
                        'Freelancer'
                      }
                      freelancerId={proposal.freelancer_id}
                      freelancerSkills={proposal.profiles?.freelancer_profiles?.skills}
                      freelancerRating={proposal.profiles?.freelancer_profiles?.rating}
                      avatarUrl={proposal.profiles?.freelancer_profiles?.avatar_url}
                      proposedBudget={proposal.proposed_budget}
                      estimatedDuration={proposal.estimated_duration}
                      coverLetter={proposal.cover_letter}
                      status={proposal.status}
                      createdAt={proposal.created_at}
                      userRole="client"
                      delay={index * 0.05}
                      onAccept={onAcceptProposal ? async () => await onAcceptProposal(proposal.id) : undefined}
                      onDecline={onDeclineProposal ? async () => await onDeclineProposal(proposal.id) : undefined}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-md p-8 text-center border border-gray-200">
                  <DocumentCheckIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No proposals yet</h3>
                  <p className="text-gray-600">Proposals from freelancers will appear here</p>
                </div>
              )}
            </div>
          )}

          {/* Browse Freelancers Section */}
          {activeSection === 'browse' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Browse Freelancers</h2>
                <p className="text-sm text-gray-600 mt-1">Find and hire talented freelancers for your projects</p>
              </div>

              {/* Search & Sort Bar */}
              <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
                <div className="flex-1 relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, skills, or title..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 font-medium">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                  >
                    <option value="rating">Highest Rating</option>
                    <option value="projects">Most Projects</option>
                  </select>
                </div>
              </div>

              {/* Results Count */}
              <div className="text-sm text-gray-600">
                Showing <span className="font-semibold">{
                  freelancers.filter(freelancer => {
                    const fp = freelancer.freelancer_profiles
                    if (!fp) return false

                    // Search filter
                    if (searchQuery) {
                      const query = searchQuery.toLowerCase()
                      const matchesName = freelancer.full_name?.toLowerCase().includes(query)
                      const matchesTitle = fp?.title?.toLowerCase().includes(query)
                      const matchesBio = fp?.bio?.toLowerCase().includes(query)
                      const matchesSkills = fp?.skills?.some((skill: string) => skill.toLowerCase().includes(query))
                      if (!matchesName && !matchesTitle && !matchesBio && !matchesSkills) return false
                    }

                    // Apply filters
                    if (filters.minRating > 0 && (!fp?.rating || fp.rating < filters.minRating)) return false
                    if (filters.availability?.length > 0 && !filters.availability.includes(fp?.availability)) return false
                    if (filters.skills?.length > 0 && !filters.skills.every((skill: string) => fp?.skills?.includes(skill))) return false
                    if (filters.languages?.length > 0 && !filters.languages.some((lang: string) => fp?.languages?.includes(lang))) return false

                    return true
                  }).length
                }</span> freelancer{freelancers.length !== 1 ? 's' : ''}
              </div>

              {/* Main Content */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Filters Sidebar */}
                <div className="lg:col-span-1">
                  <FreelancerFilters
                    onFilterChange={setFilters}
                    availableSkills={availableSkills}
                    availableLanguages={availableLanguages}
                  />
                </div>

                {/* Freelancer Grid */}
                <div className="lg:col-span-3">
                  {(() => {
                    const filteredAndSorted = freelancers
                      .filter(freelancer => {
                        const fp = freelancer.freelancer_profiles
                        if (!fp) return false

                        if (searchQuery) {
                          const query = searchQuery.toLowerCase()
                          const matchesName = freelancer.full_name?.toLowerCase().includes(query)
                          const matchesTitle = fp?.title?.toLowerCase().includes(query)
                          const matchesBio = fp?.bio?.toLowerCase().includes(query)
                          const matchesSkills = fp?.skills?.some((skill: string) => skill.toLowerCase().includes(query))
                          if (!matchesName && !matchesTitle && !matchesBio && !matchesSkills) return false
                        }

                        if (filters.minRating > 0 && (!fp?.rating || fp.rating < filters.minRating)) return false
                        if (filters.availability?.length > 0 && !filters.availability.includes(fp?.availability)) return false
                        if (filters.skills?.length > 0 && !filters.skills.every((skill: string) => fp?.skills?.includes(skill))) return false
                        if (filters.languages?.length > 0 && !filters.languages.some((lang: string) => fp?.languages?.includes(lang))) return false

                        return true
                      })
                      .sort((a, b) => {
                        const aProfile = a.freelancer_profiles
                        const bProfile = b.freelancer_profiles
                        switch (sortBy) {
                          case 'rating': return (bProfile?.rating || 0) - (aProfile?.rating || 0)
                          case 'projects': return (bProfile?.completed_projects || 0) - (aProfile?.completed_projects || 0)
                          default: return 0
                        }
                      })

                    return filteredAndSorted.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredAndSorted.map((freelancer) => (
                          <FreelancerCard
                            key={freelancer.id}
                            freelancer={freelancer}
                            onInviteToProject={(id) => {
                              setSelectedFreelancer(id)
                              setShowInviteModal(true)
                            }}
                            onRequestQuote={(id) => {
                              setSelectedFreelancer(id)
                              setShowQuoteModal(true)
                            }}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                        <p className="text-gray-500 text-lg mb-2">No freelancers found</p>
                        <p className="text-gray-400 text-sm">Try adjusting your filters or search query</p>
                      </div>
                    )
                  })()}
                </div>
              </div>

              {/* Modals */}
              {showInviteModal && selectedFreelancer && (
                <InviteToProjectModal
                  freelancerId={selectedFreelancer}
                  clientId={profile.id}
                  projects={projects.filter(p => p.status === 'open').map(p => ({
                    id: p.id,
                    title: p.title,
                    status: p.status
                  }))}
                  onClose={() => {
                    setShowInviteModal(false)
                    setSelectedFreelancer(null)
                    router.refresh()
                  }}
                />
              )}

              {showQuoteModal && selectedFreelancer && (
                <RequestQuoteModal
                  freelancerId={selectedFreelancer}
                  clientId={profile.id}
                  onClose={() => {
                    setShowQuoteModal(false)
                    setSelectedFreelancer(null)
                    router.refresh()
                  }}
                />
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
