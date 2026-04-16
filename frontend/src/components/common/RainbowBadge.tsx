import React from 'react'

interface RainbowBadgeProps {
  children: React.ReactNode
  variant?: 'registered' | 'cancelled' | 'attended' | 'no_show' | 'scheduled' | 'completed' | 'info' | 'success' | 'warning' | 'error'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const RainbowBadge: React.FC<RainbowBadgeProps> = ({
  children,
  variant = 'info',
  size = 'md',
  className = '',
}) => {
  const variantStyles = {
    registered: 'bg-unicorn-blue/20 text-unicorn-blue border-unicorn-blue/30',
    cancelled: 'bg-gray-200 text-gray-600 border-gray-300',
    attended: 'bg-unicorn-green/20 text-green-700 border-unicorn-green/30',
    no_show: 'bg-unicorn-red/20 text-red-700 border-unicorn-red/30',
    scheduled: 'bg-unicorn-purple/20 text-unicorn-purple border-unicorn-purple/30',
    completed: 'bg-unicorn-green/20 text-green-700 border-unicorn-green/30',
    info: 'bg-unicorn-blue/20 text-unicorn-blue border-unicorn-blue/30',
    success: 'bg-unicorn-green/20 text-green-700 border-unicorn-green/30',
    warning: 'bg-unicorn-orange/20 text-orange-700 border-unicorn-orange/30',
    error: 'bg-unicorn-red/20 text-red-700 border-unicorn-red/30',
  }

  const sizeStyles = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  }

  return (
    <span className={`inline-flex items-center gap-1 font-semibold rounded-full border ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}>
      {children}
    </span>
  )
}
