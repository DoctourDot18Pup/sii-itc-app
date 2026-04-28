'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { StudentContext } from '@/lib/context/StudentContext'
import { getToken, clearToken, startInactivityTimer } from '@/lib/auth/session'
import { getEstudiante } from '@/lib/api/estudiante'
import type { EstudianteData } from '@/types/api'

export default function StudentProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [student, setStudent] = useState<EstudianteData | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const token = getToken()
    if (!token) { router.replace('/login'); return }

    getEstudiante(token)
      .then(setStudent)
      .catch((err: Error) => {
        if (err.message === 'TOKEN_EXPIRED') {
          clearToken()
          document.cookie = 'sii_auth_hint=; path=/; max-age=0'
          router.replace('/login')
        }
      })

    const cleanup = startInactivityTimer(() => {
      clearToken()
      document.cookie = 'sii_auth_hint=; path=/; max-age=0'
      router.replace('/login')
    })
    return cleanup
  }, [router])

  return (
    <StudentContext.Provider value={{ student, searchQuery, setSearchQuery }}>
      {children}
    </StudentContext.Provider>
  )
}
