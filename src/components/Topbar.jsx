'use client'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './AuthContext'

export default function Topbar() {
  const router = useRouter()
  const auth = useAuth()

  const { user, role, loading, signOut } = auth || {}
  const roleLabel = useMemo(() => {
    if (!role) return '—'
    return String(role).toLowerCase() === 'admin' ? 'ADMIN' : 'TÉCNICO'
  }, [role])

  if (!auth || loading) return null

  return null;
}
