import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { UnicornLoader } from '@/components/common/UnicornLoader'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: ('user' | 'trainer' | 'admin')[]
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return <UnicornLoader fullScreen message="Sprawdzanie autoryzacji..." />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    // User doesn't have required role - redirect to their dashboard
    const dashboardPaths = {
      user: '/dashboard',
      trainer: '/trainer/dashboard',
      admin: '/admin/dashboard',
    }
    return <Navigate to={dashboardPaths[profile.role]} replace />
  }

  return <>{children}</>
}
