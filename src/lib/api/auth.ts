import type { LoginResponse } from '@/types/api'

const BASE_URL = typeof window === 'undefined'
  ? `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/api/sii`
  : '/api/sii'

export async function login(email: string, password: string): Promise<string> {
  let response: Response

  try {
    response = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
  } catch {
    throw new Error('Error de conexión. Verifica tu internet.')
  }

  let data: LoginResponse
  try {
    data = await response.json()
  } catch {
    throw new Error('Error inesperado. Intenta de nuevo.')
  }

  // La API siempre retorna HTTP 200; el estado real está en data.status
  if (data.status === 401 || data.status === 422 || !data.message) {
    throw new Error('Correo o contraseña incorrectos.')
  }

  const token = data?.message?.login?.token
  if (!token) {
    throw new Error('Error inesperado. Intenta de nuevo.')
  }

  return token
}
