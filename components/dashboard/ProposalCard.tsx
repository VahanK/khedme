'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardBody, Chip, Button, Avatar, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/react'
import { ClockIcon, CurrencyDollarIcon, UserIcon, XMarkIcon, EnvelopeIcon, BriefcaseIcon, StarIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import NegotiationTimeline from '@/components/proposal/NegotiationTimeline'

interface ProposalCardProps {
  id: string
  projectTitle: string
  projectId: string
  projectDescription?: string
  freelancerName?: string
  freelancerId?: string
  freelancerSkills?: string[]
  freelancerRating?: number
  proposedBudget: number
  estimatedDuration?: string
  coverLetter: string
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn' | 'negotiating' | 'final_offer'
  createdAt: string
  delay?: number
  userRole: 'freelancer' | 'client'
  avatarUrl?: string
  clientName?: string
  clientCompany?: string
  clientAvatar?: string
  negotiationCount?: number
  originalBudget?: number
  negotiationHistory?: any[]
  onAccept?: () => Promise<void>
  onDecline?: () => Promise<void>
  onCounterOffer?: () => void
}

export default function ProposalCard({
  id,
  projectTitle,
  projectId,
  projectDescription,
  freelancerName,
  freelancerId,
  freelancerSkills,
  freelancerRating,
  proposedBudget,
  estimatedDuration,
  coverLetter,
  status,
  createdAt,
  delay = 0,
  userRole,
  avatarUrl,
  clientName,
  clientCompany,
  clientAvatar,
  negotiationCount = 0,
  originalBudget,
  negotiationHistory,
  onAccept,
  onDecline,
  onCounterOffer
}: ProposalCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAccepting, setIsAccepting] = useState(false)
  const [isDeclining, setIsDeclining] = useState(false)

  const statusConfig = {
    pending: {
      color: 'warning' as const,
      label: 'Pending',
      pillClass: 'bg-amber-100 text-amber-700 border border-amber-200'
    },
    negotiating: {
      color: 'primary' as const,
      label: `Negotiating (${negotiationCount}/2)`,
      pillClass: 'bg-blue-100 text-blue-700 border border-blue-200'
    },
    final_offer: {
      color: 'warning' as const,
      label: 'Final Offer',
      pillClass: 'bg-orange-100 text-orange-700 border border-orange-200'
    },
    accepted: {
      color: 'success' as const,
      label: 'Accepted',
      pillClass: 'bg-emerald-100 text-emerald-700 border border-emerald-200'
    },
    rejected: {
      color: 'danger' as const,
      label: 'Rejected',
      pillClass: 'bg-red-100 text-red-700 border border-red-200'
    },
    withdrawn: {
      color: 'default' as const,
      label: 'Withdrawn',
      pillClass: 'bg-gray-100 text-gray-700 border border-gray-200'
    }
  }

  const config = statusConfig[status]

  const handleAccept = async () => {
    if (!onAccept) return
    setIsAccepting(true)
    try {
      await onAccept()
      setIsModalOpen(false)
    } catch (error) {
      console.error('Error accepting proposal:', error)
    } finally {
      setIsAccepting(false)
    }
  }

  const handleDecline = async () => {
    if (!onDecline) return
    setIsDeclining(true)
    try {
      await onDecline()
      setIsModalOpen(false)
    } catch (error) {
      console.error('Error declining proposal:', error)
    } finally {
      setIsDeclining(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card className="bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-300 shadow-md rounded-2xl">
        <CardBody className="gap-4 p-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <Link
                href={`/dashboard/${userRole}/projects/${projectId}`}
                className="text-xl font-bold text-gray-900 hover:text-primary transition-colors line-clamp-1"
              >
                {projectTitle}
              </Link>

              {freelancerName && userRole === 'client' && (
                <div className="flex items-center gap-2 mt-3">
                  <Avatar
                    src={avatarUrl}
                    name={freelancerName}
                    size="sm"
                    className="w-8 h-8"
                  />
                  <span className="text-base font-semibold text-gray-800">
                    {freelancerName}
                  </span>
                  {freelancerRating !== undefined && freelancerRating > 0 && (
                    <div className="flex items-center gap-1 bg-yellow-50 px-2 py-0.5 rounded-full border border-yellow-200">
                      <StarIcon className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                      <span className="text-xs font-bold text-yellow-700">
                        {freelancerRating.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${config.pillClass}`}>
              {config.label}
            </span>
          </div>

          {/* Cover Letter Preview */}
          <p className="text-base text-gray-700 line-clamp-2 leading-relaxed">
            {coverLetter}
          </p>

          {/* Details */}
          <div className="flex flex-wrap gap-6 pt-2">
            <div className="flex items-center gap-2 text-base">
              <CurrencyDollarIcon className="w-5 h-5 text-emerald-600" />
              <span className="font-bold text-emerald-700">
                ${proposedBudget.toLocaleString()}
              </span>
            </div>

            {estimatedDuration && (
              <div className="flex items-center gap-2 text-base">
                <ClockIcon className="w-5 h-5 text-amber-600" />
                <span className="font-semibold text-gray-700">{estimatedDuration}</span>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>Submitted {new Date(createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Skills Preview (for client view) */}
          {userRole === 'client' && freelancerSkills && freelancerSkills.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200">
              {freelancerSkills.slice(0, 4).map((skill: string) => (
                <span
                  key={skill}
                  className="px-2.5 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-semibold"
                >
                  {skill}
                </span>
              ))}
              {freelancerSkills.length > 4 && (
                <span className="px-2.5 py-1 text-purple-700 text-xs font-bold">
                  +{freelancerSkills.length - 4} more
                </span>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-3 border-t border-gray-200">
            <Button
              size="md"
              variant="flat"
              color="primary"
              className="flex-1 font-semibold"
              onPress={() => setIsModalOpen(true)}
            >
              View Full Proposal
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Proposal Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        size="3xl"
        scrollBehavior="inside"
        classNames={{
          wrapper: "z-[100]",
          backdrop: "z-[99]",
        }}
        backdrop="blur"
        placement="center"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-2 border-b border-gray-200 pb-6 px-8 pt-6">
            <h2 className="text-3xl font-bold text-gray-900 leading-tight">Proposal Details</h2>
            <div className="flex items-center gap-3 mt-1">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${config.pillClass}`}>
                {config.label}
              </span>
              <span className="text-sm text-gray-500 font-medium">
                Submitted {new Date(createdAt).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>
          </ModalHeader>

          <ModalBody className="py-8 px-8">
            <div className="space-y-8">
              {/* Project Information */}
              <div className="bg-gradient-to-br from-blue-50 via-blue-50 to-cyan-50 rounded-2xl p-8 border-2 border-blue-200 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-base font-bold text-gray-600 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <BriefcaseIcon className="w-5 h-5 text-blue-600" />
                  Project
                </h3>
                <Link
                  href={`/dashboard/${userRole}/projects/${projectId}`}
                  className="text-2xl font-bold text-blue-700 hover:text-blue-800 transition-colors block mb-3"
                >
                  {projectTitle}
                </Link>
                {projectDescription && (
                  <p className="text-base text-gray-700 leading-relaxed">{projectDescription}</p>
                )}
              </div>

              {/* Client Information (for freelancers) */}
              {userRole === 'freelancer' && clientName && (
                <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl p-8 border-2 border-gray-200 shadow-sm">
                  <h3 className="text-base font-bold text-gray-600 uppercase tracking-wide mb-5">Client Information</h3>
                  <div className="flex items-center gap-5">
                    <Avatar
                      src={clientAvatar}
                      name={clientName}
                      size="lg"
                      className="w-20 h-20 text-lg border-2 border-white shadow-md"
                    />
                    <div>
                      <p className="font-bold text-gray-900 text-xl mb-1">{clientName}</p>
                      {clientCompany && (
                        <p className="text-base text-gray-600 font-medium">{clientCompany}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Freelancer Information (for clients) */}
              {userRole === 'client' && freelancerName && (
                <div className="bg-gradient-to-br from-purple-50 via-purple-50 to-pink-50 rounded-2xl p-8 border-2 border-purple-200 shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="text-base font-bold text-gray-600 uppercase tracking-wide mb-5">Freelancer Profile</h3>
                  <div className="flex items-start gap-5">
                    <Avatar
                      src={avatarUrl}
                      name={freelancerName}
                      size="lg"
                      className="w-20 h-20 text-lg border-2 border-white shadow-md"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="font-bold text-gray-900 text-xl">
                          {freelancerName}
                        </span>
                        {freelancerRating !== undefined && freelancerRating > 0 && (
                          <div className="flex items-center gap-1.5 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-200">
                            <StarIcon className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span className="text-sm font-bold text-yellow-700">
                              {freelancerRating.toFixed(1)}
                            </span>
                          </div>
                        )}
                      </div>
                      {freelancerSkills && freelancerSkills.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                          {freelancerSkills.slice(0, 5).map((skill: string) => (
                            <span
                              key={skill}
                              className="px-3 py-1.5 bg-purple-100 text-purple-800 rounded-lg text-sm font-semibold border border-purple-200"
                            >
                              {skill}
                            </span>
                          ))}
                          {freelancerSkills.length > 5 && (
                            <span className="px-3 py-1.5 text-purple-700 text-sm font-bold">
                              +{freelancerSkills.length - 5} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Proposal Details */}
              <div className="grid grid-cols-2 gap-5">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center gap-2 mb-3">
                    <CurrencyDollarIcon className="w-6 h-6 text-green-600" />
                    <span className="text-sm font-bold text-gray-600 uppercase tracking-wide">Budget</span>
                  </div>
                  <p className="text-3xl font-bold text-green-700">
                    ${proposedBudget.toLocaleString()}
                  </p>
                </div>

                {estimatedDuration && (
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border-2 border-amber-200 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center gap-2 mb-3">
                      <ClockIcon className="w-6 h-6 text-amber-600" />
                      <span className="text-sm font-bold text-gray-600 uppercase tracking-wide">Duration</span>
                    </div>
                    <p className="text-3xl font-bold text-amber-700">
                      {estimatedDuration}
                    </p>
                  </div>
                )}
              </div>

              {/* Cover Letter */}
              <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-2xl p-8 border-2 border-gray-200 shadow-sm">
                <h3 className="text-base font-bold text-gray-600 uppercase tracking-wide mb-5">Proposal Message</h3>
                <p className="text-base text-gray-800 whitespace-pre-wrap leading-relaxed">
                  {coverLetter}
                </p>
              </div>

              {/* Negotiation Timeline */}
              {negotiationHistory && negotiationHistory.length > 0 && (
                <NegotiationTimeline
                  negotiationHistory={negotiationHistory}
                  originalBudget={originalBudget}
                  currentBudget={proposedBudget}
                  negotiationCount={negotiationCount}
                  status={status}
                />
              )}
            </div>
          </ModalBody>

          <ModalFooter className="border-t border-gray-200 pt-6 pb-6 px-8 flex gap-4 bg-gray-50">
            {userRole === 'client' && (status === 'pending' || status === 'negotiating' || status === 'final_offer') && (
              <>
                <Button
                  color="success"
                  size="lg"
                  className="flex-1 font-bold text-base shadow-lg hover:shadow-xl transition-all"
                  onPress={handleAccept}
                  isLoading={isAccepting}
                  isDisabled={isAccepting || isDeclining}
                >
                  {!isAccepting && '✓ '}Accept {status === 'final_offer' ? 'Final Offer' : 'Proposal'}
                </Button>
                {negotiationCount < 2 && onCounterOffer && (
                  <Button
                    color="primary"
                    variant="flat"
                    size="lg"
                    className="flex-1 font-bold text-base border-2 border-primary"
                    onPress={() => {
                      setIsModalOpen(false)
                      onCounterOffer()
                    }}
                    isDisabled={isAccepting || isDeclining}
                  >
                    Counter Offer
                  </Button>
                )}
                <Button
                  color="danger"
                  variant="flat"
                  size="lg"
                  className="flex-1 font-bold text-base border-2 border-danger hover:bg-danger hover:text-white transition-all"
                  onPress={handleDecline}
                  isLoading={isDeclining}
                  isDisabled={isAccepting || isDeclining}
                >
                  {!isDeclining && '✗ '}Decline
                </Button>
              </>
            )}
            {(userRole !== 'client' || (status !== 'pending' && status !== 'negotiating' && status !== 'final_offer')) && (
              <Button
                color="default"
                variant="flat"
                size="lg"
                onPress={() => setIsModalOpen(false)}
                className="flex-1 font-semibold"
              >
                Close
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </motion.div>
  )
}
