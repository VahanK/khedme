'use client'

import { useState } from 'react'
import { Button, Card, CardBody, CardHeader, Image } from '@heroui/react'
import { Upload, FileText, X, Check } from 'lucide-react'

interface PaymentProofUploaderProps {
  projectId: string
  escrowAmount: number
  onUploadComplete?: (fileUrl: string) => void
}

export default function PaymentProofUploader({
  projectId,
  escrowAmount,
  onUploadComplete,
}: PaymentProofUploaderProps) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
    if (!allowedTypes.includes(selectedFile.type)) {
      setError('Please upload an image (JPG, PNG, GIF, WebP) or PDF file')
      return
    }

    // Validate file size (10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB')
      return
    }

    setFile(selectedFile)
    setError(null)

    // Create preview for images
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(selectedFile)
    } else {
      setPreview(null)
    }
  }

  const handleRemoveFile = () => {
    setFile(null)
    setPreview(null)
    setError(null)
  }

  const handleSubmit = async () => {
    if (!file) return

    setUploading(true)
    setError(null)

    try {
      // Upload file
      const formData = new FormData()
      formData.append('file', file)
      formData.append('projectId', projectId)

      const uploadResponse = await fetch('/api/escrow/upload-proof', {
        method: 'POST',
        body: formData,
      })

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const { fileUrl } = await uploadResponse.json()

      // Submit payment proof
      const submitResponse = await fetch('/api/escrow/submit-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          paymentProofUrl: fileUrl,
          amount: escrowAmount,
        }),
      })

      if (!submitResponse.ok) {
        const errorData = await submitResponse.json()
        throw new Error(errorData.error || 'Failed to submit payment proof')
      }

      setSubmitted(true)
      if (onUploadComplete) {
        onUploadComplete(fileUrl)
      }
    } catch (err: any) {
      console.error('Error submitting payment proof:', err)
      setError(err.message || 'Failed to submit payment proof')
    } finally {
      setUploading(false)
    }
  }

  if (submitted) {
    return (
      <Card className="border-2 border-success">
        <CardBody className="text-center py-8">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center">
              <Check className="w-8 h-8 text-success" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Payment Proof Submitted!</h3>
              <p className="text-default-500">
                Your payment proof is pending verification by our admin team. You will be notified once it's verified
                and the escrow is activated.
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div>
          <h3 className="text-lg font-semibold">Submit Payment Proof</h3>
          <p className="text-sm text-default-500">
            Upload proof of payment for ${escrowAmount.toFixed(2)} to activate escrow protection
          </p>
        </div>
      </CardHeader>
      <CardBody className="gap-4">
        {/* File Input */}
        {!file && (
          <div className="border-2 border-dashed border-default-300 rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
            <label htmlFor="payment-proof-upload" className="cursor-pointer">
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Upload className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Click to upload payment receipt</p>
                  <p className="text-sm text-default-500 mt-1">
                    Images (JPG, PNG, GIF, WebP) or PDF up to 10MB
                  </p>
                </div>
              </div>
              <input
                id="payment-proof-upload"
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={handleFileSelect}
              />
            </label>
          </div>
        )}

        {/* File Preview */}
        {file && (
          <div className="border-2 border-primary rounded-lg p-4">
            <div className="flex items-start gap-4">
              {preview ? (
                <Image src={preview} alt="Payment proof preview" className="w-24 h-24 object-cover rounded" />
              ) : (
                <div className="w-24 h-24 bg-default-100 rounded flex items-center justify-center">
                  <FileText className="w-8 h-8 text-default-400" />
                </div>
              )}
              <div className="flex-1">
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-default-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <Button
                isIconOnly
                size="sm"
                variant="light"
                color="danger"
                onClick={handleRemoveFile}
                disabled={uploading}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-danger/10 border border-danger rounded-lg p-3 text-danger text-sm">
            {error}
          </div>
        )}

        {/* Submit Button */}
        {file && (
          <div className="bg-default-100 rounded-lg p-4">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-warning/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-warning text-sm font-bold">!</span>
              </div>
              <div className="text-sm text-default-600">
                <p className="font-medium mb-1">Important:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Make sure the payment proof clearly shows the amount (${escrowAmount.toFixed(2)})</li>
                  <li>Payment should be made to the official Khedme account</li>
                  <li>Once verified, funds will be held securely in escrow</li>
                </ul>
              </div>
            </div>
            <Button
              color="primary"
              fullWidth
              size="lg"
              onClick={handleSubmit}
              isLoading={uploading}
              disabled={!file || uploading}
            >
              {uploading ? 'Submitting...' : 'Submit Payment Proof'}
            </Button>
          </div>
        )}
      </CardBody>
    </Card>
  )
}
