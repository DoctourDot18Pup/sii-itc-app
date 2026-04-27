export interface CalendarioEvento {
  id: string
  titulo: string
  descripcion?: string
  fecha_inicio: string
  fecha_fin?: string
  numero_control: string
  created_at?: string
}

export interface CalendarioEventoInsert {
  titulo: string
  descripcion?: string
  fecha_inicio: string
  fecha_fin?: string
  numero_control: string
}
