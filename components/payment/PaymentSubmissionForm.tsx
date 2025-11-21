'use client'

import { useState } from 'react'
import { Card, CardHeader, CardBody, Button, Input, Textarea } from '@heroui/react'
import { CloudArrowUpIcon } from '@heroicons/react/24/outline'

interface PaymentSubmissionFormProps {
  onSubmit: (formData: FormData) => Promise<void>
}

export default function PaymentSubmissionForm({ onSubmit }: PaymentSubmissionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [paymentProofUrl, setPaymentProofUrl] = useState('')
  const [transactionId, setTransactionId] = useState('')
  const [notes, setNotes] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append('payment_proof_url', paymentProofUrl)
      formData.append('transaction_id', transactionId)
      formData.append('notes', notes)

      await onSubmit(formData)
    } catch (error) {
      console.error('Error submitting payment:', error)
      alert('Failed to submit payment proof. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="shadow-lg">
      <CardHeader className="pb-0 pt-6 px-6">
        <div className="flex items-center gap-2">
          <CloudArrowUpIcon className="w-6 h-6 text-primary" />
          <h3 className="text-lg font-bold text-gray-900">Submit Payment Proof</h3>
        </div>
      </CardHeader>
      <CardBody className="px-6 pb-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Payment Proof URL"
            placeholder="https://example.com/receipt.jpg"
            description="Upload your receipt to a service like Imgur or Google Drive and paste the link here"
            value={paymentProofUrl}
            onChange={(e) => setPaymentProofUrl(e.target.value)}
            required
            size="lg"
            variant="bordered"
          />

          <Input
            label="Transaction ID"
            placeholder="e.g., TXN123456789"
            description="The transaction or reference number from your bank"
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
            required
            size="lg"
            variant="bordered"
          />

          <Textarea
            label="Notes (Optional)"
            placeholder="Any additional information about the payment..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            minRows={3}
            size="lg"
            variant="bordered"
          />

          <Button
            type="submit"
            color="primary"
            size="lg"
            className="w-full font-bold text-base"
            isLoading={isSubmitting}
            isDisabled={!paymentProofUrl || !transactionId || isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Payment Proof'}
          </Button>

          <p className="text-xs text-gray-600 text-center">
            Your payment will be verified by our team within 24 hours. Once verified,
            the freelancer will be notified and can begin work.
          </p>
        </form>
      </CardBody>
    </Card>
  )
}
