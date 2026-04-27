'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DashboardShell from '@/components/layout/DashboardShell'
import { IcoClock, IcoBook } from '@/components/ui/Icons'
import { getToken } from '@/lib/auth/session'
import { getHorarios } from '@/lib/api/estudiante'
import type { HorariosPeriodo, HorarioItem } from '@/types/api'

const DIAS = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'] as const
const DIAS_LABEL: Record<string, string> = {
  lunes: 'Lunes', martes: 'Martes', miercoles: 'Miércoles',
  jueves: 'Jueves', viernes: 'Viernes', sabado: 'Sábado',
}

const COLORES = [
  'var(--green-900)', '#1a5c3a', '#2d4a6e', '#4a2d6e', '#6e2d4a', '#2d6e4a',
]

function getHora(item: HorarioItem, dia: typeof DIAS[number]): string | null {
  return item[dia] as string | null
}
function getSalon(item: HorarioItem, dia: typeof DIAS[number]): string | null {
  return item[`${dia}_clave_salon` as keyof HorarioItem] as string | null
}

export default function HorariosPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [periodos, setPeriodos] = useState<HorariosPeriodo[]>([])
  const [periodoIdx, setPeriodoIdx] = useState(0)
  const [vista, setVista] = useState<'semana' | 'lista'>('semana')

  useEffect(() => {
    const token = getToken()
    if (!token) { router.replace('/login'); return }
    getHorarios(token)
      .then(data => { setPeriodos(data) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [router])

  const periodo = periodos[periodoIdx]

  if (loading) {
    return (
      <DashboardShell crumb="Horario">
        <div className="pagehead">
          <div>
            <div className="eyebrow">Académico · Horario</div>
            <h1>Cargando horario…</h1>
          </div>
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell crumb="Horario">
      <div className="pagehead">
        <div>
          <div className="eyebrow">Académico · Horario</div>
          <h1>Horario de clases</h1>
          <p className="sub">{periodo?.periodo.descripcion_periodo}</p>
        </div>
        <div className="actions">
          {periodos.map((p, i) => (
            <button
              key={p.periodo.clave_periodo}
              className="iconbtn"
              style={periodoIdx === i ? { background: 'var(--green-900)', color: '#fff', borderColor: 'var(--green-900)' } : {}}
              onClick={() => setPeriodoIdx(i)}
            >
              {p.periodo.descripcion_periodo}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="sii-grid g-4" style={{ marginBottom: 16 }}>
        <div className="stat">
          <div className="accent"><IcoBook size={14} /></div>
          <div className="lbl">Materias activas</div>
          <div className="val">{periodo?.horario.length ?? 0}</div>
          <div className="sub">Este periodo</div>
        </div>
        <div className="stat">
          <div className="accent"><IcoClock size={14} /></div>
          <div className="lbl">Días con clases</div>
          <div className="val">
            {DIAS.filter(d => periodo?.horario.some(h => getHora(h, d) !== null)).length}
          </div>
          <div className="sub">de 6 días hábiles</div>
        </div>
        <div className="stat">
          <div className="accent"><IcoClock size={14} /></div>
          <div className="lbl">Periodo</div>
          <div className="val" style={{ fontSize: 18 }}>{periodo?.periodo.clave_periodo}</div>
          <div className="sub">{periodo?.periodo.anio}</div>
        </div>
        <div className="stat dark">
          <div className="accent"><IcoBook size={14} /></div>
          <div className="lbl">Plan de estudios</div>
          <div className="val" style={{ fontSize: 16 }}>{periodo?.horario[0]?.nombre_plan ?? '—'}</div>
          <div className="sub">Turno {periodo?.horario[0]?.clave_turno ?? '—'}</div>
        </div>
      </div>

      {/* Vista toggle */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        <button
          className="iconbtn"
          style={vista === 'semana' ? { background: 'var(--green-900)', color: '#fff', borderColor: 'var(--green-900)' } : {}}
          onClick={() => setVista('semana')}
        >
          Vista semanal
        </button>
        <button
          className="iconbtn"
          style={vista === 'lista' ? { background: 'var(--green-900)', color: '#fff', borderColor: 'var(--green-900)' } : {}}
          onClick={() => setVista('lista')}
        >
          Lista
        </button>
      </div>

      {/* Semana view */}
      {vista === 'semana' && (
        <div className="card" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
            <thead>
              <tr>
                {DIAS.map(d => (
                  <th key={d} style={{ padding: '12px 10px', textAlign: 'left', fontSize: 12, color: 'var(--ink-500)', fontWeight: 600, borderBottom: '1px solid var(--line)', textTransform: 'uppercase', letterSpacing: '.05em' }}>
                    {DIAS_LABEL[d]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {DIAS.map(d => {
                  const clases = periodo?.horario.filter(h => getHora(h, d) !== null) ?? []
                  return (
                    <td key={d} style={{ padding: '10px 8px', verticalAlign: 'top', borderRight: '1px solid var(--line)' }}>
                      {clases.length === 0 && (
                        <div className="muted" style={{ fontSize: 12, textAlign: 'center', padding: '20px 0' }}>—</div>
                      )}
                      {clases.map((h, i) => (
                        <div key={h.id_grupo} style={{
                          background: COLORES[i % COLORES.length], borderRadius: 8,
                          padding: '8px 10px', marginBottom: 8, color: '#fff',
                        }}>
                          <div style={{ fontFamily: 'Source Serif 4, serif', fontSize: 15, fontWeight: 600 }}>
                            {getHora(h, d)?.split('-')[0]}
                          </div>
                          <div style={{ fontSize: 11, fontWeight: 700, marginTop: 2, opacity: .9 }}>
                            {h.nombre_materia}
                          </div>
                          <div style={{ fontSize: 10, marginTop: 3, opacity: .7 }}>
                            {h.clave_materia} · {getSalon(h, d) ?? '—'}
                          </div>
                        </div>
                      ))}
                    </td>
                  )
                })}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Lista view */}
      {vista === 'lista' && (
        <div className="card">
          <table className="tbl">
            <thead>
              <tr>
                <th>Materia</th>
                <th>Clave</th>
                <th>Grupo</th>
                {DIAS.map(d => <th key={d} style={{ textAlign: 'center' }}>{DIAS_LABEL[d].slice(0, 3)}</th>)}
              </tr>
            </thead>
            <tbody>
              {(periodo?.horario ?? []).map(h => (
                <tr key={h.id_grupo}>
                  <td><b style={{ fontSize: 13 }}>{h.nombre_materia}</b></td>
                  <td className="muted" style={{ fontSize: 12 }}>{h.clave_materia}</td>
                  <td className="muted" style={{ fontSize: 12 }}>{h.letra_grupo}</td>
                  {DIAS.map(d => {
                    const hora = getHora(h, d)
                    const salon = getSalon(h, d)
                    return (
                      <td key={d} style={{ textAlign: 'center', fontSize: 12 }}>
                        {hora
                          ? <div>
                              <div style={{ fontWeight: 600, color: 'var(--green-800)' }}>{hora}</div>
                              <div className="muted">{salon}</div>
                            </div>
                          : <span className="muted">—</span>}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardShell>
  )
}
