'use client'

import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input } from '@heroui/react'
import { CreditCardIcon, LockClosedIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => Promise<void>
  amount: number
}

export default function PaymentModal({ isOpen, onClose, onComplete, amount }: PaymentModalProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [cardNumber, setCardNumber] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [cvv, setCvv] = useState('')
  const [cardholderName, setCardholderName] = useState('')

  const handleNext = async () => {
    setIsProcessing(true)
    try {
      await onComplete()
    } catch (error) {
      console.error('Payment completion error:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '')
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned
    return formatted.substring(0, 19) // 16 digits + 3 spaces
  }

  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4)
    }
    return cleaned
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      placement="center"
      backdrop="blur"
      isDismissable={!isProcessing}
      hideCloseButton={isProcessing}
    >
      <ModalContent className="border-2 border-gray-300 shadow-2xl">
        <ModalHeader className="flex flex-col gap-2 pb-4">
          <div className="flex items-center gap-2">
            <CreditCardIcon className="w-6 h-6 text-primary" />
            <h3 className="text-xl font-bold leading-tight">Secure Payment</h3>
          </div>
          <p className="text-sm text-gray-600 font-normal leading-relaxed">Complete your payment to start the project</p>
        </ModalHeader>
        <ModalBody className="gap-5 pb-6">
          {/* Amount Display */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border-2 border-blue-200">
            <p className="text-sm text-gray-600 mb-1">Total Amount</p>
            <p className="text-3xl font-bold text-blue-700">
              ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>

          {/* Card Details Form */}
          <div className="space-y-5">
            <Input
              label="Cardholder Name"
              placeholder="John Doe"
              value={cardholderName}
              onChange={(e) => setCardholderName(e.target.value)}
              size="lg"
              variant="bordered"
              isRequired
              isDisabled={isProcessing}
              classNames={{
                label: "text-sm font-medium mb-2",
                input: "text-base"
              }}
            />

            <Input
              label="Card Number"
              placeholder="1234 5678 9012 3456"
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
              size="lg"
              variant="bordered"
              isRequired
              isDisabled={isProcessing}
              startContent={<CreditCardIcon className="w-5 h-5 text-gray-400" />}
              maxLength={19}
              classNames={{
                label: "text-sm font-medium mb-2",
                input: "text-base"
              }}
            />

            <div className="grid grid-cols-2 gap-4 mt-5">
              <Input
                label="Expiry Date"
                placeholder="MM/YY"
                value={expiryDate}
                onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                size="lg"
                variant="bordered"
                isRequired
                isDisabled={isProcessing}
                maxLength={5}
                classNames={{
                  label: "text-sm font-medium mb-2",
                  input: "text-base"
                }}
              />

              <Input
                label="CVV"
                placeholder="123"
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').substring(0, 3))}
                size="lg"
                variant="bordered"
                type="password"
                isRequired
                isDisabled={isProcessing}
                maxLength={3}
                classNames={{
                  label: "text-sm font-medium mb-2",
                  input: "text-base"
                }}
              />
            </div>
          </div>

          {/* Security Notice */}
          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg mt-2">
            <LockClosedIcon className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900 leading-relaxed">Secure Payment</p>
              <p className="text-xs text-gray-600 leading-relaxed mt-1">Your payment information is encrypted and secure</p>
            </div>
          </div>

          {/* Demo Notice */}
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-800 leading-relaxed">
              <strong>Demo Mode:</strong> This is a test payment interface. Click "Next" to simulate payment completion.
            </p>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            color="default"
            variant="light"
            onPress={onClose}
            isDisabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            color="primary"
            onPress={handleNext}
            isLoading={isProcessing}
            isDisabled={isProcessing}
            size="lg"
            className="font-bold"
          >
            {isProcessing ? 'Processing...' : 'Next'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
