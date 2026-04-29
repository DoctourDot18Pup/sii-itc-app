'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DashboardShell from '@/components/layout/DashboardShell'
import { IcoAward, IcoBook, IcoGrade, IcoUser, IcoDownload, IcoChev, IcoTarget, IcoArrow, IcoBarChart } from '@/components/ui/Icons'
import { getToken } from '@/lib/auth/session'
import { getEstudiante, getCalificaciones, getHorarios } from '@/lib/api/estudiante'
import type { EstudianteData, CalificacionesPeriodo, HorariosPeriodo } from '@/types/api'

function colorFor(cal: string | null): string {
  const n = Number(cal)
  if (!cal || isNaN(n)) return 'neutral'
  if (n >= 90) return 'good'
  if (n >= 70) return 'warn'
  return 'bad'
}

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [student, setStudent] = useState<EstudianteData | null>(null)
  const [periodos, setPeriodos] = useState<CalificacionesPeriodo[]>([])
  const [horarios, setHorarios] = useState<HorariosPeriodo[]>([])

  useEffect(() => {
    const token = getToken()
    if (!token) { router.replace('/login'); return }

    Promise.all([
      getEstudiante(token),
      getCalificaciones(token),
      getHorarios(token),
    ]).then(([est, cals, hors]) => {
      setStudent(est)
      setPeriodos(cals)
      setHorarios(hors)
    }).catch(console.error).finally(() => setLoading(false))
  }, [router])

  const periodoActual = periodos[0]
  const horarioPeriodoActual = horarios[0]
  const pct = student
    ? Math.round((Number(student.creditos_acumulados) / 260) * 100)
    : 0

  const nombre = student?.persona.split(' ')[0] ?? '…'

  const HOY_MAP: Record<number, 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado'> = {
    1: 'lunes', 2: 'martes', 3: 'miercoles', 4: 'jueves', 5: 'viernes', 6: 'sabado',
  }
  const HOY_LABEL: Record<number, string> = {
    0: 'Domingo', 1: 'Lunes', 2: 'Martes', 3: 'Miércoles',
    4: 'Jueves', 5: 'Viernes', 6: 'Sábado',
  }
  const todayIdx = new Date().getDay()
  const todayKey = HOY_MAP[todayIdx]
  const todayLabel = HOY_LABEL[todayIdx]
  const clasesHoy = todayKey
    ? (horarioPeriodoActual?.horario.filter(h => h[todayKey] !== null) ?? [])
    : []

  if (loading) {
    return (
      <DashboardShell crumb="Inicio">
        <div className="pagehead">
          <div>
            <div className="eyebrow">Inicio · Bienvenida</div>
            <h1>Cargando tu información…</h1>
            <p className="sub">Solicitando datos al SII ITC</p>
          </div>
        </div>
        <div className="sii-grid g-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="stat">
              <div className="sk" style={{ height: 12, width: 80 }} />
              <div className="sk" style={{ height: 30, width: 120, marginTop: 10 }} />
              <div className="sk" style={{ height: 10, width: 140, marginTop: 8 }} />
            </div>
          ))}
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell crumb="Inicio">
      <div className="pagehead">
        <div>
          <div className="eyebrow">Inicio · Bienvenida</div>
          <h1>Hola, <em>{nombre}</em>.</h1>
          <p className="sub">
            Semestre {student?.semestre}° · Avance {pct}% de tu plan de estudios.
          </p>
        </div>
        <div className="actions">
          <button className="iconbtn"><IcoDownload size={14} /> Constancia</button>
          <button className="iconbtn" onClick={() => router.push('/calificaciones')}>
            Ver calificaciones <IcoChev size={14} />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="sii-grid g-4">
        <div className="stat dark">
          <div className="accent"><IcoAward size={14} /></div>
          <div className="lbl">Promedio ponderado</div>
          <div className="val">{student?.promedio_ponderado ?? '—'}</div>
          <div className="sub">Promedio aritmético: {student?.promedio_aritmetico}</div>
        </div>
        <div className="stat">
          <div className="accent"><IcoBook size={14} /></div>
          <div className="lbl">Créditos acumulados</div>
          <div className="val">{student?.creditos_acumulados}</div>
          <div className="sub">{pct}% del plan completado</div>
          <div style={{ height: 6, background: 'var(--line)', borderRadius: 3, marginTop: 10, overflow: 'hidden' }}>
            <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, var(--green-700), var(--gold-500))' }} />
          </div>
        </div>
        <div className="stat">
          <div className="accent"><IcoGrade size={14} /></div>
          <div className="lbl">Materias activas</div>
          <div className="val">{periodoActual?.materias.length ?? '—'}</div>
          <div className="sub">{periodoActual?.periodo.descripcion_periodo}</div>
        </div>
        <div className="stat">
          <div className="accent"><IcoUser size={14} /></div>
          <div className="lbl">Materias aprobadas</div>
          <div className="val">{student?.materias_aprobadas}</div>
          <div className="sub">De {student?.materias_cursadas} cursadas</div>
        </div>
      </div>

      <div style={{ height: 16 }} />

      {/* Semáforo académico */}
      {periodoActual && (() => {
        const riesgo = periodoActual.materias.filter(m => {
          const p1 = m.calificaiones.find(c => c.numero_calificacion === 1)
          const p2 = m.calificaiones.find(c => c.numero_calificacion === 2)
          const n1 = p1?.calificacion ? Number(p1.calificacion) : null
          const n2 = p2?.calificacion ? Number(p2.calificacion) : null
          return (n1 !== null && n1 < 70) || (n2 !== null && n2 < 70)
        })
        const advertencia = periodoActual.materias.filter(m => {
          const p1 = m.calificaiones.find(c => c.numero_calificacion === 1)
          const p2 = m.calificaiones.find(c => c.numero_calificacion === 2)
          const n1 = p1?.calificacion ? Number(p1.calificacion) : null
          const n2 = p2?.calificacion ? Number(p2.calificacion) : null
          const enRiesgo = (n1 !== null && n1 < 70) || (n2 !== null && n2 < 70)
          if (enRiesgo) return false
          return (n1 !== null && n1 < 80) || (n2 !== null && n2 < 80)
        })
        if (riesgo.length === 0 && advertencia.length === 0) return null
        return (
          <div className="card card-pad" style={{ marginBottom: 16, borderLeft: `4px solid ${riesgo.length > 0 ? 'var(--red)' : 'var(--gold-500)'}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <IcoBarChart size={15} style={{ color: riesgo.length > 0 ? 'var(--red)' : 'var(--gold-500)' }} />
              <h3 style={{ fontSize: 14 }}>Semáforo académico</h3>
              {riesgo.length > 0 && (
                <span className="badge bad" style={{ fontSize: 10 }}>{riesgo.length} en riesgo</span>
              )}
              {advertencia.length > 0 && (
                <span className="badge warn" style={{ fontSize: 10 }}>{advertencia.length} en atención</span>
              )}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {periodoActual.materias.map(m => {
                const p1 = m.calificaiones.find(c => c.numero_calificacion === 1)
                const p2 = m.calificaiones.find(c => c.numero_calificacion === 2)
                const n1 = p1?.calificacion ? Number(p1.calificacion) : null
                const n2 = p2?.calificacion ? Number(p2.calificacion) : null
                const enRiesgo = (n1 !== null && n1 < 70) || (n2 !== null && n2 < 70)
                const enAtencion = !enRiesgo && ((n1 !== null && n1 < 80) || (n2 !== null && n2 < 80))
                const bg = enRiesgo ? 'rgba(220,38,38,.08)' : enAtencion ? 'rgba(184,151,91,.10)' : 'var(--paper)'
                const border = enRiesgo ? 'var(--red)' : enAtencion ? 'var(--gold-500)' : 'var(--line)'
                const dot = enRiesgo ? 'var(--red)' : enAtencion ? 'var(--gold-500)' : 'var(--green-700)'
                return (
                  <div key={m.materia.id_grupo} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '6px 12px', borderRadius: 8,
                    background: bg, border: `1px solid ${border}`,
                    fontSize: 12,
                  }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: dot, flexShrink: 0 }} />
                    <span style={{ fontWeight: 600 }}>{m.materia.nombre_materia}</span>
                    {n1 !== null && <span className={`badge ${n1 >= 90 ? 'good' : n1 >= 70 ? 'warn' : 'bad'}`} style={{ fontSize: 10, padding: '1px 5px' }}>P1: {n1}</span>}
                    {n2 !== null && <span className={`badge ${n2 >= 90 ? 'good' : n2 >= 70 ? 'warn' : 'bad'}`} style={{ fontSize: 10, padding: '1px 5px' }}>P2: {n2}</span>}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })()}

      <div className="sii-grid g-2-1">
        {/* Calificaciones actuales */}
        <div className="card">
          <div className="card-head">
            <div>
              <h3>Materias del periodo actual</h3>
              <div className="sub">{periodoActual?.periodo.descripcion_periodo}</div>
            </div>
            <a href="/calificaciones" className="link">Ver todas →</a>
          </div>
          <table className="tbl">
            <thead>
              <tr>
                <th>Materia</th>
                <th>Clave</th>
                <th style={{ textAlign: 'right' }}>Parcial 1</th>
                <th style={{ textAlign: 'right' }}>Parcial 2</th>
              </tr>
            </thead>
            <tbody>
              {periodoActual?.materias.map(m => {
                const p1 = m.calificaiones.find(c => c.numero_calificacion === 1)
                const p2 = m.calificaiones.find(c => c.numero_calificacion === 2)
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
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div>
          {/* Mis clases de hoy */}
          <div className="card">
            <div className="card-head">
              <div>
                <h3>Mis clases de hoy</h3>
                <div className="sub">{todayLabel}</div>
              </div>
              <a href="/horarios" className="link">Ver todo →</a>
            </div>
            <div style={{ padding: '4px 0' }}>
              {clasesHoy.length === 0 ? (
                <div style={{ padding: '24px 22px', textAlign: 'center', color: 'var(--ink-400)', fontSize: 13 }}>
                  {!todayKey ? 'Hoy es domingo — sin clases' : 'No tienes clases programadas para hoy'}
                </div>
              ) : (
                clasesHoy.map(h => {
                  const hora = h[todayKey] as string
                  const salon = h[`${todayKey}_clave_salon` as keyof typeof h] as string | null
                  return (
                    <div key={h.id_grupo} style={{ padding: '12px 22px', borderBottom: '1px solid var(--line)', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                      <div style={{ width: 48, textAlign: 'center', flexShrink: 0 }}>
                        <div style={{ fontFamily: 'Source Serif 4, serif', fontSize: 15, fontWeight: 700, color: 'var(--green-800)', lineHeight: 1.2 }}>
                          {hora?.split('-')[0]}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--ink-400)', marginTop: 3 }}>{salon ?? '—'}</div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{h.nombre_materia}</div>
                        <div style={{ fontSize: 12, color: 'var(--ink-500)', marginTop: 2 }}>{h.clave_materia}</div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          <div style={{ height: 16 }} />

          {/* Proyección CTA */}
          <div className="card card-pad" style={{ background: 'var(--green-900)', color: 'var(--cream)', borderColor: 'var(--green-900)' }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(184,151,91,.18)', color: 'var(--gold-400)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <IcoTarget size={18} />
              </div>
              <div>
                <h3 style={{ color: '#fff', fontSize: 15 }}>Proyecta tu promedio</h3>
                <div style={{ fontSize: 12, color: 'rgba(243,234,219,.7)' }}>Calculadora semestral</div>
              </div>
            </div>
            <p style={{ marginTop: 14, color: 'rgba(243,234,219,.78)', fontSize: 13 }}>
              Simula qué calificaciones necesitas para cerrar el semestre con tu promedio objetivo.
            </p>
            <button className="btn btn-gold" style={{ marginTop: 14, width: '100%' }} onClick={() => router.push('/proyeccion')}>
              Abrir simulador <IcoArrow size={14} />
            </button>
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}
