'use client'

import DashboardShell from '@/components/layout/DashboardShell'
import { IcoUser, IcoAward, IcoBook, IcoGrade } from '@/components/ui/Icons'
import { useStudent } from '@/lib/context/StudentContext'

export default function PerfilPage() {
  const { student } = useStudent()

  const pct = student ? Math.round((Number(student.creditos_acumulados) / 260) * 100) : 0
  const initials = student
    ? `${student.persona.charAt(0)}${student.persona.split(' ')[1]?.charAt(0) ?? ''}`
    : '?'

  return (
    <DashboardShell crumb="Mi Perfil">
      <div className="pagehead">
        <div>
          <div className="eyebrow">Principal · Mi Perfil</div>
          <h1>Mi Perfil</h1>
          <p className="sub">Información académica del estudiante</p>
        </div>
      </div>

      {!student ? (
        <div className="sii-grid g-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="stat">
              <div className="sk" style={{ height: 12, width: 80 }} />
              <div className="sk" style={{ height: 30, width: 120, marginTop: 10 }} />
            </div>
          ))}
        </div>
      ) : (
        <div className="sii-grid g-2-1" style={{ alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card card-pad">
              <div style={{ display: 'flex', gap: 20, alignItems: 'center', marginBottom: 24 }}>
                <div style={{
                  width: 72, height: 72, borderRadius: 18, background: 'var(--green-900)',
                  color: 'var(--gold-400)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'Source Serif 4, serif', fontSize: 28, fontWeight: 700, flexShrink: 0,
                }}>
                  {initials}
                </div>
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.2 }}>{student.persona}</h2>
                  <div className="muted" style={{ marginTop: 4, fontSize: 13 }}>{student.email}</div>
                  <div style={{ marginTop: 6 }}>
                    <span className="badge good">Semestre {student.semestre}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {[
                  { lbl: 'Número de control', val: student.numero_control },
                  { lbl: 'Semestre actual', val: `${student.semestre}°` },
                  { lbl: 'Materias cursadas', val: student.materias_cursadas },
                  { lbl: 'Materias aprobadas', val: student.materias_aprobadas },
                  { lbl: 'Materias reprobadas', val: student.materias_reprobadas },
                  { lbl: 'Materias rep. no acreditadas', val: student.num_mat_rep_no_acreditadas },
                ].map(({ lbl, val }) => (
                  <div key={lbl} style={{ padding: '12px 14px', background: 'var(--paper)', borderRadius: 8, border: '1px solid var(--line)' }}>
                    <div className="muted" style={{ fontSize: 11, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.05em' }}>{lbl}</div>
                    <div style={{ fontWeight: 700, fontSize: 16, fontFamily: 'Source Serif 4, serif' }}>{val ?? '—'}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card card-pad">
              <h3 style={{ marginBottom: 16 }}>Avance del plan de estudios</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span className="muted" style={{ fontSize: 13 }}>{student.creditos_acumulados} créditos acumulados</span>
                <span style={{ fontWeight: 700, color: 'var(--green-800)' }}>{pct}%</span>
              </div>
              <div style={{ height: 12, background: 'var(--line)', borderRadius: 6, overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, var(--green-700), var(--gold-500))', borderRadius: 6, transition: 'width .6s' }} />
              </div>
              <div className="muted" style={{ fontSize: 12, marginTop: 8 }}>
                {student.porcentaje_avance}% avance total · {student.percentaje_avance_cursando}% incluyendo materias en curso
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="stat dark">
              <div className="accent"><IcoAward size={14} /></div>
              <div className="lbl">Promedio ponderado</div>
              <div className="val">{student.promedio_ponderado}</div>
              <div className="sub">Promedio aritmético: {student.promedio_aritmetico}</div>
            </div>
            <div className="stat">
              <div className="accent"><IcoBook size={14} /></div>
              <div className="lbl">Créditos acumulados</div>
              <div className="val">{student.creditos_acumulados}</div>
              <div className="sub">de 260 totales</div>
            </div>
            <div className="stat">
              <div className="accent"><IcoGrade size={14} /></div>
              <div className="lbl">Créditos complementarios</div>
              <div className="val">{student.creditos_complementarios}</div>
              <div className="sub">Actividades extracurriculares</div>
            </div>
            <div className="stat">
              <div className="accent"><IcoUser size={14} /></div>
              <div className="lbl">Avance del plan</div>
              <div className="val">{pct}%</div>
              <div className="sub">Plan de estudios vigente</div>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  )
}
