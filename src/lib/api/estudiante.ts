import type {
  EstudianteData,
  CalificacionesPeriodo,
  KardexData,
  HorariosPeriodo,
} from '@/types/api'

// En browser: URL relativa → el rewrite de Next.js la redirige al API real (sin CORS)
// En servidor (Vercel): URL absoluta apuntando al mismo host para seguir el rewrite
const BASE_URL = typeof window === 'undefined'
  ? `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/api/sii`
  : '/api/sii'

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
