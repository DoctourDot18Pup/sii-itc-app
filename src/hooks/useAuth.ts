'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { getToken, clearToken, isAuthenticated } from '@/lib/auth/session'

export function useAuth() {
  const router = useRouter()

  const logout = useCallback(() => {
    clearToken()
    document.cookie = 'sii_auth_hint=; path=/; max-age=0'
    router.push('/login')
  }, [router])

  return {
    token: getToken(),
    isAuthenticated: isAuthenticated(),
    logout,
  }
}
