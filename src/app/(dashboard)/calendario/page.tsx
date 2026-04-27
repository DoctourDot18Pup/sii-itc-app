'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import DashboardShell from '@/components/layout/DashboardShell'
import { IcoCalendar, IcoX } from '@/components/ui/Icons'
import { getToken } from '@/lib/auth/session'
import { getEstudiante } from '@/lib/api/estudiante'
import { supabase } from '@/lib/supabase/client'
import type { CalendarioEvento, CalendarioEventoInsert } from '@/types/calendario'

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const DIAS_SEMANA = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']

export default function CalendarioPage() {
  const router = useRouter()
  const [numeroControl, setNumeroControl] = useState<string | null>(null)
  const [eventos, setEventos] = useState<CalendarioEvento[]>([])
  const [hoy] = useState(new Date())
  const [mes, setMes] = useState(hoy.getMonth())
  const [anio, setAnio] = useState(hoy.getFullYear())
  const [modal, setModal] = useState(false)
  const [diaSeleccionado, setDiaSeleccionado] = useState<Date | null>(null)
  const [form, setForm] = useState({ titulo: '', descripcion: '', fecha_fin: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const token = getToken()
    if (!token) { router.replace('/login'); return }
    getEstudiante(token)
      .then(est => {
        setNumeroControl(est.numero_control)
        return supabase
          .from('calendario_eventos')
          .select('*')
          .eq('numero_control', est.numero_control)
          .order('fecha_inicio', { ascending: true })
      })
      .then(({ data }) => { if (data) setEventos(data as CalendarioEvento[]) })
      .catch(console.error)
  }, [router])

  const diasDelMes = useMemo(() => {
    const primer = new Date(anio, mes, 1)
    const inicio = primer.getDay()
    const total = new Date(anio, mes + 1, 0).getDate()
    const dias: (number | null)[] = Array(inicio).fill(null)
    for (let d = 1; d <= total; d++) dias.push(d)
    return dias
  }, [mes, anio])

  function eventosDelDia(dia: number): CalendarioEvento[] {
    const isoFecha = `${anio}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
    return eventos.filter(e => e.fecha_inicio.startsWith(isoFecha))
  }

  function abrirModal(dia: number) {
    const d = new Date(anio, mes, dia)
    setDiaSeleccionado(d)
    setForm({ titulo: '', descripcion: '', fecha_fin: '' })
    setModal(true)
  }

  async function guardarEvento() {
    if (!form.titulo.trim() || !diaSeleccionado || !numeroControl) return
    setSaving(true)
    const isoFechaInicio = `${diaSeleccionado.getFullYear()}-${String(diaSeleccionado.getMonth() + 1).padStart(2, '0')}-${String(diaSeleccionado.getDate()).padStart(2, '0')}T08:00:00`
    const insert: CalendarioEventoInsert = {
      titulo: form.titulo.trim(),
      descripcion: form.descripcion.trim() || undefined,
      fecha_inicio: isoFechaInicio,
      fecha_fin: form.fecha_fin || undefined,
      numero_control: numeroControl,
    }
    const { data, error } = await supabase.from('calendario_eventos').insert(insert).select().single()
    if (!error && data) {
      setEventos(prev => [...prev, data as CalendarioEvento].sort((a, b) => a.fecha_inicio.localeCompare(b.fecha_inicio)))
      setModal(false)
    }
    setSaving(false)
  }

  async function eliminarEvento(id: string) {
    await supabase.from('calendario_eventos').delete().eq('id', id)
    setEventos(prev => prev.filter(e => e.id !== id))
  }

  const eventosProximos = eventos.filter(e => new Date(e.fecha_inicio) >= new Date()).slice(0, 5)

  return (
    <DashboardShell crumb="Calendario">
      <div className="pagehead">
        <div>
          <div className="eyebrow">Académico · Calendario</div>
          <h1>Calendario</h1>
          <p className="sub">Agenda personal y eventos académicos</p>
        </div>
      </div>

      <div className="sii-grid g-2-1" style={{ alignItems: 'flex-start' }}>
        {/* Calendario */}
        <div className="card card-pad">
          {/* Navegación de mes */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <button className="iconbtn" onClick={() => {
              if (mes === 0) { setMes(11); setAnio(a => a - 1) } else setMes(m => m - 1)
            }}>←</button>
            <h3 style={{ margin: 0, fontFamily: 'Source Serif 4, serif' }}>{MESES[mes]} {anio}</h3>
            <button className="iconbtn" onClick={() => {
              if (mes === 11) { setMes(0); setAnio(a => a + 1) } else setMes(m => m + 1)
            }}>→</button>
          </div>

          {/* Grid de días */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
            {DIAS_SEMANA.map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: 11, color: 'var(--ink-500)', fontWeight: 600, padding: '4px 0', textTransform: 'uppercase', letterSpacing: '.05em' }}>
                {d}
              </div>
            ))}
            {diasDelMes.map((dia, i) => {
              if (dia === null) return <div key={`empty-${i}`} />
              const esHoy = dia === hoy.getDate() && mes === hoy.getMonth() && anio === hoy.getFullYear()
              const evs = eventosDelDia(dia)
              return (
                <button
                  key={dia}
                  onClick={() => abrirModal(dia)}
                  style={{
                    border: esHoy ? '2px solid var(--green-800)' : '1px solid transparent',
                    borderRadius: 8, padding: '6px 4px', cursor: 'pointer',
                    background: esHoy ? 'var(--green-900)' : 'transparent',
                    color: esHoy ? '#fff' : 'var(--ink-900)',
                    position: 'relative', minHeight: 44, textAlign: 'center',
                    transition: 'background .15s',
                  }}
                >
                  <div style={{ fontWeight: esHoy ? 700 : 400, fontSize: 14 }}>{dia}</div>
                  {evs.length > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 2, marginTop: 2 }}>
                      {evs.slice(0, 3).map((_, j) => (
                        <div key={j} style={{ width: 4, height: 4, borderRadius: 2, background: esHoy ? 'var(--gold-400)' : 'var(--green-700)' }} />
                      ))}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Próximos eventos */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="card">
            <div className="card-head">
              <h3>Próximos eventos</h3>
              <IcoCalendar size={16} style={{ opacity: .4 }} />
            </div>
            {eventosProximos.length === 0 && (
              <div className="muted" style={{ padding: '24px 20px', fontSize: 13, textAlign: 'center' }}>
                Sin eventos próximos.<br />Haz clic en un día para agregar uno.
              </div>
            )}
            {eventosProximos.map(e => {
              const fecha = new Date(e.fecha_inicio)
              return (
                <div key={e.id} style={{ padding: '12px 20px', borderBottom: '1px solid var(--line)', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <div style={{ width: 40, textAlign: 'center', flexShrink: 0 }}>
                    <div style={{ fontSize: 11, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '.1em' }}>
                      {MESES[fecha.getMonth()].slice(0, 3)}
                    </div>
                    <div style={{ fontFamily: 'Source Serif 4, serif', fontSize: 18, fontWeight: 700, color: 'var(--green-800)', lineHeight: 1 }}>
                      {fecha.getDate()}
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{e.titulo}</div>
                    {e.descripcion && <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>{e.descripcion}</div>}
                  </div>
                  <button
                    onClick={() => eliminarEvento(e.id)}
                    style={{ background: 'none', border: 0, cursor: 'pointer', color: 'var(--ink-400)', padding: 4 }}
                  >
                    <IcoX size={14} />
                  </button>
                </div>
              )
            })}
          </div>

          {/* Stats */}
          <div className="stat">
            <div className="accent"><IcoCalendar size={14} /></div>
            <div className="lbl">Total de eventos</div>
            <div className="val">{eventos.length}</div>
            <div className="sub">en tu calendario</div>
          </div>
        </div>
      </div>

      {/* Modal nuevo evento */}
      {modal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(11,42,26,.6)', zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(2px)',
        }} onClick={() => setModal(false)}>
          <div
            style={{ background: '#fff', borderRadius: 16, padding: 28, width: '90%', maxWidth: 440, boxShadow: '0 20px 60px rgba(0,0,0,.18)' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0 }}>Nuevo evento</h3>
              <button onClick={() => setModal(false)} style={{ background: 'none', border: 0, cursor: 'pointer', color: 'var(--ink-500)' }}>
                <IcoX size={18} />
              </button>
            </div>
            <div className="muted" style={{ marginBottom: 16, fontSize: 13 }}>
              {diaSeleccionado?.toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <div className="field" style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>Título *</label>
              <input
                className="sii-input"
                placeholder="Ej: Parcial 1 de Cálculo"
                value={form.titulo}
                onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))}
              />
            </div>
            <div className="field" style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>Descripción (opcional)</label>
              <input
                className="sii-input"
                placeholder="Notas adicionales…"
                value={form.descripcion}
                onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
              />
            </div>
            <button
              className="btn btn-primary"
              style={{ width: '100%', marginTop: 8 }}
              disabled={saving || !form.titulo.trim()}
              onClick={guardarEvento}
            >
              {saving ? <span className="sii-spinner" /> : 'Guardar evento'}
            </button>
          </div>
        </div>
      )}
    </DashboardShell>
  )
}
