'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import PaymentModal from '@/components/payment/PaymentModal'
import { Card, CardBody, Button } from '@heroui/react'
import {
  CheckCircleIcon,
  CreditCardIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'

interface PaymentPageClientProps {
  userName: string
  onSignOut: () => Promise<void>
  project: any
  acceptedProposal: any
  handleCompletePayment: () => Promise<{ success: boolean; error?: string }>
}

export default function PaymentPageClient({
  userName,
  onSignOut,
  project,
  acceptedProposal,
  handleCompletePayment
}: PaymentPageClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const escrowAmount = project.escrow_amount || 0
  const platformFee = project.platform_fee_amount || 0
  const freelancerPayout = project.freelancer_payout_amount || 0
  const projectId = project.id

  const handlePayNowClick = () => {
    setIsModalOpen(true)
    setError(null)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
  }

  const handlePaymentComplete = async () => {
    try {
      const result = await handleCompletePayment()

      if (result.success) {
        // Close modal and redirect to project page
        setIsModalOpen(false)
        router.push(`/dashboard/client/projects/${projectId}?payment=success`)
      } else {
        setError(result.error || 'Failed to complete payment. Please try again.')
        setIsModalOpen(false)
      }
    } catch (err) {
      console.error('Payment completion error:', err)
      setError('An unexpected error occurred. Please try again.')
      setIsModalOpen(false)
    }
  }

  return (
    <DashboardLayout
      userName={userName}
      userRole="client"
      onSignOut={onSignOut}
    >
      <div className="max-w-3xl mx-auto">
        {/* Back Button */}
        <Button
          variant="light"
          startContent={<ArrowLeftIcon className="w-4 h-4" />}
          onPress={() => router.push('/dashboard/client')}
          className="mb-6"
        >
          Back to Dashboard
        </Button>

        {/* Main Container */}
        <Card className="shadow-xl">
          <CardBody className="p-8">
            {/* Success Header */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="bg-emerald-100 p-4 rounded-full">
                  <CheckCircleIcon className="w-12 h-12 text-emerald-600" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Proposal Accepted!</h1>
              <p className="text-gray-600 text-lg">
                Complete payment to start your project
              </p>
            </div>

            {/* Project Info */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-2">{project.title}</h2>
              <p className="text-gray-700">{project.description}</p>
              {project.freelancer && (
                <p className="text-gray-600 mt-2">
                  Freelancer: <span className="font-semibold">{project.freelancer.full_name}</span>
                </p>
              )}
            </div>

            {/* Escrow Breakdown */}
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Payment Breakdown</h3>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Project Budget</span>
                  <span className="text-xl font-bold text-gray-900">
                    ${escrowAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Platform Fee (5%)</span>
                  <span className="text-gray-700">
                    -${platformFee.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="border-t border-emerald-300 pt-3 flex justify-between items-center">
                  <span className="text-gray-700 font-medium">Freelancer Receives</span>
                  <span className="text-lg font-bold text-emerald-700">
                    ${freelancerPayout.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-800">
                  <strong>Escrow Protection:</strong> Your payment is held securely until work is completed and approved.
                </p>
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-700 mb-2">
                <strong>Payment Method:</strong> Credit/Debit Card
              </p>
              <p className="text-xs text-gray-600">
                We accept Visa, Mastercard, and American Express
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Pay Now Button */}
            <Button
              size="lg"
              color="primary"
              className="w-full font-bold text-xl h-16 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02]"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: '12px'
              }}
              startContent={<CreditCardIcon className="w-6 h-6" />}
              onPress={handlePayNowClick}
            >
              Pay ${escrowAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Button>

            <p className="text-xs text-gray-500 text-center mt-4">
              Once payment is confirmed, your freelancer will be notified to start work
            </p>
          </CardBody>
        </Card>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onComplete={handlePaymentComplete}
        amount={escrowAmount}
      />
    </DashboardLayout>
  )
}
