'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthContext'

export default function ProtectedRoute({ children, requiredRole }) {
  const { user, role, loading } = useAuth()
  const router = useRouter()

  const allowed =
    !requiredRole
      ? true
      : Array.isArray(requiredRole)
        ? requiredRole.includes(role)
        : role === requiredRole

  useEffect(() => {
    if (loading) return

    if (!user) {
      router.replace('/login')
      return
    }

    if (!allowed) {
      router.replace('/gestor')
    }
  }, [user, role, loading, allowed, router])

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Cargando...</div>
  }

  if (!user) return null
  if (!allowed) return null

  return children
}
