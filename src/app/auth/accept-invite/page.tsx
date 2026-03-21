'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/infrastructure/database/supabase/client'
import { useRouter } from 'next/navigation'

export default function AcceptInvitePage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionReady, setSessionReady] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    const accessToken = hashParams.get('access_token')
    const refreshToken = hashParams.get('refresh_token')

    if (accessToken && refreshToken) {
      supabase.auth
        .setSession({ access_token: accessToken, refresh_token: refreshToken })
        .then(({ error }) => {
          if (error) {
            setError('Link de convite inválido ou expirado.')
          } else {
            setSessionReady(true)
          }
        })
    } else {
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) {
          setSessionReady(true)
        } else {
          setError('Link de convite inválido. Solicite um novo convite ao administrador.')
        }
      })
    }
  }, [supabase.auth])

  async function handleSetPassword(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres')
      return
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem')
      return
    }

    setLoading(true)

    try {
      const { error: updateError } = await supabase.auth.updateUser({ password })

      if (updateError) {
        setError('Erro ao definir senha. Tente novamente.')
        return
      }

      router.push('/dashboard')
      router.refresh()
    } catch {
      setError('Erro inesperado. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">Bem-vindo!</h1>
          <p className="text-[#737373] mt-2 text-sm">Defina sua senha para acessar o dashboard</p>
        </div>

        {!sessionReady && !error && (
          <div className="text-center text-[#737373]">
            <p>Verificando convite...</p>
          </div>
        )}

        {error && !sessionReady && (
          <p className="text-sm text-[#ef4444] bg-[#ef44441a] px-3 py-2 rounded-lg text-center">
            {error}
          </p>
        )}

        {sessionReady && (
          <form onSubmit={handleSetPassword} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm text-[#a3a3a3] mb-1.5">
                Nova Senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-3 py-2.5 bg-[#141414] border border-[#262626] rounded-lg text-white placeholder-[#525252] focus:outline-none focus:border-[#3b82f6] transition-colors"
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm text-[#a3a3a3] mb-1.5">
                Confirmar Senha
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-3 py-2.5 bg-[#141414] border border-[#262626] rounded-lg text-white placeholder-[#525252] focus:outline-none focus:border-[#3b82f6] transition-colors"
                placeholder="Repita a senha"
              />
            </div>

            {error && (
              <p className="text-sm text-[#ef4444] bg-[#ef44441a] px-3 py-2 rounded-lg">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#3b82f6] hover:bg-[#2563eb] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
            >
              {loading ? 'Salvando...' : 'Definir Senha e Acessar'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
