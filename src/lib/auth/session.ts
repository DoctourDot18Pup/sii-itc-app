const TOKEN_KEY = 'sii_token'
const INACTIVITY_LIMIT = 7 * 60 * 1000

const ACTIVITY_EVENTS = [
  'mousemove',
  'keydown',
  'click',
  'scroll',
  'touchstart',
] as const

let timeoutId: ReturnType<typeof setTimeout> | null = null
let currentOnExpire: (() => void) | null = null

export function saveToken(token: string): void {
  sessionStorage.setItem(TOKEN_KEY, token)
}

export function getToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY)
}

export function clearToken(): void {
  sessionStorage.removeItem(TOKEN_KEY)
}

export function isAuthenticated(): boolean {
  return getToken() !== null
}

function handleActivity(): void {
  if (!currentOnExpire) return
  resetInactivityTimer()
}

export function resetInactivityTimer(): void {
  if (timeoutId !== null) {
    clearTimeout(timeoutId)
  }
  if (!currentOnExpire) return
  timeoutId = setTimeout(() => {
    clearToken()
    currentOnExpire?.()
  }, INACTIVITY_LIMIT)
}

export function startInactivityTimer(onExpire: () => void): () => void {
  currentOnExpire = onExpire

  ACTIVITY_EVENTS.forEach((event) => {
    window.addEventListener(event, handleActivity)
  })

  resetInactivityTimer()

  return function cleanup() {
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
    currentOnExpire = null
    ACTIVITY_EVENTS.forEach((event) => {
      window.removeEventListener(event, handleActivity)
    })
  }
}
