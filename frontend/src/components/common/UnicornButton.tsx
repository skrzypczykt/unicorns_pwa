import React from 'react'

interface UnicornButtonProps {
  children: React.ReactNode
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  className?: string
}

export const UnicornButton: React.FC<UnicornButtonProps> = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
}) => {
  const baseStyles = 'font-semibold rounded-lg transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-unicorn-purple/50 disabled:opacity-50 disabled:cursor-not-allowed'

  const variantStyles = {
    primary: 'bg-rainbow-gradient text-white shadow-rainbow hover:shadow-rainbow-lg hover:scale-105',
    secondary: 'bg-unicorn-pink text-white shadow-md hover:shadow-lg hover:bg-unicorn-purple',
    outline: 'bg-transparent border-2 border-unicorn-purple text-unicorn-purple hover:bg-unicorn-purple hover:text-white',
    ghost: 'bg-transparent text-unicorn-purple hover:bg-unicorn-lavender',
  }

  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {loading ? (
        <div className="flex items-center justify-center gap-2">
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <span>Ładowanie...</span>
        </div>
      ) : (
        children
      )}
    </button>
  )
}
