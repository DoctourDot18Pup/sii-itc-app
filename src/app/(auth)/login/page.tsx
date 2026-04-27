'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { login } from '@/lib/api/auth'
import { saveToken } from '@/lib/auth/session'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) { setError('Ingresa tu correo y contraseña.'); return }
    setError('')
    setLoading(true)
    try {
      const token = await login(email, password)
      saveToken(token)
      document.cookie = 'sii_auth_hint=1; path=/; max-age=28800; SameSite=Lax'
      router.push('/dashboard')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error inesperado.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-stage">
      {/* Left panel */}
      <div className="login-side">
        <div className="ring" />
        <div className="ring2" />

        <div className="brand-mark">
          <Image src="/logo_lince.png" alt="Linces TecNM Celaya" width={52} height={52} style={{ borderRadius: 8 }} />
          <div>
            <div className="b1" style={{ color: '#fff' }}>SII Linces</div>
            <div className="b2">TecNM · Celaya</div>
          </div>
        </div>

        <div className="login-pitch">
          <h1>Tu historial académico, <em>al instante</em>.</h1>
          <p>Consulta calificaciones, kardex, horarios y más desde un solo lugar. Acceso seguro con tu cuenta institucional.</p>
        </div>

        <div className="login-meta">
          <span>Sistema de Información Institucional</span>
          <span className="v">v2.0</span>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="login-form-wrap">
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="eyebrow">Acceso estudiantil</div>
          <h2>Iniciar sesión</h2>
          <p className="hint">Usa tu correo institucional del TecNM Celaya.</p>

          <div className="field">
            <label htmlFor="email">Correo institucional</label>
            <input
              id="email"
              type="email"
              className={`sii-input${error ? ' error' : ''}`}
              placeholder="l21031430@celaya.tecnm.mx"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className="field">
            <label htmlFor="password">Contraseña</label>
            <div className="pwd-wrap">
              <input
                id="password"
                type={showPwd ? 'text' : 'password'}
                className={`sii-input${error ? ' error' : ''}`}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                style={{ paddingRight: 70 }}
              />
              <button type="button" className="pwd-toggle" onClick={() => setShowPwd(v => !v)}>
                {showPwd ? 'Ocultar' : 'Ver'}
              </button>
            </div>
          </div>

          {error && (
            <div className="alert error" role="alert">
              <span>⚠</span>
              <span>{error}</span>
            </div>
          )}

          <div className="row-between">
            <label className="check">
              <input type="checkbox" /> Recordar sesión
            </label>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ marginTop: 20 }}
            disabled={loading}
          >
            {loading ? <span className="sii-spinner" /> : 'Entrar al sistema'}
          </button>

          <div className="alert info" style={{ marginTop: 20 }}>
            <span>ℹ</span>
            <span>Si tienes problemas para acceder, contacta a Servicios Escolares o al área de Sistemas.</span>
          </div>
        </form>
      </div>
    </div>
  )
}
