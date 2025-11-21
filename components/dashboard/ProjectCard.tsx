'use client'

import { motion } from 'framer-motion'
import { ClockIcon, CurrencyDollarIcon, TagIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

interface ProjectCardProps {
  id: string
  title: string
  description: string
  budgetMin?: number
  budgetMax?: number
  deadline?: string
  requiredSkills?: string[]
  status?: string
  proposalsCount?: number
  delay?: number
  userRole: 'freelancer' | 'client'
  clientName?: string
  postedAt: string
}

export default function ProjectCard({
  id,
  title,
  description,
  budgetMin,
  budgetMax,
  deadline,
  requiredSkills = [],
  status = 'open',
  proposalsCount = 0,
  delay = 0,
  userRole,
  clientName,
  postedAt
}: ProjectCardProps) {
  const statusColorClasses = {
    open: 'bg-emerald-50 text-emerald-700',
    in_progress: 'bg-purple-50 text-purple-700',
    in_review: 'bg-amber-50 text-amber-700',
    completed: 'bg-gray-50 text-gray-700',
    cancelled: 'bg-red-50 text-red-700'
  } as const

  const buttonColorClasses = userRole === 'freelancer'
    ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
    : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -4 }}
    >
      <div className="bg-white rounded-lg border-2 border-gray-100 hover:border-purple-200 hover:shadow-lg transition-all duration-300">
        <div className="p-6">
          {/* Header */}
          <div className="flex flex-col gap-2 pb-3">
            <div className="flex items-start justify-between w-full">
              <h3 className="text-lg font-bold text-gray-900 line-clamp-2 flex-1">
                {title}
              </h3>
              <span className={`ml-2 px-2.5 py-1 rounded-lg text-xs font-medium ${statusColorClasses[status as keyof typeof statusColorClasses] || statusColorClasses.open}`}>
                {status}
              </span>
            </div>

            {clientName && (
              <p className="text-sm text-gray-500">
                Posted by <span className="font-medium text-gray-700">{clientName}</span>
              </p>
            )}
          </div>

          {/* Body */}
          <div className="space-y-4 pt-0">
            <p className="text-sm text-gray-600 line-clamp-3">
              {description}
            </p>

            {/* Budget & Deadline */}
            <div className="flex flex-wrap gap-3">
              {(budgetMin || budgetMax) && (
                <div className="flex items-center gap-1.5 text-sm">
                  <CurrencyDollarIcon className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold text-emerald-700">
                    ${budgetMin || 0} - ${budgetMax || 0}
                  </span>
                </div>
              )}

              {deadline && (
                <div className="flex items-center gap-1.5 text-sm">
                  <ClockIcon className="w-4 h-4 text-amber-600" />
                  <span className="text-gray-600">
                    {new Date(deadline).toLocaleDateString()}
                  </span>
                </div>
              )}

              {proposalsCount > 0 && (
                <div className="flex items-center gap-1.5 text-sm">
                  <TagIcon className="w-4 h-4 text-purple-600" />
                  <span className="text-gray-600">
                    {proposalsCount} {proposalsCount === 1 ? 'proposal' : 'proposals'}
                  </span>
                </div>
              )}
            </div>

            {/* Skills */}
            {requiredSkills.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {requiredSkills.slice(0, 4).map((skill, index) => (
                  <span
                    key={index}
                    className="px-2.5 py-1 rounded-lg text-xs border border-gray-300 text-gray-700"
                  >
                    {skill}
                  </span>
                ))}
                {requiredSkills.length > 4 && (
                  <span className="px-2.5 py-1 rounded-lg text-xs border border-gray-300 text-gray-700">
                    +{requiredSkills.length - 4}
                  </span>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <span className="text-xs text-gray-500">
                Posted {new Date(postedAt).toLocaleDateString()}
              </span>
              <Link href={`/dashboard/${userRole}/projects/${id}`}>
                <button className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${buttonColorClasses}`}>
                  {userRole === 'freelancer' ? 'View & Apply' : 'Manage'}
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
