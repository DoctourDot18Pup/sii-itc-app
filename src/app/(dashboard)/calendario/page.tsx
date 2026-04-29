'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import DashboardShell from '@/components/layout/DashboardShell'
import { IcoCalendar, IcoX, IcoBell } from '@/components/ui/Icons'
import { getToken } from '@/lib/auth/session'
import { getEstudiante } from '@/lib/api/estudiante'
import { login } from '@/lib/api/auth'
import { supabase } from '@/lib/supabase/client'
import { useStudent } from '@/lib/context/StudentContext'
import {
  EVENTOS_ACADEMICOS, CATEGORIA_CONFIG,
  type CategoriaEvento,
} from '@/lib/data/calendario-academico'
import type { CalendarioEvento, CalendarioEventoInsert } from '@/types/calendario'

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const DIAS_SEM = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']

interface NotifConfig {
  activo: boolean
  dias_anticipacion: number
  categorias: CategoriaEvento[]
}

export default function CalendarioPage() {
  const router = useRouter()
  const { student: studentCtx } = useStudent()
  const [numeroControl, setNumeroControl] = useState<string | null>(null)
  const [emailEstudiante, setEmailEstudiante] = useState<string>('')
  const [nombreEstudiante, setNombreEstudiante] = useState<string>('')
  const [eventosPersonales, setEventosPersonales] = useState<CalendarioEvento[]>([])
  const [hoy] = useState(new Date())
  const [mes, setMes] = useState(hoy.getMonth())
  const [anio, setAnio] = useState(hoy.getFullYear())
  const [modal, setModal] = useState(false)
  const [diaSeleccionado, setDiaSeleccionado] = useState<Date | null>(null)
  const [formEvento, setFormEvento] = useState({ titulo: '', descripcion: '' })
  const [saving, setSaving] = useState(false)
  const [categoriasActivas, setCategoriasActivas] = useState<Set<CategoriaEvento>>(
    new Set(['evaluacion','suspension','academico','evento','vinculacion'] as CategoriaEvento[])
  )
  const [notifConfig, setNotifConfig] = useState<NotifConfig>({
    activo: false,
    dias_anticipacion: 3,
    categorias: ['evaluacion','suspension','evento'],
  })
  const [savingNotif, setSavingNotif] = useState(false)
  const [notifGuardado, setNotifGuardado] = useState(false)
  const [diaDetalle, setDiaDetalle] = useState<number | null>(null)
  const [errorCarga, setErrorCarga] = useState(false)
  const [pasoModal, setPasoModal] = useState<'form' | 'confirmar'>('form')
  const [confirmPass, setConfirmPass] = useState('')
  const [confirmError, setConfirmError] = useState<string | null>(null)
  const [verifyingPass, setVerifyingPass] = useState(false)
  const [showConfirmPwd, setShowConfirmPwd] = useState(false)

  const TITULO_MAX = 80
  const DESC_MAX = 300

  // Usar datos del contexto si ya están disponibles
  useEffect(() => {
    if (studentCtx) {
      setNumeroControl(studentCtx.numero_control)
      setEmailEstudiante(studentCtx.email)
      setNombreEstudiante(studentCtx.persona)
      return
    }
    const token = getToken()
    if (!token) { router.replace('/login'); return }
    getEstudiante(token).then(est => {
      setNumeroControl(est.numero_control)
      setEmailEstudiante(est.email)
      setNombreEstudiante(est.persona)
    }).catch(console.error)
  }, [router, studentCtx])

  // Cargar eventos personales y configuración de notificaciones
  useEffect(() => {
    if (!numeroControl) return
    Promise.all([
      supabase
        .from('calendario_eventos')
        .select('*')
        .eq('numero_control', numeroControl)
        .order('fecha_inicio', { ascending: true }),
      supabase
        .from('notificaciones_config')
        .select('*')
        .eq('numero_control', numeroControl)
        .maybeSingle(),
    ]).then(([{ data: evs, error: errEvs }, { data: cfg }]) => {
      if (errEvs) { setErrorCarga(true); return }
      if (evs) setEventosPersonales(evs as CalendarioEvento[])
      if (cfg) {
        setNotifConfig({
          activo: cfg.activo,
          dias_anticipacion: cfg.dias_anticipacion,
          categorias: cfg.categorias as CategoriaEvento[],
        })
      }
    }).catch(() => setErrorCarga(true))
  }, [numeroControl])

  // Grid del mes
  const diasDelMes = useMemo(() => {
    const primer = new Date(anio, mes, 1)
    const total = new Date(anio, mes + 1, 0).getDate()
    const grid: (number | null)[] = Array(primer.getDay()).fill(null)
    for (let d = 1; d <= total; d++) grid.push(d)
    return grid
  }, [mes, anio])

  function isoFecha(dia: number) {
    return `${anio}-${String(mes + 1).padStart(2,'0')}-${String(dia).padStart(2,'0')}`
  }

  function eventosOficialesDelDia(dia: number) {
    const f = isoFecha(dia)
    return EVENTOS_ACADEMICOS.filter(e =>
      categoriasActivas.has(e.categoria) &&
      f >= e.fecha_inicio && f <= (e.fecha_fin ?? e.fecha_inicio)
    )
  }

  function eventosPersonalesDelDia(dia: number) {
    const f = isoFecha(dia)
    return eventosPersonales.filter(e => e.fecha_inicio.startsWith(f))
  }

  // Próximos eventos (oficial + personal) en los siguientes 30 días
  const proximosEventos = useMemo(() => {
    const hoyStr = hoy.toISOString().slice(0,10)
    const limite = new Date(hoy)
    limite.setDate(limite.getDate() + 30)
    const limiteStr = limite.toISOString().slice(0,10)

    const oficiales = EVENTOS_ACADEMICOS
      .filter(e => e.fecha_inicio >= hoyStr && e.fecha_inicio <= limiteStr)
      .map(e => ({ ...e, tipo: 'oficial' as const }))

    const personales = eventosPersonales
      .filter(e => e.fecha_inicio.slice(0,10) >= hoyStr && e.fecha_inicio.slice(0,10) <= limiteStr)
      .map(e => ({ id: e.id, titulo: e.titulo, fecha_inicio: e.fecha_inicio.slice(0,10), categoria: 'personal' as CategoriaEvento, tipo: 'personal' as const, importante: false }))

    return [...oficiales, ...personales].sort((a,b) => a.fecha_inicio.localeCompare(b.fecha_inicio))
  }, [eventosPersonales, hoy])

  function toggleCategoria(cat: CategoriaEvento) {
    setCategoriasActivas(prev => {
      const next = new Set(prev)
      if (next.has(cat)) next.delete(cat); else next.add(cat)
      return next
    })
  }

  function toggleNotifCategoria(cat: CategoriaEvento) {
    setNotifConfig(prev => ({
      ...prev,
      categorias: prev.categorias.includes(cat)
        ? prev.categorias.filter(c => c !== cat)
        : [...prev.categorias, cat],
    }))
  }

  function abrirModal(dia: Date) {
    setDiaSeleccionado(dia)
    setFormEvento({ titulo: '', descripcion: '' })
    setPasoModal('form')
    setConfirmPass('')
    setConfirmError(null)
    setModal(true)
  }

  function avanzarAConfirmar() {
    if (!formEvento.titulo.trim()) return
    if (formEvento.titulo.length > TITULO_MAX || formEvento.descripcion.length > DESC_MAX) return
    setPasoModal('confirmar')
    setConfirmPass('')
    setConfirmError(null)
  }

  async function verificarYGuardar() {
    if (!confirmPass || !diaSeleccionado || !numeroControl || !emailEstudiante) return
    setVerifyingPass(true)
    setConfirmError(null)
    try {
      await login(emailEstudiante, confirmPass)
    } catch {
      setConfirmError('Contraseña incorrecta. Intenta de nuevo.')
      setVerifyingPass(false)
      return
    }
    setSaving(true)
    const insert: CalendarioEventoInsert = {
      titulo: formEvento.titulo.trim(),
      descripcion: formEvento.descripcion.trim() || undefined,
      fecha_inicio: `${isoFecha(diaSeleccionado.getDate())}T08:00:00-06:00`,
      numero_control: numeroControl,
    }
    const { data, error } = await supabase.from('calendario_eventos').insert(insert).select().single()
    if (!error && data) {
      setEventosPersonales(prev => [...prev, data as CalendarioEvento].sort((a,b) => a.fecha_inicio.localeCompare(b.fecha_inicio)))
      setModal(false)
    } else {
      setConfirmError(
        error?.message?.includes('401') || error?.message?.includes('Unauthorized')
          ? 'Sin conexión con Supabase — verifica las variables de entorno en Vercel.'
          : 'No se pudo guardar el evento. Intenta de nuevo.'
      )
    }
    setSaving(false)
    setVerifyingPass(false)
  }

  async function eliminarEvento(id: string) {
    const { error } = await supabase.from('calendario_eventos').delete().eq('id', id)
    if (!error) setEventosPersonales(prev => prev.filter(e => e.id !== id))
  }

  async function guardarNotifConfig() {
    if (!numeroControl || !emailEstudiante) return
    setSavingNotif(true)
    await supabase.from('notificaciones_config').upsert({
      numero_control: numeroControl,
      email: emailEstudiante,
      nombre: nombreEstudiante,
      activo: notifConfig.activo,
      dias_anticipacion: notifConfig.dias_anticipacion,
      categorias: notifConfig.categorias,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'numero_control' })
    setSavingNotif(false)
    setNotifGuardado(true)
    setTimeout(() => setNotifGuardado(false), 3000)
  }

  const detalleDia = diaDetalle !== null
    ? { oficiales: eventosOficialesDelDia(diaDetalle), personales: eventosPersonalesDelDia(diaDetalle) }
    : null

  return (
    <DashboardShell crumb="Calendario">
      {errorCarga && (
        <div style={{
          margin: '0 0 16px', padding: '12px 16px', borderRadius: 10,
          background: 'rgba(220,38,38,.07)', border: '1px solid rgba(220,38,38,.3)',
          fontSize: 13, color: '#991b1b', display: 'flex', gap: 10, alignItems: 'center',
        }}>
          <span style={{ fontWeight: 700 }}>⚠ Sin conexión con Supabase</span>
          — Los eventos personales no están disponibles. Verifica que <code>NEXT_PUBLIC_SUPABASE_URL</code> y <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> estén configuradas en Vercel y haz un redeploy.
        </div>
      )}
      <div className="pagehead">
        <div>
          <div className="eyebrow">Académico · Calendario</div>
          <h1>Calendario Académico</h1>
          <p className="sub">Ene – Jun 2026 · TecNM Celaya</p>
        </div>
      </div>

      {/* Filtro de categorías */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        {(Object.entries(CATEGORIA_CONFIG) as [CategoriaEvento, typeof CATEGORIA_CONFIG[CategoriaEvento]][]).map(([cat, cfg]) => (
          <button
            key={cat}
            onClick={() => toggleCategoria(cat)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
              border: `1.5px solid ${categoriasActivas.has(cat) ? cfg.dot : 'var(--line)'}`,
              background: categoriasActivas.has(cat) ? cfg.badge : 'transparent',
              color: categoriasActivas.has(cat) ? cfg.text : 'var(--ink-400)',
              cursor: 'pointer', transition: 'all .15s',
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: 4, background: categoriasActivas.has(cat) ? cfg.dot : 'var(--line)', display: 'inline-block' }} />
            {cfg.label}
          </button>
        ))}
        <button
          onClick={() => setCategoriasActivas(new Set(['evaluacion','suspension','academico','evento','vinculacion']))}
          style={{ padding: '5px 12px', borderRadius: 20, fontSize: 12, border: '1.5px solid var(--line)', background: 'transparent', cursor: 'pointer', color: 'var(--ink-500)' }}
        >
          Todos
        </button>
      </div>

      <div className="sii-grid g-2-1" style={{ alignItems: 'flex-start' }}>
        {/* Calendario mensual */}
        <div className="card card-pad">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <button className="iconbtn" onClick={() => { if (mes === 0) { setMes(11); setAnio(a=>a-1) } else setMes(m=>m-1) }}>←</button>
            <h3 style={{ margin: 0, fontFamily: 'Source Serif 4, serif', fontSize: 18 }}>{MESES[mes]} {anio}</h3>
            <button className="iconbtn" onClick={() => { if (mes === 11) { setMes(0); setAnio(a=>a+1) } else setMes(m=>m+1) }}>→</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3 }}>
            {DIAS_SEM.map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: 10, color: 'var(--ink-400)', fontWeight: 700, padding: '4px 0', textTransform: 'uppercase', letterSpacing: '.08em' }}>{d}</div>
            ))}
            {diasDelMes.map((dia, i) => {
              if (dia === null) return <div key={`e-${i}`} />
              const esHoy = dia === hoy.getDate() && mes === hoy.getMonth() && anio === hoy.getFullYear()
              const oficiales = eventosOficialesDelDia(dia)
              const personales = eventosPersonalesDelDia(dia)
              const seleccionado = diaDetalle === dia
              return (
                <div
                  key={dia}
                  onClick={() => setDiaDetalle(seleccionado ? null : dia)}
                  style={{
                    borderRadius: 8, padding: '5px 3px', cursor: 'pointer', minHeight: 44,
                    background: seleccionado ? 'var(--green-900)' : esHoy ? 'rgba(11,42,26,.07)' : 'transparent',
                    border: esHoy ? '2px solid var(--green-800)' : '2px solid transparent',
                    transition: 'background .15s',
                  }}
                >
                  <div style={{ textAlign: 'center', fontWeight: esHoy ? 700 : 400, fontSize: 13, color: seleccionado ? '#fff' : esHoy ? 'var(--green-800)' : 'var(--ink-900)' }}>
                    {dia}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 2, marginTop: 2 }}>
                    {oficiales.slice(0,3).map(e => (
                      <span key={e.id} style={{ width: 6, height: 6, borderRadius: 3, background: CATEGORIA_CONFIG[e.categoria].dot, display: 'inline-block' }} />
                    ))}
                    {personales.length > 0 && (
                      <span style={{ width: 6, height: 6, borderRadius: 3, background: '#3b82f6', display: 'inline-block' }} />
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Leyenda */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--line)' }}>
            {(Object.entries(CATEGORIA_CONFIG) as [CategoriaEvento, typeof CATEGORIA_CONFIG[CategoriaEvento]][]).map(([cat, cfg]) => (
              <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--ink-500)' }}>
                <span style={{ width: 8, height: 8, borderRadius: 4, background: cfg.dot, display: 'inline-block' }} />
                {cfg.label}
              </div>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--ink-500)' }}>
              <span style={{ width: 8, height: 8, borderRadius: 4, background: '#3b82f6', display: 'inline-block' }} />
              Personal
            </div>
          </div>

          {/* Detalle del día seleccionado */}
          {diaDetalle !== null && detalleDia && (
            <div style={{ marginTop: 16, padding: '14px 16px', background: 'var(--paper)', borderRadius: 10, border: '1px solid var(--line)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <b style={{ fontSize: 13 }}>{diaDetalle} de {MESES[mes]}, {anio}</b>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    className="iconbtn"
                    style={{ fontSize: 11 }}
                    onClick={() => abrirModal(new Date(anio, mes, diaDetalle))}
                  >
                    + Agregar
                  </button>
                  <button onClick={() => setDiaDetalle(null)} style={{ background:'none', border:0, cursor:'pointer', color:'var(--ink-400)' }}>
                    <IcoX size={14} />
                  </button>
                </div>
              </div>
              {detalleDia.oficiales.length === 0 && detalleDia.personales.length === 0 && (
                <div className="muted" style={{ fontSize: 12 }}>Sin eventos. Haz clic en "+ Agregar" para crear uno.</div>
              )}
              {detalleDia.oficiales.map(e => {
                const cfg = CATEGORIA_CONFIG[e.categoria]
                return (
                  <div key={e.id} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 8 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 4, background: cfg.dot, display: 'inline-block', marginTop: 4, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600 }}>{e.titulo}</div>
                      {e.descripcion && <div className="muted" style={{ fontSize: 11 }}>{e.descripcion}</div>}
                      <span style={{ fontSize: 10, background: cfg.badge, color: cfg.text, borderRadius: 4, padding: '1px 5px', fontWeight: 600 }}>{cfg.label}</span>
                    </div>
                  </div>
                )
              })}
              {detalleDia.personales.map(e => (
                <div key={e.id} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 4, background: '#3b82f6', display: 'inline-block', marginTop: 4, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>{e.titulo}</div>
                    {e.descripcion && <div className="muted" style={{ fontSize: 11 }}>{e.descripcion}</div>}
                    <span style={{ fontSize: 10, background: '#dbeafe', color: '#1d4ed8', borderRadius: 4, padding: '1px 5px', fontWeight: 600 }}>Personal</span>
                  </div>
                  <button onClick={() => eliminarEvento(e.id)} style={{ background:'none', border:0, cursor:'pointer', color:'var(--ink-400)', padding: 2 }}>
                    <IcoX size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Panel derecho */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Próximos eventos */}
          <div className="card">
            <div className="card-head">
              <h3>Próximos 30 días</h3>
              <span className="muted" style={{ fontSize: 12 }}>{proximosEventos.length} evento{proximosEventos.length !== 1 ? 's' : ''}</span>
            </div>
            <div style={{ maxHeight: 320, overflowY: 'auto' }}>
              {proximosEventos.length === 0 && (
                <div className="muted" style={{ padding: '20px', fontSize: 13, textAlign: 'center' }}>Sin eventos próximos</div>
              )}
              {proximosEventos.map(e => {
                const fecha = new Date(e.fecha_inicio + 'T00:00:00')
                const cfg = e.tipo === 'personal'
                  ? { dot: '#3b82f6', badge: '#dbeafe', text: '#1d4ed8', label: 'Personal' }
                  : CATEGORIA_CONFIG[e.categoria as CategoriaEvento]
                return (
                  <div key={`${e.tipo}-${e.id}`} style={{ padding: '10px 20px', borderBottom: '1px solid var(--line)', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ width: 38, textAlign: 'center', flexShrink: 0 }}>
                      <div style={{ fontSize: 10, color: 'var(--ink-400)', textTransform: 'uppercase', letterSpacing: '.08em' }}>{MESES[fecha.getMonth()].slice(0,3)}</div>
                      <div style={{ fontFamily: 'Source Serif 4, serif', fontSize: 18, fontWeight: 700, color: 'var(--green-800)', lineHeight: 1 }}>{fecha.getDate()}</div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 12 }}>{e.titulo}</div>
                      <div style={{ marginTop: 3 }}>
                        <span style={{ fontSize: 10, background: cfg.badge, color: cfg.text, borderRadius: 4, padding: '1px 6px', fontWeight: 600 }}>{cfg.label}</span>
                        {e.importante && <span style={{ marginLeft: 4, fontSize: 10, background: '#fef3c7', color: '#92400e', borderRadius: 4, padding: '1px 6px', fontWeight: 600 }}>⚡ Importante</span>}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Configuración de notificaciones */}
          <div className="card card-pad">
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 14 }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: notifConfig.activo ? 'var(--green-900)' : 'var(--line)', color: notifConfig.activo ? 'var(--gold-400)' : 'var(--ink-400)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <IcoBell size={16} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 13 }}>Notificaciones por correo</div>
                <div className="muted" style={{ fontSize: 11 }}>{emailEstudiante || '…'}</div>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: 6 }}>
                <div
                  onClick={() => setNotifConfig(p => ({ ...p, activo: !p.activo }))}
                  style={{
                    width: 42, height: 24, borderRadius: 12, transition: 'background .2s',
                    background: notifConfig.activo ? 'var(--green-800)' : 'var(--line)',
                    position: 'relative', cursor: 'pointer',
                  }}
                >
                  <div style={{
                    position: 'absolute', top: 3, left: notifConfig.activo ? 21 : 3,
                    width: 18, height: 18, borderRadius: 9, background: '#fff',
                    transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,.2)',
                  }} />
                </div>
              </label>
            </div>

            {notifConfig.activo && (
              <>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-500)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.05em' }}>
                    Avisar con anticipación
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {[1, 3, 7].map(d => (
                      <button
                        key={d}
                        onClick={() => setNotifConfig(p => ({ ...p, dias_anticipacion: d }))}
                        style={{
                          padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                          border: `1.5px solid ${notifConfig.dias_anticipacion === d ? 'var(--green-800)' : 'var(--line)'}`,
                          background: notifConfig.dias_anticipacion === d ? 'var(--green-900)' : 'transparent',
                          color: notifConfig.dias_anticipacion === d ? '#fff' : 'var(--ink-500)',
                          cursor: 'pointer',
                        }}
                      >
                        {d} día{d !== 1 ? 's' : ''}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-500)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.05em' }}>
                    Notificar sobre
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {(Object.entries(CATEGORIA_CONFIG) as [CategoriaEvento, typeof CATEGORIA_CONFIG[CategoriaEvento]][]).map(([cat, cfg]) => {
                      const activo = notifConfig.categorias.includes(cat)
                      return (
                        <button
                          key={cat}
                          onClick={() => toggleNotifCategoria(cat)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 5,
                            padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                            border: `1.5px solid ${activo ? cfg.dot : 'var(--line)'}`,
                            background: activo ? cfg.badge : 'transparent',
                            color: activo ? cfg.text : 'var(--ink-400)',
                            cursor: 'pointer',
                          }}
                        >
                          <span style={{ width: 6, height: 6, borderRadius: 3, background: activo ? cfg.dot : 'var(--line)', display: 'inline-block' }} />
                          {cfg.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </>
            )}

            <button
              className="btn btn-primary"
              style={{ width: '100%', fontSize: 13 }}
              disabled={savingNotif || !numeroControl}
              onClick={guardarNotifConfig}
            >
              {savingNotif
                ? <span className="sii-spinner" />
                : notifGuardado
                  ? '✓ Guardado'
                  : 'Guardar preferencias'}
            </button>
          </div>

          {/* Stat */}
          <div className="stat">
            <div className="accent"><IcoCalendar size={14} /></div>
            <div className="lbl">Mis eventos personales</div>
            <div className="val">{eventosPersonales.length}</div>
            <div className="sub">Haz clic en un día para agregar</div>
          </div>
        </div>
      </div>

      {/* Modal nuevo evento personal */}
      {modal && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(11,42,26,.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(2px)' }}
          onClick={() => setModal(false)}
        >
          <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: '90%', maxWidth: 420, boxShadow: '0 20px 60px rgba(0,0,0,.18)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0 }}>
                {pasoModal === 'form' ? 'Nuevo evento personal' : 'Confirmar identidad'}
              </h3>
              <button onClick={() => setModal(false)} style={{ background: 'none', border: 0, cursor: 'pointer', color: 'var(--ink-400)' }}><IcoX size={18} /></button>
            </div>

            {pasoModal === 'form' ? (
              <>
                <div className="muted" style={{ marginBottom: 14, fontSize: 13 }}>
                  {diaSeleccionado?.toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 }}>
                    <label style={{ fontSize: 12, fontWeight: 600 }}>Título *</label>
                    <span style={{ fontSize: 11, color: formEvento.titulo.length > TITULO_MAX ? 'var(--red)' : 'var(--ink-400)' }}>
                      {formEvento.titulo.length} / {TITULO_MAX}
                    </span>
                  </div>
                  <input
                    className="sii-input"
                    placeholder="Ej: Estudiar para parcial 1"
                    value={formEvento.titulo}
                    maxLength={TITULO_MAX + 20}
                    onChange={e => setFormEvento(f => ({ ...f, titulo: e.target.value }))}
                    style={formEvento.titulo.length > TITULO_MAX ? { borderColor: 'var(--red)' } : {}}
                  />
                  {formEvento.titulo.length > TITULO_MAX && (
                    <div style={{ fontSize: 11, color: 'var(--red)', marginTop: 4 }}>
                      El título no puede superar {TITULO_MAX} caracteres.
                    </div>
                  )}
                </div>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 }}>
                    <label style={{ fontSize: 12, fontWeight: 600 }}>Descripción (opcional)</label>
                    <span style={{ fontSize: 11, color: formEvento.descripcion.length > DESC_MAX ? 'var(--red)' : 'var(--ink-400)' }}>
                      {formEvento.descripcion.length} / {DESC_MAX}
                    </span>
                  </div>
                  <textarea
                    className="sii-input"
                    placeholder="Notas adicionales…"
                    value={formEvento.descripcion}
                    rows={3}
                    maxLength={DESC_MAX + 20}
                    onChange={e => setFormEvento(f => ({ ...f, descripcion: e.target.value }))}
                    style={{ resize: 'vertical', ...(formEvento.descripcion.length > DESC_MAX ? { borderColor: 'var(--red)' } : {}) }}
                  />
                  {formEvento.descripcion.length > DESC_MAX && (
                    <div style={{ fontSize: 11, color: 'var(--red)', marginTop: 4 }}>
                      La descripción no puede superar {DESC_MAX} caracteres.
                    </div>
                  )}
                </div>
                <button
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                  disabled={!formEvento.titulo.trim() || formEvento.titulo.length > TITULO_MAX || formEvento.descripcion.length > DESC_MAX}
                  onClick={avanzarAConfirmar}
                >
                  Continuar →
                </button>
              </>
            ) : (
              <>
                <div className="muted" style={{ marginBottom: 16, fontSize: 13 }}>
                  Para confirmar la inserción del evento <b style={{ color: 'var(--ink-900)' }}>"{formEvento.titulo}"</b>, ingresa tu contraseña institucional.
                </div>
                <div style={{ marginBottom: 8 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5 }}>Contraseña SII</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      className="sii-input"
                      type={showConfirmPwd ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={confirmPass}
                      autoFocus
                      onChange={e => setConfirmPass(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && confirmPass) verificarYGuardar() }}
                      style={{ paddingRight: 60 }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPwd(v => !v)}
                      style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 0, cursor: 'pointer', fontSize: 12, color: 'var(--ink-400)', fontWeight: 600 }}
                    >
                      {showConfirmPwd ? 'Ocultar' : 'Ver'}
                    </button>
                  </div>
                </div>
                {confirmError && (
                  <div style={{ marginBottom: 12, padding: '10px 12px', borderRadius: 8, background: 'rgba(220,38,38,.07)', border: '1px solid rgba(220,38,38,.3)', fontSize: 12, color: '#991b1b' }}>
                    {confirmError}
                  </div>
                )}
                <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                  <button
                    className="btn"
                    style={{ flex: 1, fontSize: 13 }}
                    onClick={() => setPasoModal('form')}
                    disabled={verifyingPass || saving}
                  >
                    ← Volver
                  </button>
                  <button
                    className="btn btn-primary"
                    style={{ flex: 2, fontSize: 13 }}
                    disabled={!confirmPass || verifyingPass || saving}
                    onClick={verificarYGuardar}
                  >
                    {verifyingPass || saving ? <span className="sii-spinner" /> : 'Confirmar y guardar'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </DashboardShell>
  )
}
