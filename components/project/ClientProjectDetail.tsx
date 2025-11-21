'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import ProjectChat from '@/components/project/ProjectChat'
import ProjectFiles from '@/components/project/ProjectFiles'
import ProjectNotes from '@/components/project/ProjectNotes'
import { Button, Chip } from '@heroui/react'
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  ChatBubbleLeftRightIcon,
  FolderIcon,
  DocumentTextIcon,
  InformationCircleIcon,
  StarIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'

interface ClientProjectDetailProps {
  userName: string
  onSignOut: () => Promise<void>
  project: any
  acceptedProposal: any
  showPaymentSuccess: boolean
}

export default function ClientProjectDetail({
  userName,
  onSignOut,
  project,
  acceptedProposal,
  showPaymentSuccess
}: ClientProjectDetailProps) {
  const router = useRouter()
  const [selectedTab, setSelectedTab] = useState('overview')
  const [currentUserId, setCurrentUserId] = useState<string>('')
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [rating, setRating] = useState(0)
  const [review, setReview] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setCurrentUserId(user.id)
      }
    }
    fetchUser()
  }, [])

  const escrowAmount = project.escrow_amount || 0
  const platformFee = project.platform_fee_amount || 0
  const freelancerPayout = project.freelancer_payout_amount || 0

  const getStatusColor = () => {
    switch (project.status) {
      case 'in_progress': return 'bg-blue-500'
      case 'in_review': return 'bg-yellow-500'
      case 'completed': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = () => {
    switch (project.status) {
      case 'in_progress': return 'In Progress'
      case 'in_review': return 'In Review'
      case 'completed': return 'Completed'
      default: return project.status
    }
  }

  const handleMarkAsDone = () => {
    setShowReviewModal(true)
  }

  const handleSubmitReview = async () => {
    if (rating === 0) {
      alert('Please provide a rating before submitting')
      return
    }

    setSubmittingReview(true)
    try {
      const supabase = createClient()

      // Update project status to completed
      const { error: projectError } = await supabase
        .from('projects')
        .update({ status: 'completed' })
        .eq('id', project.id)

      if (projectError) throw projectError

      // Create review for the freelancer
      const { error: reviewError } = await supabase
        .from('reviews')
        .insert({
          project_id: project.id,
          reviewer_id: currentUserId,
          reviewee_id: project.freelancer_id,
          rating: rating,
          comment: review || null,
          reviewer_role: 'client'
        })

      if (reviewError) throw reviewError

      // Update freelancer's average rating
      const { data: freelancerReviews } = await supabase
        .from('reviews')
        .select('rating')
        .eq('reviewee_id', project.freelancer_id)
        .eq('reviewer_role', 'client')

      if (freelancerReviews && freelancerReviews.length > 0) {
        const avgRating = freelancerReviews.reduce((sum, r) => sum + r.rating, 0) / freelancerReviews.length
        const totalReviews = freelancerReviews.length

        await supabase
          .from('freelancer_profiles')
          .update({
            rating: Number(avgRating.toFixed(2)),
            total_reviews: totalReviews,
            completed_projects: (project.freelancer?.freelancer_profiles?.completed_projects || 0) + 1
          })
          .eq('id', project.freelancer_id)
      }

      setShowReviewModal(false)
      router.refresh()
    } catch (error) {
      console.error('Error submitting review:', error)
      alert('Failed to submit review. Please try again.')
    } finally {
      setSubmittingReview(false)
    }
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden fixed inset-0">
      {/* Left Panel - Main Content (60%) */}
      <div className="flex-1 flex flex-col h-full overflow-hidden" style={{ width: '60%' }}>
        {/* Top Header Bar */}
        <div className="bg-white border-b border-gray-200 shadow-sm flex-shrink-0 z-10">
          <div className="px-8 py-4">
            {/* Breadcrumbs & Actions */}
            <div className="flex items-center justify-between mb-3">
              <Button
                variant="light"
                size="sm"
                startContent={<ArrowLeftIcon className="w-4 h-4" />}
                onPress={() => router.push('/dashboard/client')}
                className="text-gray-600 hover:text-gray-900"
              >
                Back to Dashboard
              </Button>

              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${getStatusColor()}`} />
                <span className="text-sm font-medium text-gray-700">{getStatusText()}</span>
                {project.status === 'in_progress' && (
                  <Button
                    color="success"
                    size="sm"
                    onPress={handleMarkAsDone}
                    startContent={<CheckCircleIcon className="w-4 h-4" />}
                  >
                    Mark as Done
                  </Button>
                )}
              </div>
            </div>

            {/* Project Title */}
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{project.title}</h1>

            {/* Freelancer Info */}
            {project.freelancer && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Working with:</span>
                <span className="font-semibold text-gray-900">{project.freelancer.full_name}</span>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex border-t border-gray-100">
            {[
              { id: 'overview', label: 'Project Overview', icon: InformationCircleIcon },
              { id: 'files', label: 'Files', icon: FolderIcon },
              { id: 'notes', label: 'Notes', icon: DocumentTextIcon },
              { id: 'payment', label: 'Payment', icon: CheckCircleIcon }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-all ${
                    selectedTab === tab.id
                      ? 'border-emerald-600 text-emerald-600 bg-emerald-50'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-8">
          {/* Payment Success Banner */}
          {showPaymentSuccess && (
            <div className="mb-6 p-5 bg-green-50 border-2 border-green-200 rounded-xl shadow-sm">
              <div className="flex items-start gap-4">
                <CheckCircleIcon className="w-7 h-7 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-lg font-bold text-green-900 mb-1">Payment Successful!</h3>
                  <p className="text-sm text-green-700 leading-relaxed">
                    Your payment has been processed and secured in escrow. The freelancer has been notified and can now start working on your project.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Project Overview Tab */}
          {selectedTab === 'overview' && (
            <div className="space-y-6 max-w-4xl">
              {/* Project Description */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Project Description</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{project.description}</p>

                {/* Duration if available */}
                {project.duration && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm font-semibold text-gray-600 mb-1">Estimated Duration</p>
                    <p className="text-lg font-bold text-gray-900">{project.duration}</p>
                  </div>
                )}
              </div>

              {/* Proposal Details */}
              {acceptedProposal && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircleIcon className="w-6 h-6 text-green-600" />
                    <h2 className="text-lg font-bold text-gray-900">Accepted Proposal</h2>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-600 mb-2">Cover Letter</p>
                      <p className="text-gray-900 leading-relaxed whitespace-pre-wrap bg-gray-50 rounded-lg p-4">
                        {acceptedProposal.cover_letter}
                      </p>
                    </div>

                    {acceptedProposal.estimated_duration && (
                      <div className="pt-4 border-t border-gray-200">
                        <div className="bg-blue-50 rounded-lg p-4">
                          <p className="text-sm text-gray-600 mb-1">Estimated Duration</p>
                          <p className="text-xl font-bold text-gray-900">{acceptedProposal.estimated_duration}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Payment Tab */}
          {selectedTab === 'payment' && (
            <div className="space-y-6 max-w-4xl">
              {/* Escrow Breakdown */}
              <div className="bg-gradient-to-br from-green-50 to-green-50 rounded-xl shadow-sm border-2 border-green-200 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Payment Breakdown</h2>

                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-green-200">
                    <span className="text-gray-700 font-medium">Project Budget</span>
                    <span className="text-2xl font-bold text-gray-900">
                      ${escrowAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-3 border-b border-green-200">
                    <span className="text-gray-600">Platform Fee (5%)</span>
                    <span className="text-lg text-red-600">
                      -${platformFee.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-4 bg-white/70 rounded-lg px-4">
                    <span className="text-lg font-bold text-gray-900">Freelancer Receives</span>
                    <span className="text-3xl font-bold text-green-700">
                      ${freelancerPayout.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-900">
                    <strong>Escrow Protection:</strong> Your payment is held securely until work is completed and approved.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Files Tab */}
          {selectedTab === 'files' && currentUserId && (
            <div className="max-w-4xl">
              <ProjectFiles
                projectId={project.id}
                currentUserId={currentUserId}
                userRole="client"
              />
            </div>
          )}

          {/* Notes Tab */}
          {selectedTab === 'notes' && currentUserId && (
            <div className="max-w-4xl">
              <ProjectNotes
                projectId={project.id}
                currentUserId={currentUserId}
                userRole="client"
              />
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Chat (40%) */}
      <div className="bg-white border-l border-gray-200 shadow-xl flex flex-col h-full overflow-hidden" style={{ width: '40%' }}>
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-green-50 flex-shrink-0">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center">
              <ChatBubbleLeftRightIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Project Chat</h2>
              <p className="text-xs text-gray-600">Real-time messaging</p>
            </div>
          </div>

          {project.freelancer && (
            <div className="flex items-center gap-2 mt-3 p-2 bg-white rounded-lg shadow-sm">
              <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm font-bold">
                {project.freelancer.full_name?.charAt(0).toUpperCase() || 'F'}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{project.freelancer.full_name}</p>
                {project.escrow_status === 'verified_held' && project.freelancer.email ? (
                  <p className="text-xs text-gray-600">{project.freelancer.email}</p>
                ) : (
                  <p className="text-xs text-gray-500 italic">Email visible after payment</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Chat Content */}
        <div className="flex-1 flex flex-col overflow-y-auto overscroll-contain">
          {currentUserId && (
            <ProjectChat
              projectId={project.id}
              currentUserId={currentUserId}
              currentUserName={userName}
              userRole="client"
            />
          )}
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Review & Complete Project</h2>
              <p className="text-sm text-gray-600">
                Please rate your experience with {project.freelancer?.full_name}
              </p>
            </div>

            {/* Rating */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Rating <span className="text-red-600">*</span>
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    {star <= rating ? (
                      <StarIconSolid className="w-10 h-10 text-yellow-400" />
                    ) : (
                      <StarIcon className="w-10 h-10 text-gray-300" />
                    )}
                  </button>
                ))}
              </div>
              {rating === 0 && (
                <p className="text-xs text-red-600 mt-2">Rating is required</p>
              )}
            </div>

            {/* Review Comment */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Review (Optional)
              </label>
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                placeholder="Share your experience working with this freelancer..."
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowReviewModal(false)}
                disabled={submittingReview}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReview}
                disabled={submittingReview || rating === 0}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submittingReview ? 'Submitting...' : 'Submit & Complete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
