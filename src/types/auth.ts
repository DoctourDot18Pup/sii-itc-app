export interface SessionToken {
  raw: string
  storedAt: number
}

export interface AuthState {
  token: string | null
  isAuthenticated: boolean
}
