import React from 'react'

interface UnicornLoaderProps {
  size?: 'sm' | 'md' | 'lg'
  fullScreen?: boolean
  message?: string
}

export const UnicornLoader: React.FC<UnicornLoaderProps> = ({
  size = 'md',
  fullScreen = false,
  message = 'Ładowanie...',
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
  }

  const loader = (
    <div className="flex flex-col items-center justify-center gap-4">
      {/* Spinning rainbow unicorn loader */}
      <div className="relative">
        <div className={`${sizeClasses[size]} border-4 border-transparent border-t-unicorn-pink border-r-unicorn-purple border-b-unicorn-blue rounded-full animate-spin`} />
        <div className={`${sizeClasses[size]} border-4 border-transparent border-t-unicorn-yellow border-r-unicorn-green border-b-unicorn-orange rounded-full animate-spin absolute inset-0`} style={{ animationDirection: 'reverse', animationDuration: '1s' }} />
      </div>

      {/* Unicorn emoji with sparkle animation */}
      <div className="text-4xl animate-bounce-slow">
        🦄
      </div>

      {message && (
        <p className="text-unicorn-purple font-semibold animate-pulse">
          {message}
        </p>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-unicorn-lavender/95 via-white/95 to-unicorn-peach/95 backdrop-blur-sm flex items-center justify-center z-50">
        {loader}
      </div>
    )
  }

  return loader
}
