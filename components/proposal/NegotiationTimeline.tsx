'use client'

import { ClockIcon, UserIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline'

interface NegotiationTimelineProps {
  negotiationHistory: Array<{
    timestamp: string
    by: 'client' | 'freelancer'
    old_budget: number
    new_budget: number
    old_duration?: string
    new_duration?: string
    message: string
  }>
  originalBudget?: number
  currentBudget: number
  negotiationCount: number
  status: string
}

export default function NegotiationTimeline({
  negotiationHistory,
  originalBudget,
  currentBudget,
  negotiationCount,
  status
}: NegotiationTimelineProps) {
  if (!negotiationHistory || negotiationHistory.length === 0) {
    return null
  }

  const getStatusBadge = () => {
    if (status === 'negotiating') {
      return (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          Negotiation in Progress (Round {negotiationCount}/2)
        </div>
      )
    }
    if (status === 'final_offer') {
      return (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
          Final Offer - Must Accept or Decline
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">Negotiation History</h3>
        {getStatusBadge()}
      </div>

      {/* Budget Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div>
          <p className="text-xs text-gray-600 mb-1">Original Budget</p>
          <p className="text-lg font-bold text-gray-900">
            ${(originalBudget || currentBudget).toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-600 mb-1">Current Budget</p>
          <p className="text-lg font-bold text-green-600">
            ${currentBudget.toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-600 mb-1">Change</p>
          <p className={`text-lg font-bold ${
            currentBudget > (originalBudget || currentBudget) ? 'text-green-600' :
            currentBudget < (originalBudget || currentBudget) ? 'text-red-600' :
            'text-gray-900'
          }`}>
            {currentBudget === (originalBudget || currentBudget) ? '—' :
              `${currentBudget > (originalBudget || currentBudget) ? '+' : ''}$${(currentBudget - (originalBudget || currentBudget)).toFixed(2)}`
            }
          </p>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        {negotiationHistory.map((entry, index) => {
          const isClient = entry.by === 'client'
          const budgetChanged = entry.old_budget !== entry.new_budget
          const durationChanged = entry.old_duration !== entry.new_duration
          const budgetIncrease = entry.new_budget > entry.old_budget

          return (
            <div key={index} className="relative pl-8 pb-4">
              {/* Timeline line */}
              {index < negotiationHistory.length - 1 && (
                <div className="absolute left-3 top-8 bottom-0 w-0.5 bg-gray-200" />
              )}

              {/* Timeline dot */}
              <div className={`absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center ${
                isClient ? 'bg-green-100 text-green-600' : 'bg-purple-100 text-purple-600'
              }`}>
                <UserIcon className="w-4 h-4" />
              </div>

              {/* Content */}
              <div className="bg-gray-50 rounded-lg p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {isClient ? 'Client' : 'Freelancer'} Counter-Offer
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                      <ClockIcon className="w-3 h-3" />
                      {new Date(entry.timestamp).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    isClient ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'
                  }`}>
                    Round {index + 1}
                  </div>
                </div>

                {/* Changes */}
                <div className="space-y-2 mb-3">
                  {budgetChanged && (
                    <div className="flex items-center gap-2 text-sm">
                      <CurrencyDollarIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Budget:</span>
                      <span className="line-through text-gray-400">
                        ${entry.old_budget.toFixed(2)}
                      </span>
                      <span className="text-gray-400">→</span>
                      <span className={`font-semibold ${
                        budgetIncrease ? 'text-green-600' : 'text-red-600'
                      }`}>
                        ${entry.new_budget.toFixed(2)}
                      </span>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        budgetIncrease ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {budgetIncrease ? '+' : ''}${(entry.new_budget - entry.old_budget).toFixed(2)}
                      </span>
                    </div>
                  )}

                  {durationChanged && (
                    <div className="flex items-center gap-2 text-sm">
                      <ClockIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Duration:</span>
                      {entry.old_duration && (
                        <>
                          <span className="line-through text-gray-400">{entry.old_duration}</span>
                          <span className="text-gray-400">→</span>
                        </>
                      )}
                      <span className="font-semibold text-gray-900">
                        {entry.new_duration || 'Not specified'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Message */}
                <div className="pt-3 border-t border-gray-200">
                  <p className="text-sm text-gray-700">{entry.message}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer info */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-800">
          {negotiationCount === 2 ? (
            <strong>Maximum negotiation rounds reached.</strong>
          ) : (
            <>
              <strong>Negotiation round {negotiationCount} of 2 complete.</strong>
              {' '}One more counter-offer is allowed before final decision.
            </>
          )}
        </p>
      </div>
    </div>
  )
}
