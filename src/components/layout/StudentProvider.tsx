'use client'

import { useState, useEffect } from 'react'
import { StudentContext } from '@/lib/context/StudentContext'
import { getToken, clearToken, startInactivityTimer } from '@/lib/auth/session'
import { getEstudiante } from '@/lib/api/estudiante'
import type { EstudianteData } from '@/types/api'

function goToLogin() {
  clearToken()
  document.cookie = 'sii_auth_hint=; path=/; max-age=0'
  window.location.replace('/login')
}

export default function StudentProvider({ children }: { children: React.ReactNode }) {
  const [student, setStudent] = useState<EstudianteData | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const token = getToken()
    if (!token) {
      goToLogin()
      return
    }

    setReady(true)

    const timeout = setTimeout(goToLogin, 12_000)

    getEstudiante(token)
      .then(data => { clearTimeout(timeout); setStudent(data) })
      .catch(() => { clearTimeout(timeout); goToLogin() })

    const cleanup = startInactivityTimer(goToLogin)
    return () => { clearTimeout(timeout); cleanup() }
  }, [])

  if (!ready) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', background: '#fbf9f3',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            border: '3px solid #e6e3d6', borderTopColor: '#0b2a1a',
            animation: 'spin 0.7s linear infinite', margin: '0 auto 12px',
          }} />
          <div style={{ color: '#6b7280', fontSize: 13 }}>Verificando sesión…</div>
        </div>
      </div>
    )
  }

  return (
    <StudentContext.Provider value={{ student, searchQuery, setSearchQuery }}>
      {children}
    </StudentContext.Provider>
  )
}
