'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import Image from 'next/image'

import {
  IcoHome, IcoUser, IcoGrade, IcoKardex, IcoClock,
  IcoCalendar, IcoTarget, IcoLogOut, IcoChev, IcoBarChart,
} from '@/components/ui/Icons'
import { clearToken } from '@/lib/auth/session'

const NAV = [
  { id: '/dashboard',      label: 'Inicio',            Icon: IcoHome,     group: 'principal' },
  { id: '/perfil',         label: 'Mi Perfil',          Icon: IcoUser,     group: 'principal' },
  { id: '/calificaciones', label: 'Calificaciones',     Icon: IcoGrade,    group: 'academico' },
  { id: '/kardex',         label: 'Kardex',             Icon: IcoKardex,   group: 'academico' },
  { id: '/horarios',       label: 'Horario',            Icon: IcoClock,    group: 'academico' },
  { id: '/calendario',     label: 'Calendario',         Icon: IcoCalendar, group: 'academico' },
  { id: '/proyeccion',     label: 'Proyección',         Icon: IcoTarget,   group: 'herramientas', tag: 'Nuevo' },
  { id: '/analisis',       label: 'Análisis',           Icon: IcoBarChart, group: 'herramientas' },
]

const GROUPS = [
  { id: 'principal',    label: 'Principal' },
  { id: 'academico',    label: 'Académico' },
  { id: 'herramientas', label: 'Herramientas' },
]

interface SidebarProps {
  onClose?: () => void
  periodo?: string
  semestre?: number
}

export default function Sidebar({ onClose, periodo, semestre }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  function handleLogout() {
    clearToken()
    document.cookie = 'sii_auth_hint=; path=/; max-age=0'
    router.push('/login')
  }

  return (
    <>
      <div className="brand-mark">
        <Image src="/logo_lince.png" alt="Linces TecNM Celaya" width={40} height={40} style={{ borderRadius: 6 }} />
        <div>
          <div className="b1" style={{ color: '#fff' }}>SII Linces</div>
          <div className="b2">TecNM · Celaya</div>
        </div>
      </div>

      <div className="sidebar-scroll">
        <nav className="nav">
          {GROUPS.map(g => (
            <div key={g.id}>
              <div className="nav-section">{g.label}</div>
              {NAV.filter(n => n.group === g.id).map(({ id, label, Icon, tag }) => {
                const active = pathname === id || (id !== '/dashboard' && pathname.startsWith(id))
                return (
                  <Link
                    key={id}
                    href={id}
                    className={active ? 'active' : ''}
                    onClick={onClose}
                  >
                    <span className="ico"><Icon size={16} /></span>
                    <span style={{ flex: 1 }}>{label}</span>
                    {tag && <span className="badge gold" style={{ fontSize: 10 }}>{tag}</span>}
                    {active && <IcoChev size={14} style={{ opacity: 0.5 }} />}
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>

        {periodo && (
          <div className="sidebar-footer-card" style={{ marginTop: 'auto' }}>
            <strong>Periodo activo</strong>
            {periodo}{semestre ? ` · Sem. ${semestre}` : ''}
          </div>
        )}

        <button
          onClick={handleLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px', marginTop: 8,
            color: 'rgba(243,234,219,.7)', background: 'transparent',
            border: 0, fontSize: 13.5, borderRadius: 8, width: '100%', cursor: 'pointer',
          }}
        >
          <span className="ico" style={{ color: 'var(--gold-400)' }}><IcoLogOut size={16} /></span>
          Cerrar sesión
        </button>
      </div>
    </>
  )
}
