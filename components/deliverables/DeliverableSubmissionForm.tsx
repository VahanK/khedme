'use client'

import { useState, useEffect } from 'react'
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Textarea,
  Select,
  SelectItem,
  Divider,
} from '@heroui/react'
import { Upload, FileCheck, AlertCircle } from 'lucide-react'
import { ProjectFile } from '@/types/database.types'

interface DeliverableSubmissionFormProps {
  projectId: string
  projectFiles: ProjectFile[]
  onSubmitSuccess?: () => void
}

export default function DeliverableSubmissionForm({
  projectId,
  projectFiles,
  onSubmitSuccess,
}: DeliverableSubmissionFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [selectedFileId, setSelectedFileId] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError('Please enter a title for your deliverable')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/deliverables/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          fileId: selectedFileId || undefined,
          title,
          description,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit deliverable')
      }

      setSuccess(true)
      setTitle('')
      setDescription('')
      setSelectedFileId('')

      if (onSubmitSuccess) {
        onSubmitSuccess()
      }

      // Reset success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      console.error('Error submitting deliverable:', err)
      setError(err.message || 'Failed to submit deliverable')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
            <FileCheck className="w-5 h-5 text-success" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Submit Deliverable</h3>
            <p className="text-sm text-default-500">Mark your work as complete for client review</p>
          </div>
        </div>
      </CardHeader>
      <CardBody className="gap-4">
        {/* Title */}
        <Input
          label="Deliverable Title"
          placeholder="e.g., Final Logo Design, Completed Website, Video Edit"
          value={title}
          onValueChange={setTitle}
          isRequired
          variant="bordered"
        />

        {/* Description */}
        <Textarea
          label="Description (optional)"
          placeholder="Add notes about what you've completed, any special instructions, or things the client should review..."
          value={description}
          onValueChange={setDescription}
          variant="bordered"
          minRows={3}
        />

        {/* File Selection */}
        <Select
          label="Attach File (optional)"
          placeholder="Select a file from your uploads"
          selectedKeys={selectedFileId ? [selectedFileId] : []}
          onChange={(e) => setSelectedFileId(e.target.value)}
          variant="bordered"
        >
          {projectFiles.length === 0 ? (
            <SelectItem key="no-files">
              No files uploaded yet
            </SelectItem>
          ) : (
            projectFiles.map((file) => (
              <SelectItem key={file.id}>
                {file.file_name}
              </SelectItem>
            ))
          )}
        </Select>

        <Divider />

        {/* Info Box */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
          <div className="flex gap-2">
            <AlertCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
            <div className="text-sm text-default-700">
              <p className="font-medium text-primary mb-1">What happens next?</p>
              <ul className="list-disc list-inside space-y-0.5">
                <li>Project status changes to "In Review"</li>
                <li>Client receives notification to review your work</li>
                <li>Client can approve or request revisions</li>
                <li>Once approved, payment will be released</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-danger/10 border border-danger rounded-lg p-3 text-danger text-sm">
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-success/10 border border-success rounded-lg p-3 text-success text-sm">
            ✓ Deliverable submitted successfully! The client has been notified.
          </div>
        )}

        {/* Submit Button */}
        <Button
          color="success"
          size="lg"
          fullWidth
          startContent={<Upload className="w-5 h-5" />}
          onClick={handleSubmit}
          isLoading={submitting}
          isDisabled={!title.trim() || submitting}
        >
          {submitting ? 'Submitting...' : 'Submit Deliverable for Review'}
        </Button>
      </CardBody>
    </Card>
  )
}
