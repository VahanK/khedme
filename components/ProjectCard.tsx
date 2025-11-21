import React from 'react'
import Link from 'next/link'
import Card from './ui/Card'
import Badge from './ui/Badge'
import { ProjectWithDetails } from '@/types/database.types'

interface ProjectCardProps {
  project: ProjectWithDetails
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const timeAgo = (date: string) => {
    const now = new Date()
    const posted = new Date(date)
    const diff = now.getTime() - posted.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days} days ago`
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`
    return `${Math.floor(days / 30)} months ago`
  }

  return (
    <Link href={`/projects/${project.id}`}>
      <Card hover className="h-full">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-neutral-900 mb-2 line-clamp-2">
                {project.title}
              </h3>
              <div className="flex items-center gap-2 text-sm text-neutral-500">
                <span>{project.client?.full_name || 'Anonymous'}</span>
                <span>•</span>
                <span>{timeAgo(project.created_at)}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-neutral-600 mb-4 line-clamp-3 flex-1">
            {project.description}
          </p>

          {/* Skills */}
          {project.required_skills && project.required_skills.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {project.required_skills.slice(0, 5).map((skill) => (
                <Badge key={skill} variant="default" size="sm">
                  {skill}
                </Badge>
              ))}
              {project.required_skills.length > 5 && (
                <Badge variant="default" size="sm">
                  +{project.required_skills.length - 5}
                </Badge>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
            <div className="flex items-center gap-4">
              <div className="text-sm">
                <span className="text-neutral-500">Budget:</span>{' '}
                <span className="font-semibold text-neutral-900">
                  ${project.budget_min?.toLocaleString()} - ${project.budget_max?.toLocaleString()}
                </span>
              </div>
            </div>

            {project.proposals && (
              <div className="text-sm text-neutral-500">
                {project.proposals.length} proposal{project.proposals.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>
      </Card>
    </Link>
  )
}
