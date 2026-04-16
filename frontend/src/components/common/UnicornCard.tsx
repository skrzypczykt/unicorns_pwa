import React from 'react'

interface UnicornCardProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  footer?: React.ReactNode
  className?: string
  onClick?: () => void
  hoverable?: boolean
}

export const UnicornCard: React.FC<UnicornCardProps> = ({
  children,
  title,
  subtitle,
  footer,
  className = '',
  onClick,
  hoverable = false,
}) => {
  const hoverStyles = hoverable || onClick
    ? 'hover:shadow-unicorn hover:scale-[1.02] cursor-pointer'
    : ''

  return (
    <div
      onClick={onClick}
      className={`card-unicorn ${hoverStyles} ${className}`}
    >
      {(title || subtitle) && (
        <div className="mb-4">
          {title && (
            <h3 className="text-xl font-bold text-unicorn-purple mb-1">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-sm text-gray-600">
              {subtitle}
            </p>
          )}
        </div>
      )}

      <div className="flex-1">
        {children}
      </div>

      {footer && (
        <div className="mt-4 pt-4 border-t border-unicorn-lavender">
          {footer}
        </div>
      )}
    </div>
  )
}
