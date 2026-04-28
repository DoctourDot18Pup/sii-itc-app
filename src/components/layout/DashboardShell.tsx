'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'
import { IcoMenu, IcoSearch, IcoBell, IcoRefresh } from '@/components/ui/Icons'
import { useStudent } from '@/lib/context/StudentContext'
import { eventosProximos } from '@/lib/data/calendario-academico'

interface Props {
  crumb: string
  children: React.ReactNode
}

export default function DashboardShell({ crumb, children }: Props) {
  const router = useRouter()
  const { student, searchQuery, setSearchQuery } = useStudent()
  const [drawer, setDrawer] = useState(false)

  const initials = student
    ? `${student.persona.charAt(0)}${student.persona.split(' ')[1]?.charAt(0) ?? ''}`
    : '…'
  const nombreCorto = student?.persona.split(' ').slice(0, 2).join(' ') ?? ''
  const proximoCount = eventosProximos(7).filter(e => e.importante).length

  return (
    <div className="layout">
      <aside className="sidebar">
        <Sidebar periodo="Ene – Jun 2026" semestre={student?.semestre} />
      </aside>

      <div className={`drawer-bg${drawer ? ' on' : ''}`} onClick={() => setDrawer(false)} />
      <aside className={`drawer${drawer ? ' on' : ''}`}>
        <Sidebar onClose={() => setDrawer(false)} periodo="Ene – Jun 2026" semestre={student?.semestre} />
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
            <input
              className="sii-input"
              placeholder="Buscar materia, docente, aula…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            className="iconbtn"
            title="Notificaciones"
            style={{ position: 'relative' }}
            onClick={() => router.push('/calendario')}
          >
            <IcoBell size={15} />
            {proximoCount > 0 && (
              <span style={{
                position: 'absolute', top: 2, right: 2,
                width: 16, height: 16, borderRadius: 8,
                background: '#dc2626', color: '#fff',
                fontSize: 9, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {proximoCount > 9 ? '9+' : proximoCount}
              </span>
            )}
          </button>
          <button
            className="iconbtn"
            title="Sincronizar"
            onClick={() => window.location.reload()}
          >
            <IcoRefresh size={15} />
          </button>
          <button
            className="userchip"
            style={{ border: '1px solid var(--line-strong)', background: 'var(--white)', cursor: 'pointer' }}
            onClick={() => router.push('/perfil')}
            title="Ver perfil"
          >
            <div className="av">{initials}</div>
            <div className="userchip-info">
              <div className="nm">{nombreCorto || 'Cargando…'}</div>
              <div className="rl">N° {student?.numero_control ?? '…'}</div>
            </div>
          </button>
        </div>

        {children}
      </main>
    </div>
  )
}
