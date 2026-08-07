'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'

type SessionResponse = {
  authenticated: boolean
}

type LoginResponse = {
  success: boolean
  error?: string
}

export default function AdminLoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function checkSession() {
      try {
        const response = await fetch('/api/auth/session', {
          method: 'GET',
          credentials: 'include',
        })
        const data = (await response.json()) as SessionResponse

        if (!isMounted) {
          return
        }

        if (data.authenticated) {
          router.replace('/admin/dashboard')
          return
        }
      } catch {
        if (isMounted) {
          setError('No se pudo verificar la sesión')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void checkSession()

    return () => {
      isMounted = false
    }
  }, [router])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ password }),
      })

      const data = (await response.json()) as LoginResponse

      if (data.success) {
        router.replace('/admin/dashboard')
        return
      }

      setError(data.error ?? 'No se pudo iniciar sesión')
    } catch {
      setError('No se pudo iniciar sesión')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-100 px-6 text-slate-900">
        <div className="mx-auto flex min-h-screen max-w-md items-center justify-center">
          <p className="text-sm font-medium text-slate-600">Cargando...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-200 px-6 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-md items-center justify-center">
        <div className="w-full rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/70 ring-1 ring-slate-200">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Acceso privado
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
              Panel de Ámbar
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Ingresa tu contraseña para administrar el portafolio.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
                placeholder="Escribe tu contraseña"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? 'Verificando...' : 'Entrar'}
            </button>
          </form>

          <div className="mt-4 min-h-6">
            {error ? (
              <p className="text-sm font-medium text-rose-600">{error}</p>
            ) : null}
          </div>
        </div>
      </div>
    </main>
  )
}
