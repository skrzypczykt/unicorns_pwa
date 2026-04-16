import React from 'react'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { pl } from 'date-fns/locale'
import { UnicornCard } from '@/components/common/UnicornCard'
import { UnicornButton } from '@/components/common/UnicornButton'
import { RainbowBadge } from '@/components/common/RainbowBadge'
import type { Database } from '@/types/database.types'

type Activity = Database['public']['Tables']['activities']['Row'] & {
  current_participants?: number
  user_registration?: {
    id: string
    status: string
    can_cancel_until: string
  } | null
}

interface ActivityCardProps {
  activity: Activity
  onRegister?: () => void
  onCancel?: () => void
  loading?: boolean
}

export const ActivityCard: React.FC<ActivityCardProps> = ({
  activity,
  onRegister,
  onCancel,
  loading = false,
}) => {
  const { t } = useTranslation()

  const activityDate = new Date(activity.date_time)
  const currentParticipants = activity.current_participants || 0
  const availableSpots = activity.max_participants - currentParticipants
  const isFull = availableSpots <= 0
  const isRegistered = activity.user_registration?.status === 'registered'
  const canCancel = isRegistered && new Date() < new Date(activity.user_registration!.can_cancel_until)

  return (
    <UnicornCard
      className="h-full flex flex-col"
      title={activity.name}
      subtitle={format(activityDate, 'EEEE, d MMMM yyyy', { locale: pl })}
    >
      <div className="space-y-3 flex-1">
        {/* Time and duration */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>🕐</span>
          <span>{format(activityDate, 'HH:mm')}</span>
          <span className="text-gray-400">•</span>
          <span>{activity.duration_minutes} min</span>
        </div>

        {/* Location */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>📍</span>
          <span>{activity.location}</span>
        </div>

        {/* Description */}
        {activity.description && (
          <p className="text-sm text-gray-700 line-clamp-2">
            {activity.description}
          </p>
        )}

        {/* Cost */}
        <div className="flex items-center gap-2">
          <span className="text-2xl">🪙</span>
          <span className="text-xl font-bold text-unicorn-purple">
            {activity.cost.toFixed(2)} zł
          </span>
        </div>

        {/* Participants */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>👥</span>
            <span className="text-sm text-gray-600">
              {currentParticipants} / {activity.max_participants}
            </span>
          </div>
          <RainbowBadge
            variant={isFull ? 'error' : availableSpots <= 3 ? 'warning' : 'success'}
            size="sm"
          >
            {isFull ? t('activities.full') : `${availableSpots} ${t('activities.availableSpots', { count: availableSpots }).split(':')[0]}`}
          </RainbowBadge>
        </div>

        {/* Registration status */}
        {isRegistered && (
          <RainbowBadge variant="registered">
            ✓ {t('activities.registered')}
          </RainbowBadge>
        )}
      </div>

      {/* Actions */}
      <div className="mt-4 flex gap-2">
        {!isRegistered && (
          <UnicornButton
            onClick={onRegister}
            disabled={isFull || loading}
            loading={loading}
            className="flex-1"
          >
            {isFull ? t('activities.full') : t('activities.register')}
          </UnicornButton>
        )}

        {isRegistered && canCancel && (
          <UnicornButton
            onClick={onCancel}
            variant="outline"
            loading={loading}
            className="flex-1"
          >
            {t('activities.cancel')}
          </UnicornButton>
        )}

        {isRegistered && !canCancel && (
          <div className="flex-1 text-center text-sm text-gray-500">
            {t('activities.cannotCancelPastDeadline')}
          </div>
        )}
      </div>

      {/* Payment info */}
      {isRegistered && (
        <div className="mt-2 text-xs text-gray-500 text-center">
          ℹ️ {t('activities.noPaymentAtRegistration')}
        </div>
      )}
    </UnicornCard>
  )
}
