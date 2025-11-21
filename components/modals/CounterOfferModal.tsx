'use client'

import { useState } from 'react'
import { XMarkIcon, ArrowPathIcon } from '@heroicons/react/24/outline'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface CounterOfferModalProps {
  proposal: {
    id: string
    budget: number
    duration?: string
    cover_letter: string
    negotiation_count: number
    original_budget?: number
    negotiation_history?: any[]
  }
  projectTitle: string
  currentUserRole: 'client' | 'freelancer'
  onClose: () => void
}

export default function CounterOfferModal({
  proposal,
  projectTitle,
  currentUserRole,
  onClose
}: CounterOfferModalProps) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    budget: proposal.budget.toString(),
    duration: proposal.duration || '',
    message: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const canNegotiate = proposal.negotiation_count < 2
  const isLastRound = proposal.negotiation_count === 1

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.message.trim()) {
      setError('Please provide a message explaining your counter-offer')
      return
    }

    const newBudget = parseFloat(formData.budget)
    if (isNaN(newBudget) || newBudget <= 0) {
      setError('Please enter a valid budget amount')
      return
    }

    // Check if budget actually changed
    if (newBudget === proposal.budget && formData.duration === (proposal.duration || '')) {
      setError('Please change the budget or duration to submit a counter-offer')
      return
    }

    setLoading(true)
    setError('')

    try {
      const supabase = createClient()

      // Create negotiation history entry
      const historyEntry = {
        timestamp: new Date().toISOString(),
        by: currentUserRole,
        old_budget: proposal.budget,
        new_budget: newBudget,
        old_duration: proposal.duration,
        new_duration: formData.duration || null,
        message: formData.message
      }

      const currentHistory = proposal.negotiation_history || []
      const newHistory = [...currentHistory, historyEntry]

      // Update proposal with counter-offer
      const { error: updateError } = await supabase
        .from('proposals')
        .update({
          budget: newBudget,
          duration: formData.duration || null,
          negotiation_count: proposal.negotiation_count + 1,
          original_budget: proposal.original_budget || proposal.budget,
          negotiation_history: newHistory,
          status: isLastRound ? 'final_offer' : 'negotiating'
        })
        .eq('id', proposal.id)

      if (updateError) throw updateError

      router.refresh()
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to submit counter-offer')
    } finally {
      setLoading(false)
    }
  }

  if (!canNegotiate) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Cannot Negotiate Further</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          <p className="text-gray-600 mb-6">
            This proposal has reached the maximum number of counter-offers (2 rounds).
            You must either accept or decline the current offer.
          </p>
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <ArrowPathIcon className="w-6 h-6 text-green-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Submit Counter-Offer</h2>
              <p className="text-sm text-gray-500">{projectTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={loading}
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Warning for last round */}
        {isLastRound && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800 font-medium">
              <strong>Final Counter-Offer:</strong> This is your last chance to negotiate.
              After this, the other party must accept or decline.
            </p>
          </div>
        )}

        {/* Current Offer Summary */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Current Offer</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-600 mb-1">Budget</p>
              <p className="text-lg font-bold text-gray-900">${proposal.budget.toFixed(2)}</p>
            </div>
            {proposal.duration && (
              <div>
                <p className="text-xs text-gray-600 mb-1">Duration</p>
                <p className="text-lg font-bold text-gray-900">{proposal.duration}</p>
              </div>
            )}
          </div>
          {proposal.original_budget && proposal.original_budget !== proposal.budget && (
            <p className="text-xs text-gray-500 mt-2">
              Original budget: ${proposal.original_budget.toFixed(2)}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* New Budget */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Proposed Budget *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <span className="text-gray-500 text-sm font-medium">$</span>
              </div>
              <input
                type="number"
                step="0.01"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="0.00"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Current: ${proposal.budget.toFixed(2)}
            </p>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Estimated Duration (Optional)
            </label>
            <input
              type="text"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="e.g. 2 weeks, 1 month"
            />
            {proposal.duration && (
              <p className="text-xs text-gray-500 mt-1">
                Current: {proposal.duration}
              </p>
            )}
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Explanation *
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
              placeholder="Explain why you're proposing these changes..."
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Help the other party understand your reasoning
            </p>
          </div>

          {/* Negotiation Progress */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Negotiation Round {proposal.negotiation_count + 1} of 2</strong>
              <br />
              {isLastRound ?
                'After this counter-offer, the other party must accept or decline.' :
                'One more round of negotiation will be available after this.'
              }
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                'Submitting...'
              ) : (
                <>
                  <ArrowPathIcon className="w-5 h-5" />
                  Submit Counter-Offer
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
