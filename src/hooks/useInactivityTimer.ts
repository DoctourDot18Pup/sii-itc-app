'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { startInactivityTimer, clearToken } from '@/lib/auth/session'

export function useInactivityTimer(): void {
  const router = useRouter()

  useEffect(() => {
    const cleanup = startInactivityTimer(() => {
      clearToken()
      document.cookie = 'sii_auth_hint=; path=/; max-age=0'
      router.push('/login')
    })

    return cleanup
  }, [router])
}
