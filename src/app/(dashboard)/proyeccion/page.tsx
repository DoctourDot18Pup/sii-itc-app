'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import DashboardShell from '@/components/layout/DashboardShell'
import { IcoTarget, IcoAward, IcoGrade, IcoBarChart } from '@/components/ui/Icons'
import { getToken } from '@/lib/auth/session'
import { getCalificaciones } from '@/lib/api/estudiante'
import { useStudent } from '@/lib/context/StudentContext'
import type { CalificacionesPeriodo } from '@/types/api'

function colorFor(n: number): string {
  if (n >= 90) return 'good'
  if (n >= 70) return 'warn'
  return 'bad'
}

export default function ProyeccionPage() {
  const router = useRouter()
  const { student } = useStudent()
  const [loading, setLoading] = useState(true)
  const [periodos, setPeriodos] = useState<CalificacionesPeriodo[]>([])
  const [objetivo, setObjetivo] = useState<number>(85)
  const [notas, setNotas] = useState<Record<string, number | ''>>({})
  const [modo, setModo] = useState<'simulador' | 'necesito'>('simulador')

  useEffect(() => {
    const token = getToken()
    if (!token) { router.replace('/login'); return }
    getCalificaciones(token)
      .then(cals => {
        setPeriodos(cals)
        const initial: Record<string, number | ''> = {}
        const actual = cals[0]
        if (actual) {
          for (const m of actual.materias) {
            const ultima = [...m.calificaiones].reverse().find(c => c.calificacion)
            initial[m.materia.clave_materia] = ultima?.calificacion ? Number(ultima.calificacion) : ''
          }
        }
        setNotas(initial)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [router])

  const periodoActual = periodos[0]

  const resultado = useMemo(() => {
    if (!periodoActual) return null
    const vals = Object.values(notas).filter((v): v is number => v !== '' && !isNaN(Number(v)))
    if (vals.length === 0) return null
    const promedio = vals.reduce((a, b) => a + b, 0) / vals.length
    const aprobadas = vals.filter(v => v >= 70).length
    const reprobadas = vals.filter(v => v < 70).length
    return { promedio: promedio.toFixed(1), aprobadas, reprobadas, total: vals.length }
  }, [notas, periodoActual])

  const necesitanMejora = useMemo(() => {
    if (!periodoActual || !resultado) return []
    return periodoActual.materias
      .filter(m => {
        const v = notas[m.materia.clave_materia]
        return v !== '' && typeof v === 'number' && v < objetivo
      })
      .map(m => {
        const actual = notas[m.materia.clave_materia] as number
        const diferencia = objetivo - actual
        return { nombre: m.materia.nombre_materia, actual, diferencia }
      })
      .sort((a, b) => a.diferencia - b.diferencia)
  }, [periodoActual, notas, objetivo, resultado])

  const necesitoData = useMemo(() => {
    if (!periodoActual) return []
    return periodoActual.materias.map(m => {
      const parciales = [1, 2, 3].map(n => {
        const c = m.calificaiones.find(cc => cc.numero_calificacion === n)
        const val = c?.calificacion ? Number(c.calificacion) : null
        return (val !== null && !isNaN(val) && val > 0) ? val : null
      })
      const known = parciales.filter((v): v is number => v !== null)
      const remaining = 3 - known.length
      const sumKnown = known.reduce((a, b) => a + b, 0)
      const needed = remaining > 0
        ? (objetivo * 3 - sumKnown) / remaining
        : sumKnown / 3
      const estado = remaining === 0 ? 'terminado' as const
        : needed <= 0 ? 'seguro' as const
        : needed > 100 ? 'imposible' as const
        : needed > 90 ? 'dificil' as const
        : 'alcanzable' as const
      return { materia: m.materia, parciales, needed: Math.round(needed * 10) / 10, remaining, estado }
    })
  }, [periodoActual, objetivo])

  if (loading) {
    return (
      <DashboardShell crumb="Proyección">
        <div className="pagehead">
          <div>
            <div className="eyebrow">Herramientas · Proyección</div>
            <h1>Cargando simulador…</h1>
          </div>
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell crumb="Proyección">
      <div className="pagehead">
        <div>
          <div className="eyebrow">Herramientas · Proyección</div>
          <h1>Proyección de promedio</h1>
          <p className="sub">
            {modo === 'simulador'
              ? 'Simula tu rendimiento para el cierre del semestre'
              : 'Calcula qué calificación necesitas en cada parcial para alcanzar tu objetivo'}
          </p>
        </div>
        <div className="actions">
          <button
            className="iconbtn"
            style={modo === 'simulador' ? { background: 'var(--green-900)', color: '#fff', borderColor: 'var(--green-900)' } : {}}
            onClick={() => setModo('simulador')}
          >
            Simulador
          </button>
          <button
            className="iconbtn"
            style={modo === 'necesito' ? { background: 'var(--green-900)', color: '#fff', borderColor: 'var(--green-900)' } : {}}
            onClick={() => setModo('necesito')}
          >
            ¿Qué necesito?
          </button>
        </div>
      </div>

      <div className="sii-grid g-2-1" style={{ alignItems: 'flex-start' }}>
        {/* Simulador */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Objetivo */}
          <div className="card card-pad">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3>Promedio objetivo</h3>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  type="range" min={70} max={100} step={1}
                  value={objetivo}
                  onChange={e => setObjetivo(Number(e.target.value))}
                  style={{ width: 120, accentColor: 'var(--green-800)' }}
                />
                <span style={{
                  fontFamily: 'Source Serif 4, serif', fontSize: 24, fontWeight: 700,
                  color: 'var(--green-800)', minWidth: 48,
                }}>
                  {objetivo}
                </span>
              </div>
            </div>
            <div style={{ height: 8, background: 'var(--line)', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ width: `${((objetivo - 70) / 30) * 100}%`, height: '100%', background: 'linear-gradient(90deg, var(--gold-600), var(--gold-400))', borderRadius: 4 }} />
            </div>
            <div className="muted" style={{ fontSize: 12, marginTop: 6 }}>
              Promedio ponderado actual: {student?.promedio_ponderado}
            </div>
          </div>

          {/* Simulador: tabla de calificaciones editables */}
          {modo === 'simulador' && (
            <div className="card">
              <div className="card-head">
                <h3>Calificaciones simuladas</h3>
                <div className="muted" style={{ fontSize: 12 }}>{periodoActual?.periodo.descripcion_periodo}</div>
              </div>
              <div style={{ padding: '0 0 8px' }}>
                {periodoActual?.materias.map(m => {
                  const val = notas[m.materia.clave_materia]
                  const n = typeof val === 'number' ? val : NaN
                  return (
                    <div key={m.materia.id_grupo} style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      padding: '12px 22px', borderBottom: '1px solid var(--line)',
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{m.materia.nombre_materia}</div>
                        <div className="muted" style={{ fontSize: 12 }}>{m.materia.clave_materia}</div>
                      </div>
                      <input
                        type="number"
                        min={0} max={100} step={1}
                        placeholder="—"
                        value={val === '' ? '' : val}
                        onChange={e => {
                          const raw = e.target.value
                          setNotas(prev => ({
                            ...prev,
                            [m.materia.clave_materia]: raw === '' ? '' : Math.min(100, Math.max(0, Number(raw))),
                          }))
                        }}
                        className="sii-input"
                        style={{ width: 80, textAlign: 'center', padding: '6px 10px' }}
                      />
                      {!isNaN(n) && (
                        <span className={`badge ${colorFor(n)}`} style={{ minWidth: 36, textAlign: 'center' }}>
                          {n >= 70 ? '✓' : '✗'}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ¿Qué necesito?: tabla con parciales reales y mínimo requerido */}
          {modo === 'necesito' && (
            <div className="card" style={{ overflowX: 'auto' }}>
              <div className="card-head">
                <h3>¿Qué necesito?</h3>
                <div className="muted" style={{ fontSize: 12 }}>objetivo: {objetivo}</div>
              </div>
              <table className="tbl" style={{ minWidth: 460 }}>
                <thead>
                  <tr>
                    <th>Materia</th>
                    <th style={{ textAlign: 'center' }}>P1</th>
                    <th style={{ textAlign: 'center' }}>P2</th>
                    <th style={{ textAlign: 'center' }}>P3</th>
                    <th style={{ textAlign: 'right' }}>Necesitas</th>
                  </tr>
                </thead>
                <tbody>
                  {necesitoData.map(d => (
                    <tr key={d.materia.id_grupo}>
                      <td>
                        <b style={{ fontSize: 13 }}>{d.materia.nombre_materia}</b>
                        <div className="muted" style={{ fontSize: 11 }}>{d.materia.clave_materia}</div>
                      </td>
                      {d.parciales.map((v, i) => (
                        <td key={i} style={{ textAlign: 'center' }}>
                          {v !== null
                            ? <span className={`badge ${colorFor(v)}`}>{v}</span>
                            : <span className="muted">—</span>}
                        </td>
                      ))}
                      <td className="num">
                        {d.estado === 'terminado' ? (
                          <span className={`badge ${colorFor(d.needed)}`}>{d.needed.toFixed(0)}</span>
                        ) : d.estado === 'seguro' ? (
                          <span className="badge good" style={{ fontSize: 11 }}>Ya pasas</span>
                        ) : d.estado === 'imposible' ? (
                          <span className="badge bad" style={{ fontSize: 11 }}>Imposible</span>
                        ) : (
                          <span className={`badge ${colorFor(d.needed)}`}>{d.needed.toFixed(0)}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="muted" style={{ fontSize: 11, padding: '8px 22px' }}>
                Promedio de 3 parciales · "Necesitas" = mínimo en parciales pendientes
              </div>
            </div>
          )}
        </div>

        {/* Resultados — cambia según el modo */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Modo simulador */}
          {modo === 'simulador' && (resultado ? (
            <>
              <div className="stat dark">
                <div className="accent"><IcoAward size={14} /></div>
                <div className="lbl">Promedio proyectado</div>
                <div className="val">{resultado.promedio}</div>
                <div className="sub">
                  {Number(resultado.promedio) >= objetivo
                    ? `✓ Alcanzas tu objetivo de ${objetivo}`
                    : `${(objetivo - Number(resultado.promedio)).toFixed(1)} puntos para tu objetivo`}
                </div>
              </div>
              <div className="stat">
                <div className="accent"><IcoTarget size={14} /></div>
                <div className="lbl">Materias aprobadas</div>
                <div className="val">{resultado.aprobadas}</div>
                <div className="sub">de {resultado.total} con calificación</div>
              </div>
              {resultado.reprobadas > 0 && (
                <div className="stat">
                  <div className="accent" style={{ color: 'var(--red)' }}><IcoTarget size={14} /></div>
                  <div className="lbl">En riesgo</div>
                  <div className="val" style={{ color: 'var(--red)' }}>{resultado.reprobadas}</div>
                  <div className="sub">materias por debajo de 70</div>
                </div>
              )}
              {necesitanMejora.length > 0 && (
                <div className="card card-pad">
                  <h3 style={{ marginBottom: 12, fontSize: 14 }}>Por debajo del objetivo</h3>
                  {necesitanMejora.map(m => (
                    <div key={m.nombre} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--line)' }}>
                      <div style={{ fontSize: 12, fontWeight: 600 }}>{m.nombre}</div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span className="badge warn">{m.actual}</span>
                        <span className="muted" style={{ fontSize: 11 }}>+{m.diferencia} pts</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="card card-pad" style={{ textAlign: 'center', color: 'var(--ink-500)' }}>
              <IcoTarget size={32} style={{ opacity: .3, margin: '12px auto' }} />
              <p style={{ fontSize: 13 }}>Ingresa calificaciones en el simulador para ver la proyección.</p>
            </div>
          ))}

          {/* Modo necesito: resumen de estados */}
          {modo === 'necesito' && necesitoData.length > 0 && (() => {
            const seguras    = necesitoData.filter(d => d.estado === 'seguro' || d.estado === 'terminado')
            const alcanzables = necesitoData.filter(d => d.estado === 'alcanzable')
            const dificiles  = necesitoData.filter(d => d.estado === 'dificil')
            const imposibles = necesitoData.filter(d => d.estado === 'imposible')
            return (
              <>
                {seguras.length > 0 && (
                  <div className="stat" style={{ borderColor: 'var(--green-700)' }}>
                    <div className="accent" style={{ color: 'var(--green-700)' }}><IcoAward size={14} /></div>
                    <div className="lbl">Ya aprobadas</div>
                    <div className="val" style={{ color: 'var(--green-700)' }}>{seguras.length}</div>
                    <div className="sub">con calificaciones actuales</div>
                  </div>
                )}
                {alcanzables.length > 0 && (
                  <div className="stat">
                    <div className="accent"><IcoTarget size={14} /></div>
                    <div className="lbl">Alcanzables</div>
                    <div className="val">{alcanzables.length}</div>
                    <div className="sub">puedes llegar a {objetivo}</div>
                  </div>
                )}
                {dificiles.length > 0 && (
                  <div className="stat" style={{ borderColor: 'var(--gold-500)' }}>
                    <div className="accent" style={{ color: 'var(--gold-500)' }}><IcoTarget size={14} /></div>
                    <div className="lbl">Exigentes</div>
                    <div className="val" style={{ color: 'var(--gold-500)' }}>{dificiles.length}</div>
                    <div className="sub">necesitas más de 90</div>
                  </div>
                )}
                {imposibles.length > 0 && (
                  <div className="stat" style={{ borderColor: 'var(--red)' }}>
                    <div className="accent" style={{ color: 'var(--red)' }}><IcoTarget size={14} /></div>
                    <div className="lbl">Imposibles para {objetivo}</div>
                    <div className="val" style={{ color: 'var(--red)' }}>{imposibles.length}</div>
                    <div className="sub">baja el objetivo o enfócate en pasar</div>
                  </div>
                )}
                {(dificiles.length > 0 || imposibles.length > 0) && (
                  <div className="card card-pad">
                    <h3 style={{ marginBottom: 10, fontSize: 14 }}>Requieren atención</h3>
                    {[...dificiles, ...imposibles].map(d => (
                      <div key={d.materia.id_grupo} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid var(--line)' }}>
                        <div style={{ fontSize: 12, fontWeight: 600 }}>{d.materia.nombre_materia}</div>
                        <span className={`badge ${d.estado === 'imposible' ? 'bad' : 'warn'}`} style={{ fontSize: 11 }}>
                          {d.estado === 'imposible' ? 'Imposible' : `${d.needed.toFixed(0)} pts`}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )
          })()}
        </div>
      </div>
      {/* Calculadora de titulación */}
      {student && (() => {
        const TOTAL_CREDITOS = 260
        const creditosActuales = Number(student.creditos_acumulados) || 0
        const promedioActual = Number(student.promedio_ponderado) || 0
        const creditosRestantes = Math.max(TOTAL_CREDITOS - creditosActuales, 0)
        const avance = Math.round((creditosActuales / TOTAL_CREDITOS) * 100)

        const metas = [
          { label: 'Mención honorífica', target: 95, color: 'var(--gold-500)', badge: 'gold' },
          { label: 'Excelencia', target: 90, color: 'var(--green-700)', badge: 'good' },
          { label: 'Muy bueno', target: 85, color: '#16a34a', badge: 'good' },
          { label: 'Titulación base', target: 80, color: 'var(--gold-600)', badge: 'warn' },
        ] as const

        return (
          <div style={{ marginTop: 24 }}>
            <div style={{ marginBottom: 14 }}>
              <div className="eyebrow" style={{ marginBottom: 4 }}>Calculadora</div>
              <h2 style={{ fontSize: 18, marginBottom: 4 }}>Proyección para titulación</h2>
              <p className="sub" style={{ fontSize: 13 }}>
                Con {creditosActuales} créditos ({avance}% del plan) y promedio ponderado actual de{' '}
                <strong>{student.promedio_ponderado}</strong> — ¿qué necesitas para titularte?
              </p>
            </div>

            {creditosRestantes <= 0 ? (
              <div className="card card-pad" style={{ textAlign: 'center' }}>
                <IcoGrade size={28} style={{ margin: '0 auto 8px', color: 'var(--green-700)' }} />
                <p style={{ fontWeight: 600 }}>Plan de estudios completado — estás listo para titular.</p>
              </div>
            ) : (
              <div className="sii-grid g-4">
                {metas.map(m => {
                  const needed = creditosRestantes > 0
                    ? (m.target * TOTAL_CREDITOS - creditosActuales * promedioActual) / creditosRestantes
                    : promedioActual
                  const alcanzable = needed <= 100
                  const yaAlcanzado = promedioActual >= m.target
                  return (
                    <div key={m.target} className="stat" style={yaAlcanzado ? { borderColor: m.color, background: `${m.color}09` } : {}}>
                      <div className="accent" style={{ color: m.color }}>
                        <IcoBarChart size={14} />
                      </div>
                      <div className="lbl">{m.label}</div>
                      <div className="val" style={{ color: yaAlcanzado ? m.color : alcanzable ? 'var(--ink-900)' : 'var(--red)', fontSize: 26 }}>
                        {yaAlcanzado ? '✓' : alcanzable ? needed.toFixed(1) : '—'}
                      </div>
                      <div className="sub">
                        {yaAlcanzado
                          ? `Ya superaste ${m.target} de promedio`
                          : alcanzable
                          ? `promedio necesario en los ${creditosRestantes} créditos restantes`
                          : 'No alcanzable — requeriría más de 100'}
                      </div>
                      {!yaAlcanzado && alcanzable && (
                        <div style={{ marginTop: 8 }}>
                          <span className={`badge ${m.badge}`} style={{ fontSize: 11 }}>
                            objetivo: {m.target}
                          </span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            <div className="muted" style={{ fontSize: 11, marginTop: 10 }}>
              * Cálculo basado en {TOTAL_CREDITOS} créditos totales del plan. El promedio necesario es el mínimo uniforme requerido en las materias restantes.
            </div>
          </div>
        )
      })()}
    </DashboardShell>
  )
}
