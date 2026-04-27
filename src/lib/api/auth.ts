import type { LoginResponse } from '@/types/api'

const BASE_URL = 'https://sii.celaya.tecnm.mx/api'

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

  if (response.status === 401 || response.status === 422) {
    throw new Error('Credenciales incorrectas')
  }

  if (!response.ok) {
    throw new Error('Error inesperado. Intenta de nuevo.')
  }

  let data: LoginResponse
  try {
    data = await response.json()
  } catch {
    throw new Error('Error inesperado. Intenta de nuevo.')
  }

  const token = data?.message?.login?.token
  if (!token) {
    throw new Error('Error inesperado. Intenta de nuevo.')
  }

  return token
}
