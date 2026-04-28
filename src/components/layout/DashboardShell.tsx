'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'
import { IcoMenu, IcoSearch, IcoBell, IcoRefresh } from '@/components/ui/Icons'
import { getToken, clearToken, startInactivityTimer } from '@/lib/auth/session'
import { getEstudiante } from '@/lib/api/estudiante'
import { StudentContext } from '@/lib/context/StudentContext'
import { eventosProximos } from '@/lib/data/calendario-academico'
import type { EstudianteData } from '@/types/api'

interface Props {
  crumb: string
  children: React.ReactNode
}

export default function DashboardShell({ crumb, children }: Props) {
  const router = useRouter()
  const [drawer, setDrawer] = useState(false)
  const [student, setStudent] = useState<EstudianteData | null>(null)

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

  const proximoCount = eventosProximos(7).filter(e => e.importante).length

  const initials = student
    ? `${student.persona.charAt(0)}${student.persona.split(' ')[1]?.charAt(0) ?? ''}`
    : '…'

  const nombreCorto = student?.persona.split(' ').slice(0, 2).join(' ') ?? ''

  return (
    <div className="layout">
      {/* Desktop sidebar */}
      <aside className="sidebar">
        <Sidebar
          periodo="Ene – Jun 2026"
          semestre={student?.semestre}
        />
      </aside>

      {/* Mobile drawer backdrop */}
      <div className={`drawer-bg${drawer ? ' on' : ''}`} onClick={() => setDrawer(false)} />
      {/* Mobile drawer */}
      <aside className={`drawer${drawer ? ' on' : ''}`}>
        <Sidebar
          onClose={() => setDrawer(false)}
          periodo="Ene – Jun 2026"
          semestre={student?.semestre}
        />
      </aside>

      <main className="main">
        <div className="topbar">
          <button className="iconbtn mobile-nav-btn" onClick={() => setDrawer(true)}>
            <IcoMenu size={16} />
          </button>
          <div className="crumb">
            <b>SII</b> &nbsp;/&nbsp; {crumb}
          </div>
          <div className="topbar-spacer" />
          <div className="search-wrap">
            <span className="search-icon"><IcoSearch size={14} /></span>
            <input className="sii-input" placeholder="Buscar materia, docente, aula…" />
          </div>
          <button
            className="iconbtn"
            title="Notificaciones"
            style={{ position: 'relative' }}
            onClick={() => window.location.href = '/calendario'}
          >
            <IcoBell size={15} />
            {proximoCount > 0 && (
              <span style={{
                position: 'absolute', top: 2, right: 2,
                width: 16, height: 16, borderRadius: 8,
                background: '#dc2626', color: '#fff',
                fontSize: 9, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                lineHeight: 1,
              }}>{proximoCount > 9 ? '9+' : proximoCount}</span>
            )}
          </button>
          <button className="iconbtn" title="Sincronizar"><IcoRefresh size={15} /></button>
          <div className="userchip">
            <div className="av">{initials}</div>
            <div>
              <div className="nm">{nombreCorto || 'Cargando…'}</div>
              <div className="rl">N° {student?.numero_control ?? '…'}</div>
            </div>
          </div>
        </div>

            <StudentContext.Provider value={{ student }}>
          {children}
        </StudentContext.Provider>
      </main>
    </div>
  )
}
