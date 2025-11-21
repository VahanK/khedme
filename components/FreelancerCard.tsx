import React from 'react'
import Link from 'next/link'
import Card from './ui/Card'
import Badge from './ui/Badge'
import Button from './ui/Button'
import { FreelancerWithProfile } from '@/types/database.types'

interface FreelancerCardProps {
  freelancer: FreelancerWithProfile
}

export default function FreelancerCard({ freelancer }: FreelancerCardProps) {
  const profile = freelancer.freelancer_profile

  const getAvailabilityColor = (status?: string) => {
    switch (status) {
      case 'available':
        return 'success'
      case 'busy':
        return 'warning'
      case 'unavailable':
        return 'error'
      default:
        return 'default'
    }
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'text-primary-100' : 'text-neutral-300'
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="text-sm text-neutral-600 ml-1">
          ({profile?.total_reviews || 0})
        </span>
      </div>
    )
  }

  return (
    <Card hover>
      <div className="flex flex-col h-full">
        {/* Header with Avatar */}
        <div className="flex items-start gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-100 to-accent-cyan flex items-center justify-center text-2xl font-bold text-neutral-950">
            {freelancer.full_name?.[0] || 'F'}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-neutral-900 mb-1">
              {freelancer.full_name || 'Freelancer'}
            </h3>
            <div className="flex items-center gap-2 mb-2">
              {renderStars(profile?.rating || 0)}
            </div>
            {profile?.availability && (
              <Badge variant={getAvailabilityColor(profile.availability)} size="sm">
                {profile.availability.charAt(0).toUpperCase() + profile.availability.slice(1)}
              </Badge>
            )}
          </div>
        </div>

        {/* Bio */}
        <p className="text-neutral-600 mb-4 line-clamp-3 flex-1">
          {profile?.bio || 'No bio available'}
        </p>

        {/* Skills */}
        {profile?.skills && profile.skills.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {profile.skills.slice(0, 6).map((skill) => (
              <Badge key={skill} variant="default" size="sm">
                {skill}
              </Badge>
            ))}
            {profile.skills.length > 6 && (
              <Badge variant="default" size="sm">
                +{profile.skills.length - 6}
              </Badge>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-neutral-900">
              ${profile?.hourly_rate || 0}
              <span className="text-base font-normal text-neutral-500">/hr</span>
            </span>
            {profile?.years_of_experience && (
              <span className="text-sm text-neutral-500">
                {profile.years_of_experience} years exp.
              </span>
            )}
          </div>

          <Link href={`/freelancers/${freelancer.id}`}>
            <Button variant="outline" size="sm">
              View Profile
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  )
}
