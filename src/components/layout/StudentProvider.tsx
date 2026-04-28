'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { StudentContext } from '@/lib/context/StudentContext'
import { getToken, clearToken, startInactivityTimer } from '@/lib/auth/session'
import { getEstudiante } from '@/lib/api/estudiante'
import type { EstudianteData } from '@/types/api'

function goToLogin(router: ReturnType<typeof useRouter>) {
  clearToken()
  document.cookie = 'sii_auth_hint=; path=/; max-age=0'
  router.replace('/login')
}

export default function StudentProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [student, setStudent] = useState<EstudianteData | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const token = getToken()
    if (!token) {
      router.replace('/login')
      return
    }

    // Token encontrado — mostrar el shell mientras cargamos
    setReady(true)

    // Si la API no responde en 12s, mandamos al login
    const timeout = setTimeout(() => goToLogin(router), 12_000)

    getEstudiante(token)
      .then(data => {
        clearTimeout(timeout)
        setStudent(data)
      })
      .catch(() => {
        clearTimeout(timeout)
        goToLogin(router)
      })

    const cleanup = startInactivityTimer(() => goToLogin(router))
    return () => { clearTimeout(timeout); cleanup() }
  }, [router])

  // No renderizar nada hasta confirmar el token (evita mismatch SSR/CSR)
  if (!ready) return null

  return (
    <StudentContext.Provider value={{ student, searchQuery, setSearchQuery }}>
      {children}
    </StudentContext.Provider>
  )
}
