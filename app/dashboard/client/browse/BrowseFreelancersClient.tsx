'use client'

import { useState } from 'react'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import FreelancerCard from '@/components/browse/FreelancerCard'
import FreelancerFilters from '@/components/browse/FreelancerFilters'
import InviteToProjectModal from '@/components/modals/InviteToProjectModal'
import RequestQuoteModal from '@/components/modals/RequestQuoteModal'

interface BrowseFreelancersClientProps {
  freelancers: any[]
  clientProjects: any[]
  availableSkills: string[]
  clientId: string
}

export default function BrowseFreelancersClient({
  freelancers,
  clientProjects,
  availableSkills,
  clientId
}: BrowseFreelancersClientProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<any>({})
  const [sortBy, setSortBy] = useState('rating')
  const [selectedFreelancer, setSelectedFreelancer] = useState<string | null>(null)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showQuoteModal, setShowQuoteModal] = useState(false)

  // Filter freelancers based on search and filters
  const filteredFreelancers = freelancers.filter(freelancer => {
    const profile = freelancer.freelancer_profiles

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const matchesName = freelancer.full_name?.toLowerCase().includes(query)
      const matchesTitle = profile?.title?.toLowerCase().includes(query)
      const matchesBio = profile?.bio?.toLowerCase().includes(query)
      const matchesSkills = profile?.skills?.some((skill: string) =>
        skill.toLowerCase().includes(query)
      )
      if (!matchesName && !matchesTitle && !matchesBio && !matchesSkills) {
        return false
      }
    }

    // Rate filter
    if (profile?.hourly_rate) {
      if (profile.hourly_rate < filters.minRate || profile.hourly_rate > filters.maxRate) {
        return false
      }
    }

    // Rating filter
    if (filters.minRating > 0) {
      if (!profile?.rating || profile.rating < filters.minRating) {
        return false
      }
    }

    // Availability filter
    if (filters.availability?.length > 0) {
      if (!filters.availability.includes(profile?.availability)) {
        return false
      }
    }

    // Skills filter
    if (filters.skills?.length > 0) {
      const hasRequiredSkills = filters.skills.every((skill: string) =>
        profile?.skills?.includes(skill)
      )
      if (!hasRequiredSkills) {
        return false
      }
    }

    // Languages filter
    if (filters.languages?.length > 0) {
      const hasRequiredLanguages = filters.languages.some((lang: string) =>
        profile?.languages?.includes(lang)
      )
      if (!hasRequiredLanguages) {
        return false
      }
    }

    // Min projects filter
    if (filters.minProjects > 0) {
      if (!profile?.completed_projects || profile.completed_projects < filters.minProjects) {
        return false
      }
    }

    return true
  })

  // Sort freelancers
  const sortedFreelancers = [...filteredFreelancers].sort((a, b) => {
    const aProfile = a.freelancer_profiles
    const bProfile = b.freelancer_profiles

    switch (sortBy) {
      case 'rating':
        return (bProfile?.rating || 0) - (aProfile?.rating || 0)
      case 'rate-low':
        return (aProfile?.hourly_rate || 0) - (bProfile?.hourly_rate || 0)
      case 'rate-high':
        return (bProfile?.hourly_rate || 0) - (aProfile?.hourly_rate || 0)
      case 'projects':
        return (bProfile?.completed_projects || 0) - (aProfile?.completed_projects || 0)
      default:
        return 0
    }
  })

  const handleInviteToProject = (freelancerId: string) => {
    setSelectedFreelancer(freelancerId)
    setShowInviteModal(true)
  }

  const handleRequestQuote = (freelancerId: string) => {
    setSelectedFreelancer(freelancerId)
    setShowQuoteModal(true)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Freelancers</h1>
          <p className="text-gray-600">Find the perfect freelancer for your project</p>
        </div>

        {/* Search & Sort Bar */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex items-center gap-4">
          {/* Search */}
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

          {/* Sort */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
            >
              <option value="rating">Highest Rating</option>
              <option value="rate-low">Lowest Rate</option>
              <option value="rate-high">Highest Rate</option>
              <option value="projects">Most Projects</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-sm text-gray-600">
          Showing <span className="font-semibold">{sortedFreelancers.length}</span> freelancer{sortedFreelancers.length !== 1 ? 's' : ''}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <FreelancerFilters
              onFilterChange={setFilters}
              availableSkills={availableSkills}
            />
          </div>

          {/* Freelancer Grid */}
          <div className="lg:col-span-3">
            {sortedFreelancers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sortedFreelancers.map((freelancer) => (
                  <FreelancerCard
                    key={freelancer.id}
                    freelancer={freelancer}
                    onInviteToProject={handleInviteToProject}
                    onRequestQuote={handleRequestQuote}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <p className="text-gray-500 text-lg mb-2">No freelancers found</p>
                <p className="text-gray-400 text-sm">Try adjusting your filters or search query</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showInviteModal && selectedFreelancer && (
        <InviteToProjectModal
          freelancerId={selectedFreelancer}
          clientId={clientId}
          projects={clientProjects}
          onClose={() => {
            setShowInviteModal(false)
            setSelectedFreelancer(null)
          }}
        />
      )}

      {showQuoteModal && selectedFreelancer && (
        <RequestQuoteModal
          freelancerId={selectedFreelancer}
          clientId={clientId}
          onClose={() => {
            setShowQuoteModal(false)
            setSelectedFreelancer(null)
          }}
        />
      )}
    </div>
  )
}
