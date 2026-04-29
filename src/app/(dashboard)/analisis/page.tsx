'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import DashboardShell from '@/components/layout/DashboardShell'
import { IcoAward, IcoBook, IcoBarChart, IcoTrendUp } from '@/components/ui/Icons'
import { getToken } from '@/lib/auth/session'
import { getKardex } from '@/lib/api/estudiante'
import { useStudent } from '@/lib/context/StudentContext'
import type { KardexData } from '@/types/api'

function badgeClass(n: number) {
  if (n >= 90) return 'good'
  if (n >= 70) return 'warn'
  return 'bad'
}

export default function AnalisisPage() {
  const router = useRouter()
  const { student } = useStudent()
  const [loading, setLoading] = useState(true)
  const [kardex, setKardex] = useState<KardexData | null>(null)

  useEffect(() => {
    const token = getToken()
    if (!token) { router.replace('/login'); return }
    getKardex(token)
      .then(setKardex)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [router])

  const items = kardex?.kardex ?? []
  const numeric = items.filter(i => !isNaN(Number(i.calificacion)) && Number(i.calificacion) > 0)

  const semestres = useMemo(() => {
    const map = new Map<number, number[]>()
    for (const item of numeric) {
      if (!map.has(item.semestre)) map.set(item.semestre, [])
      map.get(item.semestre)!.push(Number(item.calificacion))
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a - b)
      .map(([sem, cals]) => ({
        semestre: sem,
        promedio: cals.reduce((a, b) => a + b, 0) / cals.length,
        materias: cals.length,
      }))
  }, [numeric])

  const distribucion = useMemo(() => {
    const ranges = [
      { label: '90 – 100', min: 90, max: 100, color: 'var(--green-700)' },
      { label: '80 – 89',  min: 80, max: 89,  color: '#16a34a' },
      { label: '70 – 79',  min: 70, max: 79,  color: 'var(--gold-500)' },
      { label: '60 – 69',  min: 60, max: 69,  color: '#ea580c' },
      { label: 'Menos de 60', min: 0, max: 59, color: 'var(--red)' },
    ]
    const total = numeric.length || 1
    return ranges.map(r => {
      const count = numeric.filter(i => {
        const n = Number(i.calificacion)
        return n >= r.min && n <= r.max
      }).length
      return { ...r, count, pct: (count / total) * 100 }
    })
  }, [numeric])

  const sorted = useMemo(() => [...numeric].sort((a, b) => Number(b.calificacion) - Number(a.calificacion)), [numeric])
  const mejores = sorted.slice(0, 5)
  const peores = [...sorted].reverse().slice(0, 5)

  const promedioGeneral = numeric.length
    ? (numeric.reduce((a, b) => a + Number(b.calificacion), 0) / numeric.length).toFixed(1)
    : '—'
  // Fuente autorizada: campo del endpoint de perfil, no derivado del kardex
  const reprobadas = Number(student?.materias_reprobadas || 0)

  const mejorSem = semestres.length
    ? semestres.reduce((a, b) => a.promedio > b.promedio ? a : b)
    : null

  // SVG line chart
  const chartW = 480
  const chartH = 130
  const padX = 32
  const padY = 20
  const promediosYArr = semestres.map(s => s.promedio)
  const minY = Math.min(...promediosYArr, 65)
  const maxY = Math.max(...promediosYArr, 100)
  const pts = semestres.map((s, i) => {
    const x = padX + (i / Math.max(semestres.length - 1, 1)) * (chartW - padX * 2)
    const y = padY + (1 - (s.promedio - minY) / (maxY - minY)) * (chartH - padY * 2)
    return { x, y, s }
  })
  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
  const areaPath = pts.length > 0
    ? `${linePath} L${pts[pts.length - 1].x},${chartH - padY} L${pts[0].x},${chartH - padY} Z`
    : ''

  if (loading) {
    return (
      <DashboardShell crumb="Análisis">
        <div className="pagehead">
          <div>
            <div className="eyebrow">Herramientas · Análisis</div>
            <h1>Cargando análisis…</h1>
          </div>
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell crumb="Análisis">
      <div className="pagehead">
        <div>
          <div className="eyebrow">Herramientas · Análisis</div>
          <h1>Análisis de rendimiento</h1>
          <p className="sub">Historial académico completo · {items.length} materias registradas</p>
        </div>
      </div>

      <div className="sii-grid g-4">
        <div className="stat dark">
          <div className="accent"><IcoAward size={14} /></div>
          <div className="lbl">Promedio histórico</div>
          <div className="val">{promedioGeneral}</div>
          <div className="sub">sobre {numeric.length} materias con calificación</div>
        </div>
        <div className="stat">
          <div className="accent"><IcoBook size={14} /></div>
          <div className="lbl">Total materias</div>
          <div className="val">{items.length}</div>
          <div className="sub">en {semestres.length} semestre{semestres.length !== 1 ? 's' : ''}</div>
        </div>
        <div className="stat">
          <div className="accent" style={{ color: 'var(--gold-500)' }}><IcoTrendUp size={14} /></div>
          <div className="lbl">Mejor semestre</div>
          <div className="val">{mejorSem ? `Sem. ${mejorSem.semestre}` : '—'}</div>
          <div className="sub">{mejorSem ? `${mejorSem.promedio.toFixed(1)} de promedio` : ''}</div>
        </div>
        <div className="stat">
          <div className="accent" style={reprobadas > 0 ? { color: 'var(--red)' } : {}}><IcoBarChart size={14} /></div>
          <div className="lbl">Materias reprobadas</div>
          <div className="val" style={reprobadas > 0 ? { color: 'var(--red)' } : {}}>{reprobadas}</div>
          <div className="sub">en toda la carrera</div>
        </div>
      </div>

      <div style={{ height: 16 }} />

      <div className="sii-grid g-2-1" style={{ alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Line chart */}
          <div className="card card-pad">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3>Evolución del promedio</h3>
              <div className="muted" style={{ fontSize: 12 }}>por semestre</div>
            </div>
            {semestres.length >= 2 ? (
              <div style={{ overflowX: 'auto' }}>
                <svg
                  viewBox={`0 0 ${chartW} ${chartH}`}
                  style={{ display: 'block', width: '100%', minWidth: 280, height: 'auto' }}
                >
                  {[70, 80, 90, 100].filter(v => v >= Math.floor(minY / 10) * 10).map(v => {
                    const y = padY + (1 - (v - minY) / (maxY - minY)) * (chartH - padY * 2)
                    if (y < padY || y > chartH - padY) return null
                    return (
                      <g key={v}>
                        <line x1={padX} y1={y} x2={chartW - padX} y2={y} stroke="var(--line)" strokeDasharray="3,3" />
                        <text x={padX - 4} y={y + 3.5} fontSize={8} fill="var(--ink-400)" textAnchor="end">{v}</text>
                      </g>
                    )
                  })}
                  {areaPath && (
                    <path d={areaPath} fill="var(--green-900)" fillOpacity={0.07} />
                  )}
                  <path d={linePath} fill="none" stroke="var(--green-700)" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
                  {pts.map((p, i) => (
                    <g key={i}>
                      <circle cx={p.x} cy={p.y} r={4.5} fill="var(--green-700)" stroke="var(--white)" strokeWidth={2} />
                      <text x={p.x} y={chartH - 4} fontSize={8} fill="var(--ink-400)" textAnchor="middle">S{p.s.semestre}</text>
                      <text x={p.x} y={p.y - 8} fontSize={8} fill="var(--green-800)" textAnchor="middle" fontWeight="700">
                        {p.s.promedio.toFixed(1)}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>
            ) : (
              <div className="muted" style={{ fontSize: 13, textAlign: 'center', padding: '24px 0' }}>
                Se necesitan al menos 2 semestres de datos para mostrar la evolución.
              </div>
            )}
          </div>

          {/* Distribution */}
          <div className="card card-pad">
            <h3 style={{ marginBottom: 16 }}>Distribución de calificaciones</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {distribucion.map(r => (
                <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 72, fontSize: 11, fontWeight: 600, color: r.color, flexShrink: 0 }}>{r.label}</div>
                  <div style={{ flex: 1, height: 10, background: 'var(--line)', borderRadius: 5, overflow: 'hidden' }}>
                    <div style={{
                      width: `${r.pct}%`, height: '100%',
                      background: r.color, borderRadius: 5,
                      transition: 'width .6s ease',
                    }} />
                  </div>
                  <div style={{ width: 26, fontSize: 12, fontWeight: 700, color: r.count > 0 ? r.color : 'var(--ink-400)', textAlign: 'right', flexShrink: 0 }}>
                    {r.count}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Semestre breakdown */}
          {semestres.length > 0 && (
            <div className="card">
              <div className="card-head"><h3>Detalle por semestre</h3></div>
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Semestre</th>
                    <th style={{ textAlign: 'center' }}>Materias</th>
                    <th style={{ textAlign: 'right' }}>Promedio</th>
                  </tr>
                </thead>
                <tbody>
                  {semestres.map(s => (
                    <tr key={s.semestre}>
                      <td><b style={{ fontSize: 13 }}>Semestre {s.semestre}</b></td>
                      <td className="muted" style={{ textAlign: 'center', fontSize: 12 }}>{s.materias}</td>
                      <td className="num">
                        <span className={`badge ${badgeClass(s.promedio)}`}>{s.promedio.toFixed(1)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div className="card-head"><h3>Mejores calificaciones</h3></div>
            <div>
              {mejores.map((item, i) => (
                <div key={`${item.clave_materia}-b${i}`} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 22px', borderBottom: '1px solid var(--line)' }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%',
                    background: 'var(--green-900)', color: '#fff',
                    fontSize: 10, fontWeight: 700, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.nombre_materia}
                    </div>
                    <div className="muted" style={{ fontSize: 11 }}>Sem. {item.semestre}</div>
                  </div>
                  <span className={`badge ${badgeClass(Number(item.calificacion))}`}>{item.calificacion}</span>
                </div>
              ))}
            </div>
          </div>

          {peores.length > 0 && (
            <div className="card">
              <div className="card-head"><h3>Menor calificación</h3></div>
              <div>
                {peores.map((item, i) => (
                  <div key={`${item.clave_materia}-w${i}`} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 22px', borderBottom: '1px solid var(--line)' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.nombre_materia}
                      </div>
                      <div className="muted" style={{ fontSize: 11 }}>Sem. {item.semestre}</div>
                    </div>
                    <span className={`badge ${badgeClass(Number(item.calificacion))}`}>{item.calificacion}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {reprobadas > 0 && (
            <div className="card card-pad" style={{ borderColor: 'var(--red)', background: 'rgba(220,38,38,.04)' }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--red)', flexShrink: 0 }} />
                <h3 style={{ fontSize: 14, color: 'var(--red)' }}>{reprobadas} materia{reprobadas !== 1 ? 's' : ''} reprobada{reprobadas !== 1 ? 's' : ''}</h3>
              </div>
              <p className="muted" style={{ fontSize: 12 }}>
                Consulta el Kardex para ver el detalle por materia y periodo.
              </p>
              <a href="/kardex" className="link" style={{ fontSize: 12, marginTop: 6, display: 'inline-block' }}>
                Ver Kardex →
              </a>
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  )
}
