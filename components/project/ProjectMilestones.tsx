'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button, Input, Textarea, Spinner, Card, CardBody, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/react'
import {
  PlusIcon,
  CheckCircleIcon,
  ClockIcon,
  RocketLaunchIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

interface ProjectMilestone {
  id: string
  project_id: string
  title: string
  description: string
  status: 'pending' | 'in_progress' | 'completed' | 'approved'
  due_date: string | null
  completed_at: string | null
  approved_at: string | null
  created_by: string
  created_at: string
  updated_at: string
  creator?: {
    full_name: string
  }
}

interface ProjectMilestonesProps {
  projectId: string
  currentUserId: string
  userRole: 'client' | 'freelancer'
}

export default function ProjectMilestones({
  projectId,
  currentUserId,
  userRole
}: ProjectMilestonesProps) {
  const [milestones, setMilestones] = useState<ProjectMilestone[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: ''
  })
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  // Fetch milestones
  useEffect(() => {
    const fetchMilestones = async () => {
      const { data, error } = await supabase
        .from('project_milestones')
        .select(`
          *,
          creator:profiles!created_by (
            full_name
          )
        `)
        .eq('project_id', projectId)
        .order('due_date', { ascending: true, nullsFirst: false })

      if (error) {
        console.error('Error fetching milestones:', error)
      } else {
        setMilestones(data || [])
      }
      setLoading(false)
    }

    fetchMilestones()
  }, [projectId])

  const handleOpenModal = () => {
    setFormData({ title: '', description: '', due_date: '' })
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setFormData({ title: '', description: '', due_date: '' })
  }

  const handleCreateMilestone = async () => {
    if (!formData.title.trim()) {
      alert('Please enter a title')
      return
    }

    setSaving(true)

    try {
      const { data, error } = await supabase
        .from('project_milestones')
        .insert({
          project_id: projectId,
          created_by: currentUserId,
          title: formData.title.trim(),
          description: formData.description.trim(),
          due_date: formData.due_date || null,
          status: 'pending'
        })
        .select(`
          *,
          creator:profiles!created_by (
            full_name
          )
        `)
        .single()

      if (error) throw error

      // Add to list
      setMilestones([...milestones, data])
      handleCloseModal()
    } catch (error) {
      console.error('Error creating milestone:', error)
      alert('Failed to create milestone. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateStatus = async (
    milestoneId: string,
    newStatus: 'pending' | 'in_progress' | 'completed' | 'approved'
  ) => {
    try {
      const updateData: any = {
        status: newStatus,
        updated_at: new Date().toISOString()
      }

      // Set timestamps based on status
      if (newStatus === 'completed' && userRole === 'freelancer') {
        updateData.completed_at = new Date().toISOString()
      } else if (newStatus === 'approved' && userRole === 'client') {
        updateData.approved_at = new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('project_milestones')
        .update(updateData)
        .eq('id', milestoneId)
        .select(`
          *,
          creator:profiles!created_by (
            full_name
          )
        `)
        .single()

      if (error) throw error

      // Update in list
      setMilestones(milestones.map(m => m.id === milestoneId ? data : m))
    } catch (error) {
      console.error('Error updating milestone:', error)
      alert('Failed to update milestone. Please try again.')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-100 text-gray-700 border-gray-300'
      case 'in_progress':
        return 'bg-blue-100 text-blue-700 border-blue-300'
      case 'completed':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300'
      case 'approved':
        return 'bg-green-100 text-green-700 border-green-300'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="w-5 h-5" />
      case 'in_progress':
        return <RocketLaunchIcon className="w-5 h-5" />
      case 'completed':
      case 'approved':
        return <CheckCircleIcon className="w-5 h-5" />
      default:
        return <ClockIcon className="w-5 h-5" />
    }
  }

  const formatDate = (timestamp: string | null) => {
    if (!timestamp) return 'No deadline'
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const isOverdue = (dueDate: string | null, status: string) => {
    if (!dueDate || status === 'completed' || status === 'approved') return false
    return new Date(dueDate) < new Date()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" color="primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Project Milestones</h3>
          <p className="text-sm text-gray-600">Track deliverables and project progress</p>
        </div>
        <Button
          color="primary"
          startContent={<PlusIcon className="w-5 h-5" />}
          onPress={handleOpenModal}
        >
          New Milestone
        </Button>
      </div>

      {/* Progress Summary */}
      {milestones.length > 0 && (
        <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200">
          <CardBody className="p-5">
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {milestones.filter(m => m.status === 'pending').length}
                </p>
                <p className="text-xs text-gray-600 mt-1">Pending</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-700">
                  {milestones.filter(m => m.status === 'in_progress').length}
                </p>
                <p className="text-xs text-gray-600 mt-1">In Progress</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-700">
                  {milestones.filter(m => m.status === 'completed').length}
                </p>
                <p className="text-xs text-gray-600 mt-1">Completed</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-700">
                  {milestones.filter(m => m.status === 'approved').length}
                </p>
                <p className="text-xs text-gray-600 mt-1">Approved</p>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Milestones List */}
      {milestones.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <RocketLaunchIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">No milestones yet</p>
          <p className="text-sm mt-2">Create milestones to track project deliverables</p>
        </div>
      ) : (
        <div className="space-y-4">
          {milestones.map((milestone) => {
            const overdue = isOverdue(milestone.due_date, milestone.status)
            return (
              <Card
                key={milestone.id}
                className={`shadow-sm hover:shadow-md transition-shadow ${
                  overdue ? 'border-2 border-red-300' : ''
                }`}
              >
                <CardBody className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-bold text-gray-900">{milestone.title}</h4>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border-2 flex items-center gap-1 ${getStatusColor(milestone.status)}`}>
                          {getStatusIcon(milestone.status)}
                          {milestone.status.replace('_', ' ')}
                        </span>
                        {overdue && (
                          <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold">
                            Overdue
                          </span>
                        )}
                      </div>
                      {milestone.description && (
                        <p className="text-sm text-gray-700 mb-3 whitespace-pre-wrap">
                          {milestone.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-600">
                        <span>Due: {formatDate(milestone.due_date)}</span>
                        {milestone.completed_at && (
                          <span>Completed: {formatDate(milestone.completed_at)}</span>
                        )}
                        {milestone.approved_at && (
                          <span>Approved: {formatDate(milestone.approved_at)}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-3 border-t border-gray-200">
                    {userRole === 'freelancer' && (
                      <>
                        {milestone.status === 'pending' && (
                          <Button
                            size="sm"
                            color="primary"
                            variant="flat"
                            onPress={() => handleUpdateStatus(milestone.id, 'in_progress')}
                          >
                            Start Work
                          </Button>
                        )}
                        {milestone.status === 'in_progress' && (
                          <Button
                            size="sm"
                            color="success"
                            variant="flat"
                            onPress={() => handleUpdateStatus(milestone.id, 'completed')}
                          >
                            Mark as Completed
                          </Button>
                        )}
                      </>
                    )}
                    {userRole === 'client' && milestone.status === 'completed' && (
                      <>
                        <Button
                          size="sm"
                          color="success"
                          variant="flat"
                          onPress={() => handleUpdateStatus(milestone.id, 'approved')}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          color="warning"
                          variant="flat"
                          onPress={() => handleUpdateStatus(milestone.id, 'in_progress')}
                        >
                          Request Changes
                        </Button>
                      </>
                    )}
                  </div>
                </CardBody>
              </Card>
            )
          })}
        </div>
      )}

      {/* Create Milestone Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        size="2xl"
        placement="center"
      >
        <ModalContent>
          <ModalHeader>
            <h3 className="text-xl font-bold">Create New Milestone</h3>
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                label="Title"
                placeholder="Enter milestone title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                size="lg"
                variant="bordered"
                isRequired
              />
              <Textarea
                label="Description"
                placeholder="Describe what needs to be delivered..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                minRows={4}
                size="lg"
                variant="bordered"
              />
              <Input
                type="date"
                label="Due Date (Optional)"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                size="lg"
                variant="bordered"
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="light"
              onPress={handleCloseModal}
              isDisabled={saving}
            >
              Cancel
            </Button>
            <Button
              color="primary"
              onPress={handleCreateMilestone}
              isLoading={saving}
              isDisabled={!formData.title.trim() || saving}
            >
              {saving ? 'Creating...' : 'Create Milestone'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}
