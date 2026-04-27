import { redirect } from 'next/navigation'
import { isAuthenticated } from './session'

export function requireAuth(): void {
  if (!isAuthenticated()) {
    redirect('/login')
  }
}
