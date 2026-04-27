// ── Login ─────────────────────────────────────────────────────────────────────

export interface LoginResponse {
  responseCodeTxt: string
  message: { login: { token: string } }
  status: number
  flag: string
  data: number
  type: string
}

// ── Estudiante ────────────────────────────────────────────────────────────────

export interface EstudianteData {
  numero_control: string
  persona: string
  email: string
  semestre: number
  num_mat_rep_no_acreditadas: string
  creditos_acumulados: string
  promedio_ponderado: string
  promedio_aritmetico: string
  materias_cursadas: string
  materias_reprobadas: string
  materias_aprobadas: string
  creditos_complementarios: number
  porcentaje_avance: number
  num_materias_rep_primera: null
  num_materias_rep_segunda: null
  percentaje_avance_cursando: number
  foto: string
}

export interface EstudianteResponse {
  responseCodeTxt: string
  message: string
  status: number
  flag: string
  data: EstudianteData
  type: string
}

// ── Calificaciones ────────────────────────────────────────────────────────────

export interface Periodo {
  clave_periodo: string
  anio: number
  descripcion_periodo: string
}

export interface Calificacion {
  id_calificacion: number
  numero_calificacion: number
  calificacion: string
}

export interface MateriaCalificacion {
  id_grupo: number
  nombre_materia: string
  clave_materia: string
  letra_grupo: string
}

// NOTE: "calificaiones" preserves the typo from the real API response
export interface MateriaConCalificaciones {
  materia: MateriaCalificacion
  calificaiones: Calificacion[]
}

export interface CalificacionesPeriodo {
  periodo: Periodo
  materias: MateriaConCalificaciones[]
}

export interface CalificacionesResponse {
  responseCodeTxt: string
  message: string
  status: number
  flag: string
  data: CalificacionesPeriodo[]
  type: string
}

// ── Kardex ────────────────────────────────────────────────────────────────────

export interface KardexItem {
  nombre_materia: string
  clave_materia: string
  periodo: string
  creditos: string
  calificacion: string
  descripcion: string
  semestre: number
}

export interface KardexData {
  porcentaje_avance: number
  kardex: KardexItem[]
}

export interface KardexResponse {
  responseCodeTxt: string
  message: string
  status: number
  flag: string
  data: KardexData
  type: string
}

// ── Horarios ──────────────────────────────────────────────────────────────────

export interface HorarioItem {
  id_grupo: number
  letra_grupo: string
  nombre_materia: string
  clave_materia: string
  clave_turno: string
  nombre_plan: string
  letra_nivel: string
  lunes: string | null
  lunes_clave_salon: string | null
  martes: string | null
  martes_clave_salon: string | null
  miercoles: string | null
  miercoles_clave_salon: string | null
  jueves: string | null
  jueves_clave_salon: string | null
  viernes: string | null
  viernes_clave_salon: string | null
  sabado: string | null
  sabado_clave_salon: string | null
}

export interface HorariosPeriodo {
  periodo: Periodo
  horario: HorarioItem[]
}

export interface HorariosResponse {
  responseCodeTxt: string
  message: string
  status: number
  flag: string
  data: HorariosPeriodo[]
  type: string
}
