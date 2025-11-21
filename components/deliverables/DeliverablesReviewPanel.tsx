'use client'

import { useState, useEffect } from 'react'
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Chip,
  Textarea,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Divider,
  Spinner,
} from '@heroui/react'
import { CheckCircle, XCircle, AlertCircle, FileCheck, Eye, MessageSquare } from 'lucide-react'
import { DeliverableWithDetails } from '@/types/database.types'

interface DeliverablesReviewPanelProps {
  projectId: string
  onReviewComplete?: () => void
}

export default function DeliverablesReviewPanel({
  projectId,
  onReviewComplete,
}: DeliverablesReviewPanelProps) {
  const [deliverables, setDeliverables] = useState<DeliverableWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDeliverable, setSelectedDeliverable] = useState<DeliverableWithDetails | null>(null)
  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [revisionNotes, setRevisionNotes] = useState('')
  const [reviewAction, setReviewAction] = useState<'approve' | 'revision' | 'reject' | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchDeliverables()
  }, [projectId])

  const fetchDeliverables = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/deliverables/${projectId}`)

      if (!response.ok) {
        throw new Error('Failed to fetch deliverables')
      }

      const data = await response.json()
      setDeliverables(data.deliverables || [])
    } catch (error) {
      console.error('Error fetching deliverables:', error)
    } finally {
      setLoading(false)
    }
  }

  const openReviewModal = (deliverable: DeliverableWithDetails, action: 'approve' | 'revision' | 'reject') => {
    setSelectedDeliverable(deliverable)
    setReviewAction(action)
    setRevisionNotes('')
    setReviewModalOpen(true)
  }

  const closeReviewModal = () => {
    setReviewModalOpen(false)
    setSelectedDeliverable(null)
    setReviewAction(null)
    setRevisionNotes('')
  }

  const handleReview = async () => {
    if (!selectedDeliverable || !reviewAction) return

    if (reviewAction === 'revision' && !revisionNotes.trim()) {
      alert('Please provide notes for the revision request')
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch('/api/deliverables/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deliverableId: selectedDeliverable.id,
          status: reviewAction === 'approve' ? 'approved' : reviewAction === 'revision' ? 'needs_revision' : 'rejected',
          notes: revisionNotes || undefined,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to review deliverable')
      }

      alert(`Deliverable ${reviewAction === 'approve' ? 'approved' : reviewAction === 'revision' ? 'revision requested' : 'rejected'} successfully!`)
      closeReviewModal()
      fetchDeliverables()

      if (onReviewComplete) {
        onReviewComplete()
      }
    } catch (error: any) {
      console.error('Error reviewing deliverable:', error)
      alert(error.message || 'Failed to review deliverable')
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'warning'
      case 'under_review':
        return 'primary'
      case 'needs_revision':
        return 'warning'
      case 'approved':
        return 'success'
      case 'rejected':
        return 'danger'
      default:
        return 'default'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'Awaiting Review'
      case 'under_review':
        return 'Under Review'
      case 'needs_revision':
        return 'Needs Revision'
      case 'approved':
        return 'Approved'
      case 'rejected':
        return 'Rejected'
      default:
        return status
    }
  }

  if (loading) {
    return (
      <Card>
        <CardBody className="flex items-center justify-center py-8">
          <Spinner size="lg" />
          <p className="text-default-500 mt-4">Loading deliverables...</p>
        </CardBody>
      </Card>
    )
  }

  if (deliverables.length === 0) {
    return (
      <Card>
        <CardBody className="text-center py-8">
          <FileCheck className="w-12 h-12 mx-auto mb-3 text-default-300" />
          <h3 className="text-lg font-semibold mb-2">No Deliverables Submitted</h3>
          <p className="text-default-500">
            The freelancer hasn't submitted any deliverables yet. They will appear here when submitted.
          </p>
        </CardBody>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Deliverables ({deliverables.length})</h3>
      </div>

      {deliverables.map((deliverable) => (
        <Card key={deliverable.id}>
          <CardBody className="gap-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="font-semibold text-lg">{deliverable.title}</h4>
                  <Chip color={getStatusColor(deliverable.status)} size="sm" variant="flat">
                    {getStatusLabel(deliverable.status)}
                  </Chip>
                  <Chip size="sm" variant="flat">
                    Rev. {deliverable.revision_number}
                  </Chip>
                </div>

                {deliverable.description && (
                  <p className="text-sm text-default-600 mb-3">{deliverable.description}</p>
                )}

                <div className="text-xs text-default-500">
                  Submitted by {deliverable.submitter?.full_name} on{' '}
                  {new Date(deliverable.submitted_at).toLocaleDateString()} at{' '}
                  {new Date(deliverable.submitted_at).toLocaleTimeString()}
                </div>

                {deliverable.file && (
                  <div className="mt-3 p-3 bg-default-100 rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">{deliverable.file.file_name}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {deliverable.revisions && deliverable.revisions.length > 0 && (
              <>
                <Divider />
                <div>
                  <p className="text-sm font-medium mb-2">Revision History</p>
                  <div className="space-y-2">
                    {deliverable.revisions.map((revision) => (
                      <div key={revision.id} className="bg-warning/10 border border-warning/20 rounded-lg p-3 text-sm">
                        <div className="flex items-start gap-2">
                          <MessageSquare className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="font-medium text-warning mb-1">Revision Requested</p>
                            <p className="text-default-700">{revision.revision_notes}</p>
                            <p className="text-xs text-default-500 mt-1">
                              {new Date(revision.created_at).toLocaleDateString()}
                              {revision.status === 'completed' && ' - Completed'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {deliverable.status === 'submitted' && (
              <>
                <Divider />
                <div className="flex gap-2">
                  <Button
                    color="success"
                    startContent={<CheckCircle className="w-4 h-4" />}
                    onClick={() => openReviewModal(deliverable, 'approve')}
                  >
                    Approve
                  </Button>
                  <Button
                    color="warning"
                    variant="flat"
                    startContent={<AlertCircle className="w-4 h-4" />}
                    onClick={() => openReviewModal(deliverable, 'revision')}
                  >
                    Request Revision
                  </Button>
                  <Button
                    color="danger"
                    variant="light"
                    startContent={<XCircle className="w-4 h-4" />}
                    onClick={() => openReviewModal(deliverable, 'reject')}
                  >
                    Reject
                  </Button>
                </div>
              </>
            )}

            {deliverable.status === 'approved' && deliverable.reviewed_at && (
              <div className="bg-success/10 border border-success/20 rounded-lg p-3 text-sm">
                <div className="flex items-center gap-2 text-success">
                  <CheckCircle className="w-4 h-4" />
                  <span className="font-medium">
                    Approved on {new Date(deliverable.reviewed_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      ))}

      {/* Review Modal */}
      <Modal isOpen={reviewModalOpen} onClose={closeReviewModal} size="lg">
        <ModalContent>
          <ModalHeader>
            {reviewAction === 'approve' && 'Approve Deliverable'}
            {reviewAction === 'revision' && 'Request Revision'}
            {reviewAction === 'reject' && 'Reject Deliverable'}
          </ModalHeader>
          <ModalBody>
            {selectedDeliverable && (
              <div className="space-y-4">
                <div className="bg-default-100 rounded-lg p-3">
                  <p className="text-sm text-default-600 mb-1">Deliverable:</p>
                  <p className="font-medium">{selectedDeliverable.title}</p>
                </div>

                {reviewAction === 'approve' && (
                  <div className="bg-success/10 border border-success/20 rounded-lg p-3">
                    <div className="flex gap-2">
                      <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                      <div className="text-sm">
                        <p className="font-medium text-success mb-1">Approve this deliverable?</p>
                        <p className="text-default-700">
                          This will mark the work as complete and allow you to request payment release from the admin.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {reviewAction === 'revision' && (
                  <Textarea
                    label="Revision Notes"
                    placeholder="Explain what needs to be changed or improved..."
                    value={revisionNotes}
                    onValueChange={setRevisionNotes}
                    minRows={4}
                    isRequired
                  />
                )}

                {reviewAction === 'reject' && (
                  <>
                    <div className="bg-danger/10 border border-danger/20 rounded-lg p-3">
                      <div className="flex gap-2">
                        <XCircle className="w-5 h-5 text-danger flex-shrink-0" />
                        <div className="text-sm">
                          <p className="font-medium text-danger mb-1">Reject this deliverable?</p>
                          <p className="text-default-700">
                            This action indicates the work does not meet requirements. Consider requesting a revision instead.
                          </p>
                        </div>
                      </div>
                    </div>
                    <Textarea
                      label="Rejection Reason (optional)"
                      placeholder="Explain why you're rejecting this deliverable..."
                      value={revisionNotes}
                      onValueChange={setRevisionNotes}
                      minRows={3}
                    />
                  </>
                )}
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={closeReviewModal} disabled={submitting}>
              Cancel
            </Button>
            <Button
              color={reviewAction === 'approve' ? 'success' : reviewAction === 'revision' ? 'warning' : 'danger'}
              onPress={handleReview}
              isLoading={submitting}
            >
              {reviewAction === 'approve' && 'Approve Deliverable'}
              {reviewAction === 'revision' && 'Request Revision'}
              {reviewAction === 'reject' && 'Reject Deliverable'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}
