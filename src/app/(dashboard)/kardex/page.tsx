'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import DashboardShell from '@/components/layout/DashboardShell'
import { IcoKardex, IcoAward, IcoBook, IcoChev } from '@/components/ui/Icons'
import { getToken } from '@/lib/auth/session'
import { getKardex } from '@/lib/api/estudiante'
import type { KardexData, KardexItem } from '@/types/api'

function colorFor(cal: string): string {
  const n = Number(cal)
  if (isNaN(n)) return 'neutral'
  if (n >= 90) return 'good'
  if (n >= 70) return 'warn'
  return 'bad'
}

export default function KardexPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [kardex, setKardex] = useState<KardexData | null>(null)
  const [abiertos, setAbiertos] = useState<Set<number>>(new Set([1]))

  useEffect(() => {
    const token = getToken()
    if (!token) { router.replace('/login'); return }
    getKardex(token)
      .then(data => {
        setKardex(data)
        const primero = data.kardex[0]?.semestre ?? 1
        setAbiertos(new Set([primero]))
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [router])

  const porSemestre = useMemo(() => {
    if (!kardex) return []
    const map = new Map<number, KardexItem[]>()
    for (const item of kardex.kardex) {
      const sem = item.semestre
      if (!map.has(sem)) map.set(sem, [])
      map.get(sem)!.push(item)
    }
    return Array.from(map.entries()).sort((a, b) => a[0] - b[0])
  }, [kardex])

  const stats = useMemo(() => {
    if (!kardex) return { aprobadas: 0, reprobadas: 0, promedio: '—', creditos: 0 }
    const items = kardex.kardex
    const aprobadas = items.filter(i => Number(i.calificacion) >= 70).length
    const reprobadas = items.filter(i => Number(i.calificacion) < 70 && !isNaN(Number(i.calificacion))).length
    const calsValidas = items.filter(i => !isNaN(Number(i.calificacion)) && Number(i.calificacion) > 0)
    const promedio = calsValidas.length
      ? (calsValidas.reduce((a, b) => a + Number(b.calificacion), 0) / calsValidas.length).toFixed(1)
      : '—'
    const creditos = items
      .filter(i => Number(i.calificacion) >= 70)
      .reduce((a, b) => a + Number(b.creditos), 0)
    return { aprobadas, reprobadas, promedio, creditos }
  }, [kardex])

  function toggle(sem: number) {
    setAbiertos(prev => {
      const next = new Set(prev)
      if (next.has(sem)) next.delete(sem)
      else next.add(sem)
      return next
    })
  }

  if (loading) {
    return (
      <DashboardShell crumb="Kardex">
        <div className="pagehead">
          <div>
            <div className="eyebrow">Académico · Kardex</div>
            <h1>Cargando kardex…</h1>
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
    <DashboardShell crumb="Kardex">
      <div className="pagehead">
        <div>
          <div className="eyebrow">Académico · Kardex</div>
          <h1>Kardex académico</h1>
          <p className="sub">Historial completo de materias cursadas</p>
        </div>
      </div>

      {/* Stats */}
      <div className="sii-grid g-4">
        <div className="stat dark">
          <div className="accent"><IcoAward size={14} /></div>
          <div className="lbl">Promedio general</div>
          <div className="val">{stats.promedio}</div>
          <div className="sub">Todas las materias</div>
        </div>
        <div className="stat">
          <div className="accent"><IcoBook size={14} /></div>
          <div className="lbl">Créditos aprobados</div>
          <div className="val">{stats.creditos}</div>
          <div className="sub">
            <div style={{ height: 6, background: 'var(--line)', borderRadius: 3, marginTop: 6, overflow: 'hidden' }}>
              <div style={{ width: `${kardex ? kardex.porcentaje_avance : 0}%`, height: '100%', background: 'linear-gradient(90deg, var(--green-700), var(--gold-500))' }} />
            </div>
          </div>
        </div>
        <div className="stat">
          <div className="accent"><IcoKardex size={14} /></div>
          <div className="lbl">Materias aprobadas</div>
          <div className="val">{stats.aprobadas}</div>
          <div className="sub">de {kardex?.kardex.length ?? 0} registradas</div>
        </div>
        <div className="stat">
          <div className="accent"><IcoBook size={14} /></div>
          <div className="lbl">Avance del plan</div>
          <div className="val">{kardex ? Math.round(kardex.porcentaje_avance) : 0}%</div>
          <div className="sub">{stats.reprobadas} reprobadas</div>
        </div>
      </div>

      <div style={{ height: 16 }} />

      {/* Accordion by semester */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {porSemestre.map(([sem, materias]) => {
          const abierto = abiertos.has(sem)
          const aprobadas = materias.filter(m => Number(m.calificacion) >= 70).length
          const credSem = materias.filter(m => Number(m.calificacion) >= 70).reduce((a, b) => a + Number(b.creditos), 0)
          return (
            <div key={sem} className="card" style={{ overflow: 'hidden' }}>
              <button
                onClick={() => toggle(sem)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, width: '100%',
                  padding: '16px 20px', background: 'none', border: 0, cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'var(--green-900)', color: 'var(--gold-400)', fontFamily: 'Source Serif 4, serif',
                  fontWeight: 700, fontSize: 16, flexShrink: 0,
                }}>
                  {sem}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink-900)' }}>Semestre {sem}</div>
                  <div className="muted" style={{ fontSize: 12 }}>{materias.length} materias · {aprobadas} aprobadas · {credSem} créditos</div>
                </div>
                <IcoChev
                  size={16}
                  style={{ opacity: 0.4, transform: abierto ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform .2s' }}
                />
              </button>
              {abierto && (
                <table className="tbl">
                  <thead>
                    <tr>
                      <th>Materia</th>
                      <th>Clave</th>
                      <th>Periodo</th>
                      <th style={{ textAlign: 'right' }}>Créditos</th>
                      <th style={{ textAlign: 'right' }}>Calificación</th>
                      <th style={{ textAlign: 'right' }}>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {materias.map((m, i) => (
                      <tr key={i}>
                        <td><b style={{ fontSize: 13 }}>{m.nombre_materia}</b></td>
                        <td className="muted" style={{ fontSize: 12 }}>{m.clave_materia}</td>
                        <td className="muted" style={{ fontSize: 12 }}>{m.periodo}</td>
                        <td className="num">{m.creditos}</td>
                        <td className="num">
                          <span className={`badge ${colorFor(m.calificacion)}`}>{m.calificacion || '—'}</span>
                        </td>
                        <td className="num">
                          <span className={`badge ${Number(m.calificacion) >= 70 ? 'good' : 'bad'}`}>
                            {Number(m.calificacion) >= 70 ? 'Aprobado' : 'Reprobado'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )
        })}
      </div>
    </DashboardShell>
  )
}
