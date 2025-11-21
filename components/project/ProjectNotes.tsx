'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button, Input, Textarea, Spinner, Card, CardBody, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/react'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'

interface ProjectNote {
  id: string
  project_id: string
  created_by: string
  title: string
  content: string
  created_at: string
  updated_at: string
  creator?: {
    full_name: string
  }
}

interface ProjectNotesProps {
  projectId: string
  currentUserId: string
  userRole: 'client' | 'freelancer'
}

export default function ProjectNotes({
  projectId,
  currentUserId,
  userRole
}: ProjectNotesProps) {
  const [notes, setNotes] = useState<ProjectNote[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<ProjectNote | null>(null)
  const [formData, setFormData] = useState({ title: '', content: '' })
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  // Fetch notes
  useEffect(() => {
    const fetchNotes = async () => {
      const { data, error } = await supabase
        .from('project_notes')
        .select(`
          *,
          creator:profiles!created_by (
            full_name
          )
        `)
        .eq('project_id', projectId)
        .order('updated_at', { ascending: false })

      if (error) {
        console.error('Error fetching notes:', error)
      } else {
        setNotes(data || [])
      }
      setLoading(false)
    }

    fetchNotes()
  }, [projectId])

  const handleOpenModal = (note?: ProjectNote) => {
    if (note) {
      setEditingNote(note)
      setFormData({ title: note.title, content: note.content || '' })
    } else {
      setEditingNote(null)
      setFormData({ title: '', content: '' })
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingNote(null)
    setFormData({ title: '', content: '' })
  }

  const handleSaveNote = async () => {
    if (!formData.title.trim()) {
      alert('Please enter a title')
      return
    }

    setSaving(true)

    try {
      if (editingNote) {
        // Update existing note
        const { data, error } = await supabase
          .from('project_notes')
          .update({
            title: formData.title.trim(),
            content: formData.content.trim(),
            updated_at: new Date().toISOString()
          })
          .eq('id', editingNote.id)
          .select(`
            *,
            creator:profiles!created_by (
              full_name
            )
          `)
          .single()

        if (error) throw error

        // Update in list
        setNotes(notes.map(n => n.id === editingNote.id ? data : n))
      } else {
        // Create new note
        const { data, error } = await supabase
          .from('project_notes')
          .insert({
            project_id: projectId,
            created_by: currentUserId,
            title: formData.title.trim(),
            content: formData.content.trim()
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
        setNotes([data, ...notes])
      }

      handleCloseModal()
    } catch (error) {
      console.error('Error saving note:', error)
      alert('Failed to save note. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return

    try {
      const { error } = await supabase
        .from('project_notes')
        .delete()
        .eq('id', noteId)

      if (error) throw error

      // Remove from list
      setNotes(notes.filter(n => n.id !== noteId))
    } catch (error) {
      console.error('Error deleting note:', error)
      alert('Failed to delete note. Please try again.')
    }
  }

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
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
          <h3 className="text-lg font-bold text-gray-900">Project Notes</h3>
          <p className="text-sm text-gray-600">Shared notes and documentation</p>
        </div>
        <Button
          color="primary"
          startContent={<PlusIcon className="w-5 h-5" />}
          onPress={() => handleOpenModal()}
        >
          New Note
        </Button>
      </div>

      {/* Notes List */}
      {notes.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <DocumentTextIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">No notes yet</p>
          <p className="text-sm mt-2">Create your first note to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {notes.map((note) => {
            const isOwner = note.created_by === currentUserId
            return (
              <Card key={note.id} className="shadow-sm hover:shadow-md transition-shadow">
                <CardBody className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="text-lg font-bold text-gray-900 flex-1">{note.title}</h4>
                    <div className="flex gap-2 ml-2">
                      <Button
                        size="sm"
                        variant="flat"
                        color="primary"
                        isIconOnly
                        onPress={() => handleOpenModal(note)}
                      >
                        <PencilIcon className="w-4 h-4" />
                      </Button>
                      {isOwner && (
                        <Button
                          size="sm"
                          variant="flat"
                          color="danger"
                          isIconOnly
                          onPress={() => handleDeleteNote(note.id)}
                        >
                          <TrashIcon className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  {note.content && (
                    <p className="text-sm text-gray-700 mb-3 whitespace-pre-wrap line-clamp-4">
                      {note.content}
                    </p>
                  )}
                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-600">
                      Created by {note.creator?.full_name || 'Unknown'}
                    </p>
                    <p className="text-xs text-gray-500">
                      Last updated: {formatDate(note.updated_at)}
                    </p>
                  </div>
                </CardBody>
              </Card>
            )
          })}
        </div>
      )}

      {/* Note Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        size="2xl"
        placement="center"
      >
        <ModalContent>
          <ModalHeader>
            <h3 className="text-xl font-bold">
              {editingNote ? 'Edit Note' : 'Create New Note'}
            </h3>
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                label="Title"
                placeholder="Enter note title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                size="lg"
                variant="bordered"
                isRequired
              />
              <Textarea
                label="Content"
                placeholder="Enter note content..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                minRows={8}
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
              onPress={handleSaveNote}
              isLoading={saving}
              isDisabled={!formData.title.trim() || saving}
            >
              {saving ? 'Saving...' : (editingNote ? 'Update Note' : 'Create Note')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}
