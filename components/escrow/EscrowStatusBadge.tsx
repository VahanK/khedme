'use client'

import { Chip } from '@heroui/react'
import { Shield, Clock, CheckCircle, AlertCircle, DollarSign } from 'lucide-react'
import { EscrowStatus } from '@/types/database.types'

interface EscrowStatusBadgeProps {
  status: EscrowStatus
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const statusConfig: Record<
  EscrowStatus,
  {
    label: string
    color: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
    icon: React.ReactNode
  }
> = {
  pending_payment: {
    label: 'Payment Pending',
    color: 'default',
    icon: <Clock className="w-4 h-4" />,
  },
  payment_submitted: {
    label: 'Awaiting Verification',
    color: 'warning',
    icon: <AlertCircle className="w-4 h-4" />,
  },
  verified_held: {
    label: 'Payment Protected',
    color: 'success',
    icon: <Shield className="w-4 h-4" />,
  },
  pending_release: {
    label: 'Release Requested',
    color: 'primary',
    icon: <DollarSign className="w-4 h-4" />,
  },
  released: {
    label: 'Payment Released',
    color: 'success',
    icon: <CheckCircle className="w-4 h-4" />,
  },
  disputed: {
    label: 'Disputed',
    color: 'danger',
    icon: <AlertCircle className="w-4 h-4" />,
  },
  refunded: {
    label: 'Refunded',
    color: 'default',
    icon: <DollarSign className="w-4 h-4" />,
  },
}

export default function EscrowStatusBadge({ status, className, size = 'md' }: EscrowStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.pending_payment

  return (
    <Chip
      startContent={config.icon}
      color={config.color}
      variant="flat"
      size={size}
      className={className}
    >
      {config.label}
    </Chip>
  )
}
