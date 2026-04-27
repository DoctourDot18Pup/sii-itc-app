import type {
  EstudianteData,
  CalificacionesPeriodo,
  KardexData,
  HorariosPeriodo,
} from '@/types/api'

const BASE_URL = 'https://sii.celaya.tecnm.mx/api'

async function apiFetch(endpoint: string, token: string): Promise<unknown> {
  let response: Response

  try {
    response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
  } catch {
    throw new Error('NETWORK_ERROR')
  }

  if (response.status === 401) {
    throw new Error('TOKEN_EXPIRED')
  }

  if (!response.ok) {
    throw new Error('NETWORK_ERROR')
  }

  return response.json()
}

export async function getEstudiante(token: string): Promise<EstudianteData> {
  const res = (await apiFetch('/movil/estudiante', token)) as { data: EstudianteData }
  return res.data
}

export async function getCalificaciones(token: string): Promise<CalificacionesPeriodo[]> {
  const res = (await apiFetch('/movil/estudiante/calificaciones', token)) as {
    data: CalificacionesPeriodo[]
  }
  return res.data
}

export async function getKardex(token: string): Promise<KardexData> {
  const res = (await apiFetch('/movil/estudiante/kardex', token)) as { data: KardexData }
  return res.data
}

export async function getHorarios(token: string): Promise<HorariosPeriodo[]> {
  const res = (await apiFetch('/movil/estudiante/horarios', token)) as {
    data: HorariosPeriodo[]
  }
  return res.data
}
