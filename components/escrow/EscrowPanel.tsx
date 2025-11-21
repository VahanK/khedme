'use client'

import { Card, CardBody, CardHeader, Divider, Button, Code } from '@heroui/react'
import { Shield, DollarSign, Info, CheckCircle } from 'lucide-react'
import { ProjectWithEscrow } from '@/types/database.types'
import EscrowStatusBadge from './EscrowStatusBadge'
import PaymentProofUploader from './PaymentProofUploader'

interface EscrowPanelProps {
  project: ProjectWithEscrow
  userRole: 'client' | 'freelancer'
  onPaymentSubmitted?: () => void
}

export default function EscrowPanel({ project, userRole, onPaymentSubmitted }: EscrowPanelProps) {
  const escrowStatus = project.escrow_status || 'pending_payment'
  const escrowAmount = project.escrow_amount || project.budget_max || 0
  const freelancerPayout = project.freelancer_payout_amount || 0
  const platformFee = project.platform_fee_amount || 0
  const feePercentage = project.platform_fee_percentage || 5

  const handleApproveWork = async () => {
    try {
      const response = await fetch('/api/escrow/request-release', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: project.id }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to request release')
      }

      if (onPaymentSubmitted) {
        onPaymentSubmitted()
      }
    } catch (error) {
      console.error('Error requesting release:', error)
      alert('Failed to approve work. Please try again.')
    }
  }

  // Client view - Pending payment
  if (userRole === 'client' && escrowStatus === 'pending_payment') {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Activate Escrow Protection</h3>
                <p className="text-sm text-default-500">Secure your project with escrow</p>
              </div>
            </div>
          </CardHeader>
          <CardBody className="gap-4">
            {/* Amount Breakdown */}
            <div className="bg-default-100 rounded-lg p-4">
              <h4 className="font-medium mb-3">Payment Breakdown</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-default-600">Project Budget</span>
                  <span className="font-medium">${escrowAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-default-600">Freelancer Receives</span>
                  <span className="text-success">${freelancerPayout.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-default-600">Platform Fee ({feePercentage}%)</span>
                  <span className="text-default-500">${platformFee.toFixed(2)}</span>
                </div>
                <Divider className="my-2" />
                <div className="flex justify-between font-semibold">
                  <span>You Pay</span>
                  <span className="text-primary">${escrowAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Payment Instructions */}
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <div className="flex gap-3">
                <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="text-sm space-y-2">
                  <p className="font-medium text-primary">Payment Instructions:</p>
                  <ol className="list-decimal list-inside space-y-1 text-default-700">
                    <li>Transfer ${escrowAmount.toFixed(2)} to the Khedme escrow account</li>
                    <li>Upload proof of payment below (screenshot or receipt)</li>
                    <li>Wait for admin verification (usually within 24 hours)</li>
                    <li>Once verified, work can begin with payment protection</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Bank Details Placeholder */}
            <div className="border border-default-200 rounded-lg p-4">
              <h4 className="font-medium mb-3">Khedme Escrow Account Details</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-default-500">Account Name:</span>{' '}
                  <Code size="sm">Khedme Platform LLC</Code>
                </div>
                <div>
                  <span className="text-default-500">Bank:</span>{' '}
                  <Code size="sm">[Your Bank Name]</Code>
                </div>
                <div>
                  <span className="text-default-500">Account Number:</span>{' '}
                  <Code size="sm">[Account Number]</Code>
                </div>
                <div>
                  <span className="text-default-500">Reference:</span>{' '}
                  <Code size="sm">PROJECT-{project.id.substring(0, 8).toUpperCase()}</Code>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        <PaymentProofUploader
          projectId={project.id}
          escrowAmount={escrowAmount}
          onUploadComplete={onPaymentSubmitted}
        />
      </div>
    )
  }

  // Client view - Payment submitted, awaiting verification
  if (userRole === 'client' && escrowStatus === 'payment_submitted') {
    return (
      <Card>
        <CardBody className="text-center py-8">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-warning/20 flex items-center justify-center">
              <Shield className="w-8 h-8 text-warning" />
            </div>
            <div>
              <EscrowStatusBadge status={escrowStatus} size="lg" className="mb-3" />
              <h3 className="text-xl font-semibold mb-2">Payment Proof Submitted</h3>
              <p className="text-default-500 max-w-md">
                Your payment proof is being reviewed by our team. You'll be notified once it's verified and the escrow
                is activated. This usually takes less than 24 hours.
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    )
  }

  // Both views - Escrow verified and held
  if (escrowStatus === 'verified_held') {
    return (
      <Card className="border-2 border-success">
        <CardBody className="gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-success" />
            </div>
            <div className="flex-1">
              <EscrowStatusBadge status={escrowStatus} className="mb-2" />
              <h3 className="text-lg font-semibold mb-1">
                {userRole === 'client' ? 'Escrow Active' : 'Payment Secured in Escrow'}
              </h3>
              <p className="text-sm text-default-600 mb-3">
                {userRole === 'client'
                  ? `$${escrowAmount.toFixed(2)} is securely held in escrow. Payment will be released once you approve the completed work.`
                  : `$${freelancerPayout.toFixed(2)} is secured in escrow for you. Complete the work and the client will approve for payment release.`}
              </p>
              <div className="bg-success/10 rounded-lg p-3 text-sm">
                <div className="flex gap-2">
                  <CheckCircle className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-medium text-success">Escrow Protection Active</p>
                    <ul className="list-disc list-inside space-y-0.5 text-default-600">
                      {userRole === 'client' ? (
                        <>
                          <li>Funds held securely until work is approved</li>
                          <li>Review deliverables before releasing payment</li>
                          <li>Dispute resolution available if needed</li>
                        </>
                      ) : (
                        <>
                          <li>Payment guaranteed upon completion</li>
                          <li>Submit deliverables for client review</li>
                          <li>Contact info now shared for communication</li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {userRole === 'client' && project.status === 'in_review' && (
            <Button
              color="primary"
              size="lg"
              fullWidth
              startContent={<CheckCircle className="w-5 h-5" />}
              onClick={handleApproveWork}
            >
              Approve Work & Request Payment Release
            </Button>
          )}
        </CardBody>
      </Card>
    )
  }

  // Client view - Release requested
  if (userRole === 'client' && escrowStatus === 'pending_release') {
    return (
      <Card>
        <CardBody className="text-center py-8">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
              <DollarSign className="w-8 h-8 text-primary" />
            </div>
            <div>
              <EscrowStatusBadge status={escrowStatus} size="lg" className="mb-3" />
              <h3 className="text-xl font-semibold mb-2">Payment Release in Progress</h3>
              <p className="text-default-500 max-w-md">
                You've approved the work. The admin team is processing the payment release to the freelancer.
                You'll be notified once completed.
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    )
  }

  // Freelancer view - Release requested
  if (userRole === 'freelancer' && escrowStatus === 'pending_release') {
    return (
      <Card className="border-2 border-primary">
        <CardBody className="text-center py-8">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
              <DollarSign className="w-8 h-8 text-primary" />
            </div>
            <div>
              <EscrowStatusBadge status={escrowStatus} size="lg" className="mb-3" />
              <h3 className="text-xl font-semibold mb-2">Payment Release Approved!</h3>
              <p className="text-default-500 max-w-md">
                The client has approved your work. The admin is processing your payment of ${freelancerPayout.toFixed(2)}.
                You'll receive it shortly.
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    )
  }

  // Both views - Payment released
  if (escrowStatus === 'released') {
    return (
      <Card className="border-2 border-success">
        <CardBody className="text-center py-8">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            <div>
              <EscrowStatusBadge status={escrowStatus} size="lg" className="mb-3" />
              <h3 className="text-xl font-semibold mb-2">
                {userRole === 'client' ? 'Payment Completed' : 'Payment Received'}
              </h3>
              <p className="text-default-500 max-w-md">
                {userRole === 'client'
                  ? `Payment of $${freelancerPayout.toFixed(2)} has been released to the freelancer. Project completed successfully!`
                  : `You've received $${freelancerPayout.toFixed(2)}. Thank you for completing this project!`}
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    )
  }

  // Freelancer view - Pending payment (client hasn't paid yet)
  if (userRole === 'freelancer' && escrowStatus === 'pending_payment') {
    return (
      <Card>
        <CardBody className="gap-3">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-warning flex-shrink-0 mt-1" />
            <div>
              <EscrowStatusBadge status={escrowStatus} className="mb-2" />
              <p className="text-sm text-default-600">
                Waiting for the client to activate escrow protection. Once payment is verified, you can start working with
                guaranteed payment of ${freelancerPayout.toFixed(2)}.
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    )
  }

  // Freelancer view - Awaiting verification
  if (userRole === 'freelancer' && escrowStatus === 'payment_submitted') {
    return (
      <Card>
        <CardBody className="gap-3">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-warning flex-shrink-0 mt-1" />
            <div>
              <EscrowStatusBadge status={escrowStatus} className="mb-2" />
              <p className="text-sm text-default-600">
                The client has submitted payment proof. Once verified by our admin team, you can start working with
                guaranteed payment of ${freelancerPayout.toFixed(2)}.
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    )
  }

  return null
}
