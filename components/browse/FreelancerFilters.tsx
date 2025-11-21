'use client'

import { useState } from 'react'
import { FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface FreelancerFiltersProps {
  onFilterChange: (filters: any) => void
  availableSkills: string[]
  availableLanguages: string[]
}

export default function FreelancerFilters({ onFilterChange, availableSkills, availableLanguages }: FreelancerFiltersProps) {
  const [filters, setFilters] = useState({
    skills: [] as string[],
    minRating: 0,
    availability: [] as string[],
    languages: [] as string[],
  })

  const [showFilters, setShowFilters] = useState(true)

  const availabilities = ['available', 'busy']

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const toggleArrayFilter = (key: string, value: string) => {
    const currentArray = filters[key as keyof typeof filters] as string[]
    const newArray = currentArray.includes(value)
      ? currentArray.filter(v => v !== value)
      : [...currentArray, value]
    handleFilterChange(key, newArray)
  }

  const clearFilters = () => {
    const resetFilters = {
      skills: [],
      minRating: 0,
      availability: [],
      languages: [],
    }
    setFilters(resetFilters)
    onFilterChange(resetFilters)
  }

  const hasActiveFilters = () => {
    return filters.skills.length > 0 ||
           filters.minRating > 0 ||
           filters.availability.length > 0 ||
           filters.languages.length > 0
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <FunnelIcon className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-bold text-gray-900">Filters</h3>
        </div>
        {hasActiveFilters() && (
          <button
            onClick={clearFilters}
            className="text-sm text-green-600 hover:text-green-700 font-medium"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Minimum Rating */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Minimum Rating
          </label>
          <div className="flex gap-2">
            {[0, 3, 4, 4.5].map((rating) => (
              <button
                key={rating}
                onClick={() => handleFilterChange('minRating', rating)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filters.minRating === rating
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {rating === 0 ? 'Any' : `${rating}+`}
              </button>
            ))}
          </div>
        </div>

        {/* Availability */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Availability
          </label>
          <div className="space-y-2">
            {availabilities.map((avail) => (
              <label key={avail} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.availability.includes(avail)}
                  onChange={() => toggleArrayFilter('availability', avail)}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <span className="text-sm text-gray-700 capitalize">{avail}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Skills */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Skills ({filters.skills.length} selected)
          </label>
          <div className="max-h-48 overflow-y-auto space-y-2 border border-gray-200 rounded-lg p-3">
            {availableSkills.map((skill) => (
              <label key={skill} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.skills.includes(skill)}
                  onChange={() => toggleArrayFilter('skills', skill)}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <span className="text-sm text-gray-700">{skill}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Languages */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Languages ({filters.languages.length} selected)
          </label>
          <div className="max-h-48 overflow-y-auto space-y-2 border border-gray-200 rounded-lg p-3">
            {availableLanguages.map((lang) => (
              <label key={lang} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.languages.includes(lang)}
                  onChange={() => toggleArrayFilter('languages', lang)}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <span className="text-sm text-gray-700">{lang}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
