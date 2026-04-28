export type CategoriaEvento = 'evaluacion' | 'suspension' | 'academico' | 'evento' | 'vinculacion'

export interface EventoAcademico {
  id: string
  titulo: string
  descripcion?: string
  fecha_inicio: string   // YYYY-MM-DD
  fecha_fin?: string     // YYYY-MM-DD
  categoria: CategoriaEvento
  importante: boolean    // dispara notificaciones
}

export const EVENTOS_ACADEMICOS: EventoAcademico[] = [
  // ── ACTIVIDADES ACADÉMICAS ──────────────────────────────────────────────────
  { id: 'ac-01', titulo: 'Aportación para inscripción (nuevo ingreso y reingreso)', fecha_inicio: '2026-01-08', fecha_fin: '2026-01-13', categoria: 'academico', importante: false },
  { id: 'ac-02', titulo: 'Reinscripción Licenciatura', fecha_inicio: '2026-01-15', fecha_fin: '2026-01-16', categoria: 'academico', importante: true },
  { id: 'ac-03', titulo: 'Reinscripción Licenciatura (continuación)', fecha_inicio: '2026-01-19', fecha_fin: '2026-01-20', categoria: 'academico', importante: false },
  { id: 'ac-04', titulo: 'Aclaraciones (Licenciatura)', fecha_inicio: '2026-01-21', fecha_fin: '2026-01-23', categoria: 'academico', importante: false },
  { id: 'ac-05', titulo: 'Inicio de cursos (Sistema Mixto)', fecha_inicio: '2026-01-24', categoria: 'academico', importante: true },
  { id: 'ac-06', titulo: 'Inicio de cursos (Licenciatura y Posgrado)', fecha_inicio: '2026-01-26', categoria: 'academico', importante: true },
  { id: 'ac-07', titulo: 'Baja Parcial (Licenciatura)', fecha_inicio: '2026-01-26', fecha_fin: '2026-02-09', categoria: 'academico', importante: false },
  { id: 'ac-08', titulo: 'Baja Temporal (Licenciatura y Posgrado)', fecha_inicio: '2026-01-26', fecha_fin: '2026-03-02', categoria: 'academico', importante: false },
  { id: 'ac-09', titulo: 'Recepción de solicitudes traslados y movilidad', fecha_inicio: '2026-02-03', fecha_fin: '2026-05-28', categoria: 'academico', importante: false },
  { id: 'ac-10', titulo: 'Oficialización de matrículas y cargas académicas', fecha_inicio: '2026-02-27', categoria: 'academico', importante: false },
  { id: 'ac-11', titulo: 'Evaluación Docente', fecha_inicio: '2026-05-04', fecha_fin: '2026-05-29', categoria: 'academico', importante: false },
  { id: 'ac-12', titulo: 'Fin de cursos (Licenciatura y Posgrado)', fecha_inicio: '2026-05-29', categoria: 'academico', importante: true },

  // ── EVALUACIONES (PARCIALES) ────────────────────────────────────────────────
  { id: 'ev-01', titulo: 'Evaluación Diagnóstica', fecha_inicio: '2026-01-26', fecha_fin: '2026-01-30', categoria: 'evaluacion', importante: true, descripcion: 'Evaluación de diagnóstico de 1a. oportunidad' },
  { id: 'ev-02', titulo: 'Primera Evaluación (Parcial 1)', fecha_inicio: '2026-02-16', fecha_fin: '2026-02-20', categoria: 'evaluacion', importante: true },
  { id: 'ev-03', titulo: 'Captura Parcial 1 en CETEC', fecha_inicio: '2026-02-23', fecha_fin: '2026-02-27', categoria: 'evaluacion', importante: false },
  { id: 'ev-04', titulo: 'Segunda Evaluación (Parcial 2)', fecha_inicio: '2026-03-16', fecha_fin: '2026-03-20', categoria: 'evaluacion', importante: true },
  { id: 'ev-05', titulo: 'Captura Parcial 2 en CETEC', fecha_inicio: '2026-03-23', fecha_fin: '2026-03-27', categoria: 'evaluacion', importante: false },
  { id: 'ev-06', titulo: 'Tercera Evaluación (Parcial 3)', fecha_inicio: '2026-04-27', fecha_fin: '2026-05-04', categoria: 'evaluacion', importante: true },
  { id: 'ev-07', titulo: 'Captura Parcial 3 en CETEC', fecha_inicio: '2026-05-06', fecha_fin: '2026-05-08', categoria: 'evaluacion', importante: false },
  { id: 'ev-08', titulo: 'Cuarta Evaluación (Parcial 4)', fecha_inicio: '2026-05-25', fecha_fin: '2026-05-29', categoria: 'evaluacion', importante: true },
  { id: 'ev-09', titulo: 'Captura Parcial 4 en CETEC', fecha_inicio: '2026-06-01', fecha_fin: '2026-06-05', categoria: 'evaluacion', importante: false },
  { id: 'ev-10', titulo: 'Evaluación 2a. Oportunidad e Integración', fecha_inicio: '2026-06-01', fecha_fin: '2026-06-05', categoria: 'evaluacion', importante: true },
  { id: 'ev-11', titulo: 'Registro de calificaciones en SII (docentes)', fecha_inicio: '2026-06-08', categoria: 'evaluacion', importante: false },
  { id: 'ev-12', titulo: 'Entrega de actas a Servicios Escolares', fecha_inicio: '2026-06-09', fecha_fin: '2026-06-10', categoria: 'evaluacion', importante: false },

  // ── SUSPENSIÓN DE LABORES ───────────────────────────────────────────────────
  { id: 'sus-01', titulo: 'Día no laborable — Año Nuevo', fecha_inicio: '2026-01-01', categoria: 'suspension', importante: true },
  { id: 'sus-02', titulo: 'Día no laborable — Constitución Mexicana', fecha_inicio: '2026-02-02', categoria: 'suspension', importante: true },
  { id: 'sus-03', titulo: 'Día no laborable — Natalicio de Benito Juárez', fecha_inicio: '2026-03-16', categoria: 'suspension', importante: true },
  { id: 'sus-04', titulo: 'Período Vacacional — Semana Santa', fecha_inicio: '2026-03-30', fecha_fin: '2026-04-10', categoria: 'suspension', importante: true },
  { id: 'sus-05', titulo: 'Día no laborable — Día del Trabajo', fecha_inicio: '2026-05-01', categoria: 'suspension', importante: true },
  { id: 'sus-06', titulo: 'Día no laborable — Batalla de Puebla', fecha_inicio: '2026-05-05', categoria: 'suspension', importante: false },
  { id: 'sus-07', titulo: 'Día no laborable — 15 de Mayo', fecha_inicio: '2026-05-15', categoria: 'suspension', importante: false },
  { id: 'sus-08', titulo: 'Período Vacacional de Verano', fecha_inicio: '2026-07-06', fecha_fin: '2026-07-31', categoria: 'suspension', importante: true },

  // ── EVENTOS INSTITUCIONALES ─────────────────────────────────────────────────
  { id: 'evo-01', titulo: 'Ceremonia LXVIII Aniversario TecNM Celaya', fecha_inicio: '2026-04-14', categoria: 'evento', importante: true },
  { id: 'evo-02', titulo: 'Ceremonia de Entrega de Títulos', fecha_inicio: '2026-04-17', categoria: 'evento', importante: false },
  { id: 'evo-03', titulo: 'Semana Lince', fecha_inicio: '2026-05-04', fecha_fin: '2026-05-09', categoria: 'evento', importante: true, descripcion: 'Semana de actividades culturales, deportivas y académicas' },
  { id: 'evo-04', titulo: 'Innova TecNM 2025 — Etapa Local', fecha_inicio: '2026-05-20', categoria: 'evento', importante: false },
  { id: 'evo-05', titulo: 'ANFEI — Etapa Eliminatoria', fecha_inicio: '2026-04-01', fecha_fin: '2026-04-30', categoria: 'evento', importante: false },
  { id: 'evo-06', titulo: 'ANFEI — Etapa Final', fecha_inicio: '2026-05-01', fecha_fin: '2026-05-31', categoria: 'evento', importante: false },
  { id: 'evo-07', titulo: 'ENECB — Primera Etapa', fecha_inicio: '2026-09-21', fecha_fin: '2026-09-25', categoria: 'evento', importante: false },
  { id: 'evo-08', titulo: 'ENECB — Segunda Etapa', fecha_inicio: '2026-10-19', fecha_fin: '2026-10-23', categoria: 'evento', importante: false },
  { id: 'evo-09', titulo: 'Feria de Proyectos', fecha_inicio: '2026-11-01', fecha_fin: '2026-11-30', categoria: 'evento', importante: false },
  { id: 'evo-10', titulo: 'ENECB — Final', fecha_inicio: '2026-11-16', fecha_fin: '2026-11-20', categoria: 'evento', importante: false },
  { id: 'evo-11', titulo: 'Día del TecNM', fecha_inicio: '2026-07-23', categoria: 'evento', importante: true },

  // ── VINCULACIÓN CON LA COMUNIDAD ────────────────────────────────────────────
  { id: 'vin-01', titulo: 'Inscripción en CETEC (Servicio Social)', fecha_inicio: '2026-01-15', fecha_fin: '2026-01-23', categoria: 'vinculacion', importante: false },
  { id: 'vin-02', titulo: 'Publicación convocatoria Movilidad Internacional', fecha_inicio: '2026-02-13', categoria: 'vinculacion', importante: true },
  { id: 'vin-03', titulo: 'Publicación convocatoria Servicio Social', fecha_inicio: '2026-04-27', categoria: 'vinculacion', importante: true },
  { id: 'vin-04', titulo: 'Pláticas de Residencias Profesionales', fecha_inicio: '2026-05-04', fecha_fin: '2026-05-08', categoria: 'vinculacion', importante: true },
  { id: 'vin-05', titulo: 'Plática inducción Servicio Social', fecha_inicio: '2026-05-12', categoria: 'vinculacion', importante: false },
  { id: 'vin-06', titulo: 'Plática inducción Servicio Social', fecha_inicio: '2026-05-14', categoria: 'vinculacion', importante: false },
  { id: 'vin-07', titulo: 'Plática inducción Servicio Social', fecha_inicio: '2026-05-19', categoria: 'vinculacion', importante: false },
  { id: 'vin-08', titulo: 'Feria de Residencias Profesionales y Empleo', fecha_inicio: '2026-05-27', fecha_fin: '2026-05-28', categoria: 'vinculacion', importante: true },
]

export const CATEGORIA_CONFIG: Record<CategoriaEvento, { label: string; dot: string; badge: string; text: string }> = {
  evaluacion: { label: 'Evaluación', dot: '#d97706', badge: '#fef3c7', text: '#92400e' },
  suspension:  { label: 'Suspensión', dot: '#dc2626', badge: '#fee2e2', text: '#991b1b' },
  academico:   { label: 'Académico',  dot: '#16a34a', badge: '#dcfce7', text: '#166534' },
  evento:      { label: 'Evento',     dot: '#7c3aed', badge: '#ede9fe', text: '#4c1d95' },
  vinculacion: { label: 'Vinculación',dot: '#0891b2', badge: '#cffafe', text: '#155e75' },
}

// Devuelve los eventos oficiales que caen dentro de un rango de días desde hoy
export function eventosProximos(dias: number): EventoAcademico[] {
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  const limite = new Date(hoy)
  limite.setDate(limite.getDate() + dias)
  return EVENTOS_ACADEMICOS.filter(e => {
    const inicio = new Date(e.fecha_inicio + 'T00:00:00')
    return inicio >= hoy && inicio <= limite
  }).sort((a, b) => a.fecha_inicio.localeCompare(b.fecha_inicio))
}
