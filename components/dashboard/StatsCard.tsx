'use client'

import { motion } from 'framer-motion'
import { Card, CardBody } from '@heroui/react'

interface StatsCardProps {
  title: string
  value: string | number
  subtitle: string
  icon?: React.ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
  color?: 'primary' | 'success' | 'danger' | 'warning'
  delay?: number
}

const colorClasses = {
  primary: {
    gradient: 'from-primary/10 to-primary/5',
    text: 'text-primary',
    border: 'border-primary/20'
  },
  success: {
    gradient: 'from-emerald-500/10 to-green-500/5',
    text: 'text-emerald-600',
    border: 'border-emerald-500/20'
  },
  danger: {
    gradient: 'from-rose-500/10 to-pink-500/5',
    text: 'text-rose-600',
    border: 'border-rose-500/20'
  },
  warning: {
    gradient: 'from-amber-500/10 to-yellow-500/5',
    text: 'text-amber-600',
    border: 'border-amber-500/20'
  }
}

export default function StatsCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = 'primary',
  delay = 0
}: StatsCardProps) {
  const colors = colorClasses[color]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card className="border-2 border-gray-100 hover:border-gray-200 transition-all duration-300 hover:shadow-lg">
        <CardBody className="gap-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
              <motion.p
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: delay + 0.2 }}
                className={`text-4xl font-bold ${colors.text}`}
              >
                {value}
              </motion.p>
            </div>
            {icon && (
              <div className={`p-3 rounded-2xl bg-gradient-to-br ${colors.gradient} border ${colors.border}`}>
                <div className={colors.text}>
                  {icon}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">{subtitle}</p>
            {trend && (
              <div className={`flex items-center gap-1 text-sm font-medium ${
                trend.isPositive ? 'text-emerald-600' : 'text-rose-600'
              }`}>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {trend.isPositive ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  )}
                </svg>
                <span>{trend.value}%</span>
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    </motion.div>
  )
}
