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
  ChatBubbleLeftRightIcon,
  FolderIcon,
  DocumentTextIcon,
  UserCircleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

interface FreelancerProjectDetailProps {
  userName: string
  onSignOut: () => Promise<void>
  project: any
  acceptedProposal: any
}

export default function FreelancerProjectDetail({
  userName,
  onSignOut,
  project,
  acceptedProposal
}: FreelancerProjectDetailProps) {
  const router = useRouter()
  const [selectedTab, setSelectedTab] = useState('description')
  const [currentUserId, setCurrentUserId] = useState<string>('')

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
                onPress={() => router.push('/dashboard/freelancer')}
                className="text-gray-600 hover:text-gray-900"
              >
                Back to Dashboard
              </Button>

              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${getStatusColor()}`} />
                <span className="text-sm font-medium text-gray-700">{getStatusText()}</span>
              </div>
            </div>

            {/* Project Title */}
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{project.title}</h1>

            {/* Client Info */}
            {project.client && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Client:</span>
                <span className="font-semibold text-gray-900">{project.client.full_name}</span>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex border-t border-gray-100">
            {[
              { id: 'description', label: 'Project Details', icon: DocumentTextIcon },
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
                      ? 'border-purple-600 text-purple-600 bg-purple-50'
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
          {/* Project Description Tab */}
          {selectedTab === 'description' && (
            <div className="space-y-6 max-w-4xl">
              {/* Description Card */}
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

              {/* Your Proposal */}
              {acceptedProposal && (
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl shadow-sm border-2 border-purple-200 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircleIcon className="w-6 h-6 text-purple-600" />
                    <h2 className="text-lg font-bold text-gray-900">Your Accepted Proposal</h2>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-600 mb-2">Cover Letter</p>
                      <p className="text-gray-900 leading-relaxed whitespace-pre-wrap bg-white/50 rounded-lg p-4">
                        {acceptedProposal.cover_letter}
                      </p>
                    </div>

                    {acceptedProposal.estimated_duration && (
                      <div className="pt-4 border-t border-gray-200">
                        <div className="bg-white/70 rounded-lg p-4">
                          <p className="text-sm text-gray-600 mb-1">Duration</p>
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
              {/* Earnings Breakdown */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-50 rounded-xl shadow-sm border-2 border-purple-200 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Your Earnings</h2>

                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-purple-200">
                    <span className="text-gray-700 font-medium">Project Budget</span>
                    <span className="text-2xl font-bold text-gray-900">
                      ${escrowAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-3 border-b border-purple-200">
                    <span className="text-gray-600">Platform Fee (5%)</span>
                    <span className="text-lg text-red-600">
                      -${(escrowAmount * 0.05).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-4 bg-white/70 rounded-lg px-4">
                    <span className="text-lg font-bold text-gray-900">You Will Receive</span>
                    <span className="text-3xl font-bold text-purple-700">
                      ${freelancerPayout.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-900">
                    <strong>Escrow Protection:</strong> Payment is secured and will be released to you upon project completion and approval.
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
                userRole="freelancer"
              />
            </div>
          )}

          {/* Notes Tab */}
          {selectedTab === 'notes' && currentUserId && (
            <div className="max-w-4xl">
              <ProjectNotes
                projectId={project.id}
                currentUserId={currentUserId}
                userRole="freelancer"
              />
            </div>
          )}

        </div>
      </div>

      {/* Right Panel - Chat (40%) */}
      <div className="bg-white border-l border-gray-200 shadow-xl flex flex-col h-full overflow-hidden" style={{ width: '40%' }}>
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50 flex-shrink-0">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
              <ChatBubbleLeftRightIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Project Chat</h2>
              <p className="text-xs text-gray-600">Real-time messaging</p>
            </div>
          </div>

          {project.client && (
            <div className="flex items-center gap-2 mt-3 p-2 bg-white rounded-lg shadow-sm">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
                {project.client.full_name?.charAt(0).toUpperCase() || 'C'}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{project.client.full_name}</p>
                {project.escrow_status === 'verified_held' ? (
                  <p className="text-xs text-gray-600">{project.client.email}</p>
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
              userRole="freelancer"
            />
          )}
        </div>
      </div>
    </div>
  )
}
