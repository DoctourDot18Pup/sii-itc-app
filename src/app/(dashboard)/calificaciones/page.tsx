'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import DashboardShell from '@/components/layout/DashboardShell'
import { IcoGrade, IcoAward, IcoBook, IcoSearch } from '@/components/ui/Icons'
import { getToken } from '@/lib/auth/session'
import { getCalificaciones } from '@/lib/api/estudiante'
import type { CalificacionesPeriodo } from '@/types/api'

function colorFor(cal: string | null): string {
  const n = Number(cal)
  if (!cal || isNaN(n)) return 'neutral'
  if (n >= 90) return 'good'
  if (n >= 70) return 'warn'
  return 'bad'
}

function desempeno(cal: string | null): string {
  const n = Number(cal)
  if (!cal || isNaN(n)) return '—'
  if (n >= 90) return 'Excelente'
  if (n >= 80) return 'Bueno'
  if (n >= 70) return 'Regular'
  return 'Reprobado'
}

export default function CalificacionesPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [periodos, setPeriodos] = useState<CalificacionesPeriodo[]>([])
  const [periodoIdx, setPeriodoIdx] = useState(0)
  const [vista, setVista] = useState<'tabla' | 'tarjetas'>('tabla')
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => {
    const token = getToken()
    if (!token) { router.replace('/login'); return }
    getCalificaciones(token)
      .then(data => { setPeriodos(data); })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [router])

  const periodoActual = periodos[periodoIdx]

  const materiasFiltradas = useMemo(() => {
    if (!periodoActual) return []
    return periodoActual.materias.filter(m =>
      m.materia.nombre_materia.toLowerCase().includes(busqueda.toLowerCase()) ||
      m.materia.clave_materia.toLowerCase().includes(busqueda.toLowerCase())
    )
  }, [periodoActual, busqueda])

  const stats = useMemo(() => {
    const conCal = materiasFiltradas.flatMap(m =>
      m.calificaiones
        .filter(c => c.calificacion && !isNaN(Number(c.calificacion)))
        .map(c => Number(c.calificacion))
    )
    const promedio = conCal.length
      ? (conCal.reduce((a, b) => a + b, 0) / conCal.length).toFixed(1)
      : '—'
    const aprobadas = materiasFiltradas.filter(m => {
      const cals = m.calificaiones.filter(c => c.calificacion && !isNaN(Number(c.calificacion)))
      return cals.some(c => Number(c.calificacion) >= 70)
    }).length
    const mejor = materiasFiltradas.reduce<{ nombre: string; val: number } | null>((acc, m) => {
      const cals = m.calificaiones
        .filter(c => c.calificacion && !isNaN(Number(c.calificacion)))
        .map(c => Number(c.calificacion))
      const max = cals.length ? Math.max(...cals) : 0
      if (!acc || max > acc.val) return { nombre: m.materia.nombre_materia, val: max }
      return acc
    }, null)
    return { promedio, aprobadas, mejor }
  }, [materiasFiltradas])

  if (loading) {
    return (
      <DashboardShell crumb="Calificaciones">
        <div className="pagehead">
          <div>
            <div className="eyebrow">Académico · Calificaciones</div>
            <h1>Cargando calificaciones…</h1>
          </div>
        </div>
        <div className="sii-grid g-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="stat">
              <div className="sk" style={{ height: 12, width: 80 }} />
              <div className="sk" style={{ height: 30, width: 120, marginTop: 10 }} />
            </div>
          ))}
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell crumb="Calificaciones">
      <div className="pagehead">
        <div>
          <div className="eyebrow">Académico · Calificaciones</div>
          <h1>Calificaciones</h1>
          <p className="sub">Historial por periodo</p>
        </div>
      </div>

      {/* Stats */}
      <div className="sii-grid g-4">
        <div className="stat dark">
          <div className="accent"><IcoAward size={14} /></div>
          <div className="lbl">Promedio del periodo</div>
          <div className="val">{stats.promedio}</div>
          <div className="sub">{periodoActual?.periodo.descripcion_periodo}</div>
        </div>
        <div className="stat">
          <div className="accent"><IcoGrade size={14} /></div>
          <div className="lbl">Materias aprobadas</div>
          <div className="val">{stats.aprobadas}</div>
          <div className="sub">de {materiasFiltradas.length} en el filtro</div>
        </div>
        <div className="stat">
          <div className="accent"><IcoBook size={14} /></div>
          <div className="lbl">Materias en periodo</div>
          <div className="val">{periodoActual?.materias.length ?? '—'}</div>
          <div className="sub">Materias registradas</div>
        </div>
        <div className="stat">
          <div className="accent"><IcoAward size={14} /></div>
          <div className="lbl">Mejor calificación</div>
          <div className="val">{stats.mejor?.val ?? '—'}</div>
          <div className="sub" style={{ fontSize: 11, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {stats.mejor?.nombre ?? '—'}
          </div>
        </div>
      </div>

      <div style={{ height: 16 }} />

      {/* Filter bar */}
      <div className="card" style={{ padding: '14px 20px', marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="search-wrap" style={{ flex: 1, minWidth: 200 }}>
            <span className="search-icon"><IcoSearch size={14} /></span>
            <input
              className="sii-input"
              placeholder="Buscar materia o clave…"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {periodos.map((p, i) => (
              <button
                key={p.periodo.clave_periodo}
                className={`iconbtn${periodoIdx === i ? ' active' : ''}`}
                style={periodoIdx === i ? { background: 'var(--green-900)', color: '#fff', borderColor: 'var(--green-900)' } : {}}
                onClick={() => { setPeriodoIdx(i); setBusqueda('') }}
              >
                {p.periodo.descripcion_periodo}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            <button
              className="iconbtn"
              style={vista === 'tabla' ? { background: 'var(--green-900)', color: '#fff', borderColor: 'var(--green-900)' } : {}}
              onClick={() => setVista('tabla')}
            >
              Tabla
            </button>
            <button
              className="iconbtn"
              style={vista === 'tarjetas' ? { background: 'var(--green-900)', color: '#fff', borderColor: 'var(--green-900)' } : {}}
              onClick={() => setVista('tarjetas')}
            >
              Tarjetas
            </button>
          </div>
        </div>
      </div>

      {/* Table view */}
      {vista === 'tabla' && (
        <div className="card">
          <table className="tbl">
            <thead>
              <tr>
                <th>Materia</th>
                <th>Clave</th>
                <th style={{ textAlign: 'right' }}>P1</th>
                <th style={{ textAlign: 'right' }}>P2</th>
                <th style={{ textAlign: 'right' }}>P3</th>
                <th style={{ textAlign: 'right' }}>Final</th>
                <th style={{ textAlign: 'right' }}>Desempeño</th>
              </tr>
            </thead>
            <tbody>
              {materiasFiltradas.length === 0 && (
                <tr>
                  <td colSpan={7} className="muted" style={{ textAlign: 'center', padding: '24px 0' }}>
                    Sin resultados
                  </td>
                </tr>
              )}
              {materiasFiltradas.map(m => {
                const p1 = m.calificaiones.find(c => c.numero_calificacion === 1)
                const p2 = m.calificaiones.find(c => c.numero_calificacion === 2)
                const p3 = m.calificaiones.find(c => c.numero_calificacion === 3)
                const pF = m.calificaiones.find(c => c.numero_calificacion === 4)
                const ultima = [...m.calificaiones].reverse().find(c => c.calificacion)
                return (
                  <tr key={m.materia.id_grupo}>
                    <td><b style={{ fontSize: 13 }}>{m.materia.nombre_materia}</b></td>
                    <td className="muted" style={{ fontSize: 12 }}>{m.materia.clave_materia}</td>
                    <td className="num">
                      {p1?.calificacion
                        ? <span className={`badge ${colorFor(p1.calificacion)}`}>{p1.calificacion}</span>
                        : <span className="muted">—</span>}
                    </td>
                    <td className="num">
                      {p2?.calificacion
                        ? <span className={`badge ${colorFor(p2.calificacion)}`}>{p2.calificacion}</span>
                        : <span className="muted">—</span>}
                    </td>
                    <td className="num">
                      {p3?.calificacion
                        ? <span className={`badge ${colorFor(p3.calificacion)}`}>{p3.calificacion}</span>
                        : <span className="muted">—</span>}
                    </td>
                    <td className="num">
                      {pF?.calificacion
                        ? <span className={`badge ${colorFor(pF.calificacion)}`}>{pF.calificacion}</span>
                        : <span className="muted">—</span>}
                    </td>
                    <td className="num">
                      <span className={`badge ${colorFor(ultima?.calificacion ?? null)}`}>
                        {desempeno(ultima?.calificacion ?? null)}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Cards view */}
      {vista === 'tarjetas' && (
        <div className="sii-grid g-3">
          {materiasFiltradas.map(m => {
            const ultima = [...m.calificaiones].reverse().find(c => c.calificacion)
            return (
              <div key={m.materia.id_grupo} className="card card-pad">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{m.materia.nombre_materia}</div>
                    <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>{m.materia.clave_materia}</div>
                  </div>
                  <span className={`badge ${colorFor(ultima?.calificacion ?? null)}`} style={{ fontSize: 15, fontWeight: 700 }}>
                    {ultima?.calificacion ?? '—'}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {m.calificaiones.map(c => (
                    <div key={c.id_calificacion} style={{ textAlign: 'center' }}>
                      <div className="muted" style={{ fontSize: 10, marginBottom: 2 }}>P{c.numero_calificacion}</div>
                      <span className={`badge ${colorFor(c.calificacion)}`}>{c.calificacion ?? '—'}</span>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 10 }}>
                  <span className={`badge ${colorFor(ultima?.calificacion ?? null)}`}>
                    {desempeno(ultima?.calificacion ?? null)}
                  </span>
                </div>
              </div>
            )
          })}
          {materiasFiltradas.length === 0 && (
            <div className="muted" style={{ textAlign: 'center', padding: '24px 0', gridColumn: '1/-1' }}>
              Sin resultados
            </div>
          )}
        </div>
      )}
    </DashboardShell>
  )
}
