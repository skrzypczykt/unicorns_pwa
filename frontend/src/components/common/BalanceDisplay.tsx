import React from 'react'
import { useTranslation } from 'react-i18next'

interface BalanceDisplayProps {
  balance: number
  size?: 'sm' | 'md' | 'lg'
  showWarning?: boolean
  className?: string
}

export const BalanceDisplay: React.FC<BalanceDisplayProps> = ({
  balance,
  size = 'md',
  showWarning = true,
  className = '',
}) => {
  const { t } = useTranslation()

  const isLow = balance < 50
  const isZero = balance <= 0

  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
  }

  const iconSizes = {
    sm: 'text-xl',
    md: 'text-3xl',
    lg: 'text-5xl',
  }

  const getBalanceColor = () => {
    if (isZero) return 'text-error'
    if (isLow) return 'text-warning'
    return 'text-success'
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Unicorn coin icon */}
      <div className={`${iconSizes[size]} sparkle`}>
        🪙
      </div>

      <div>
        <p className="text-sm text-gray-600 mb-1">
          {t('balance.current')}
        </p>
        <p className={`${sizeClasses[size]} font-bold ${getBalanceColor()}`}>
          {balance.toFixed(2)} zł
        </p>

        {showWarning && isLow && !isZero && (
          <p className="text-xs text-warning mt-1 flex items-center gap-1">
            ⚠️ {t('balance.low')}
          </p>
        )}

        {showWarning && isZero && (
          <p className="text-xs text-error mt-1 flex items-center gap-1">
            ❌ {t('balance.insufficient')}
          </p>
        )}
      </div>
    </div>
  )
}
