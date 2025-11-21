'use client'

import { StarIcon, MapPinIcon, CheckBadgeIcon } from '@heroicons/react/24/solid'
import { ClockIcon } from '@heroicons/react/24/outline'

interface FreelancerCardProps {
  freelancer: {
    id: string
    full_name: string
    email: string
    freelancer_profiles: {
      title?: string
      bio?: string
      hourly_rate?: number
      rating?: number
      total_reviews?: number
      completed_projects?: number
      skills?: string[]
      availability?: string
      languages?: string[]
      location?: string
      avatar_url?: string
    }
  }
  onInviteToProject: (freelancerId: string) => void
  onRequestQuote: (freelancerId: string) => void
}

export default function FreelancerCard({ freelancer, onInviteToProject, onRequestQuote }: FreelancerCardProps) {
  const profile = freelancer.freelancer_profiles

  const getAvailabilityColor = () => {
    switch (profile?.availability) {
      case 'available': return 'bg-green-100 text-green-700'
      case 'busy': return 'bg-yellow-100 text-yellow-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getAvailabilityText = () => {
    switch (profile?.availability) {
      case 'available': return 'Available Now'
      case 'busy': return 'Busy'
      default: return 'Unavailable'
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 hover:border-green-300 hover:shadow-lg transition-all duration-200 p-6">
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        {/* Avatar */}
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
          {freelancer.full_name?.charAt(0).toUpperCase() || 'F'}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-gray-900 truncate mb-1">
            {freelancer.full_name}
          </h3>
          <p className="text-sm text-purple-600 font-semibold truncate mb-2">
            {profile?.title || 'Freelancer'}
          </p>

          {/* Rating & Stats */}
          {(profile?.rating && profile?.total_reviews && profile.total_reviews > 0) || (profile?.completed_projects && profile.completed_projects > 0) ? (
            <div className="flex items-center gap-3 text-xs">
              {profile?.rating && profile?.total_reviews && profile.total_reviews > 0 && (
                <>
                  <div className="flex items-center gap-1">
                    <StarIcon className="w-4 h-4 text-yellow-500" />
                    <span className="font-semibold">{profile.rating.toFixed(1)}</span>
                    <span className="text-gray-500">({profile.total_reviews})</span>
                  </div>
                  {profile?.completed_projects && profile.completed_projects > 0 && (
                    <span className="text-gray-300">•</span>
                  )}
                </>
              )}
              {profile?.completed_projects && profile.completed_projects > 0 && (
                <div className="flex items-center gap-1">
                  <CheckBadgeIcon className="w-4 h-4 text-green-600" />
                  <span className="text-gray-700">{profile.completed_projects} projects</span>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>

      {/* Bio */}
      {profile?.bio && (
        <p className="text-sm text-gray-600 line-clamp-2 mb-4">
          {profile.bio}
        </p>
      )}

      {/* Skills */}
      {profile?.skills && profile.skills.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {profile.skills.slice(0, 4).map((skill) => (
            <span
              key={skill}
              className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs font-medium"
            >
              {skill}
            </span>
          ))}
          {profile.skills.length > 4 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">
              +{profile.skills.length - 4} more
            </span>
          )}
        </div>
      )}

      {/* Bottom Info */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        {/* Availability */}
        <div className="flex items-center gap-3 text-xs">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAvailabilityColor()}`}>
            {getAvailabilityText()}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2 mt-4">
        <button
          onClick={() => onInviteToProject(freelancer.id)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
        >
          Invite to Project
        </button>
        <button
          onClick={() => onRequestQuote(freelancer.id)}
          className="px-4 py-2 bg-white border-2 border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors font-medium text-sm"
        >
          Request Quote
        </button>
      </div>
    </div>
  )
}
