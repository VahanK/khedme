'use client'

import { motion } from 'framer-motion'
import { Card, CardBody, CardHeader, Button, Progress } from '@heroui/react'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

interface ProfileCompletionItem {
  label: string
  completed: boolean
}

interface ProfileCompletionWidgetProps {
  items: ProfileCompletionItem[]
  userRole: 'freelancer' | 'client'
}

export default function ProfileCompletionWidget({ items, userRole }: ProfileCompletionWidgetProps) {
  const completedCount = items.filter(item => item.completed).length
  const totalCount = items.length
  const percentage = Math.round((completedCount / totalCount) * 100)

  const isComplete = percentage === 100

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className={`border-2 ${
        isComplete
          ? 'border-emerald-200 bg-gradient-to-br from-emerald-50/50 to-green-50/50'
          : 'border-amber-200 bg-gradient-to-br from-amber-50/50 to-yellow-50/50'
      }`}>
        <CardHeader className="flex-col items-start gap-2 pb-4">
          <div className="flex items-center justify-between w-full">
            <h3 className="text-lg font-bold text-gray-900">
              {isComplete ? '✨ Profile Complete!' : '📋 Complete Your Profile'}
            </h3>
            <span className={`text-2xl font-bold ${
              percentage >= 80 ? 'text-emerald-600' :
              percentage >= 50 ? 'text-amber-600' :
              'text-rose-600'
            }`}>
              {percentage}%
            </span>
          </div>
          <Progress
            value={percentage}
            color={percentage >= 80 ? 'success' : percentage >= 50 ? 'warning' : 'danger'}
            className="w-full"
            size="sm"
          />
        </CardHeader>

        <CardBody className="gap-3 pt-0">
          {!isComplete && (
            <p className="text-sm text-gray-600 mb-2">
              Complete your profile to increase visibility and trust
            </p>
          )}

          <div className="space-y-2">
            {items.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-center gap-2"
              >
                {item.completed ? (
                  <CheckCircleIcon className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                ) : (
                  <XCircleIcon className="w-5 h-5 text-gray-300 flex-shrink-0" />
                )}
                <span className={`text-sm ${
                  item.completed ? 'text-gray-500 line-through' : 'text-gray-700 font-medium'
                }`}>
                  {item.label}
                </span>
              </motion.div>
            ))}
          </div>

          {!isComplete && (
            <Link href={`/dashboard/${userRole}/profile`} className="mt-4">
              <Button
                color={userRole === 'freelancer' ? 'danger' : 'success'}
                variant="flat"
                className="w-full"
                size="sm"
              >
                Complete Profile
              </Button>
            </Link>
          )}
        </CardBody>
      </Card>
    </motion.div>
  )
}
