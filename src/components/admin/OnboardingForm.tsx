'use client'

import { useState, useCallback } from 'react'
import { Slug } from '@/domain/value-objects/Slug'

interface OnboardingResult {
  tenantId: string
  email: string
  tempPassword: string
  webhookUrlLead: string
  webhookUrlTag: string
}

const STEPS = [
  'Validando dados...',
  'Criando usuário...',
  'Criando tabela de rastreamento...',
  'Gerando workflows N8N...',
  'Finalizando onboarding...',
]

export function OnboardingForm() {
  const [nomeEmpresa, setNomeEmpresa] = useState('')
  const [slug, setSlug] = useState('')
  const [email, setEmail] = useState('')
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [error, setError] = useState('')
  const [result, setResult] = useState<OnboardingResult | null>(null)

  const handleNomeChange = useCallback((value: string) => {
    setNomeEmpresa(value)
    if (!slugManuallyEdited) {
      setSlug(Slug.sanitize(value))
    }
  }, [slugManuallyEdited])

  const handleSlugChange = useCallback((value: string) => {
    setSlugManuallyEdited(true)
    setSlug(Slug.sanitize(value))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setResult(null)
    setLoading(true)
    setCurrentStep(0)

    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev))
    }, 2000)

    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nomeEmpresa, slug, email }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Erro ao realizar onboarding')
        return
      }

      setResult({
        tenantId: data.tenantId,
        email: data.email,
        tempPassword: data.tempPassword,
        webhookUrlLead: data.webhookUrlLead,
        webhookUrlTag: data.webhookUrlTag,
      })
      setNomeEmpresa('')
      setSlug('')
      setEmail('')
      setSlugManuallyEdited(false)
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      clearInterval(stepInterval)
      setLoading(false)
    }
  }

  if (result) {
    return (
      <div className="bg-[#141414] border border-[#262626] rounded-xl p-6 max-w-lg">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-3 h-3 rounded-full bg-green-500" />
          <h3 className="text-lg font-bold text-white">Onboarding Concluído!</h3>
        </div>
        <div className="space-y-3 text-sm">
          <div>
            <span className="text-[#737373]">Credenciais do Cliente:</span>
            <div className="mt-1 bg-[#0a0a0a] px-3 py-2 rounded-lg space-y-1">
              <p className="text-[#a3a3a3] font-mono text-xs">E-mail: <span className="text-white">{result.email}</span></p>
              <p className="text-[#a3a3a3] font-mono text-xs">Senha: <span className="text-[#22c55e]">{result.tempPassword}</span></p>
            </div>
          </div>
          <div>
            <span className="text-[#737373]">Webhook Lead Entry:</span>
            <p className="text-[#a3a3a3] font-mono text-xs mt-1 bg-[#0a0a0a] px-3 py-2 rounded-lg break-all">
              {result.webhookUrlLead}
            </p>
          </div>
          <div>
            <span className="text-[#737373]">Webhook Tag Update:</span>
            <p className="text-[#a3a3a3] font-mono text-xs mt-1 bg-[#0a0a0a] px-3 py-2 rounded-lg break-all">
              {result.webhookUrlTag}
            </p>
          </div>
        </div>
        <button
          onClick={() => setResult(null)}
          className="mt-4 px-4 py-2 bg-[#262626] hover:bg-[#333333] text-white text-sm rounded-lg transition-colors"
        >
          Cadastrar outra empresa
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-[#141414] border border-[#262626] rounded-xl p-6 max-w-lg space-y-4">
      <div>
        <label htmlFor="nomeEmpresa" className="block text-sm text-[#a3a3a3] mb-1.5">
          Nome da Empresa
        </label>
        <input
          id="nomeEmpresa"
          type="text"
          value={nomeEmpresa}
          onChange={(e) => handleNomeChange(e.target.value)}
          required
          disabled={loading}
          className="w-full px-3 py-2.5 bg-[#0a0a0a] border border-[#262626] rounded-lg text-white placeholder-[#525252] focus:outline-none focus:border-[#3b82f6] transition-colors disabled:opacity-50"
          placeholder="Ex: Clínica Santa Clara"
        />
      </div>

      <div>
        <label htmlFor="slug" className="block text-sm text-[#a3a3a3] mb-1.5">
          Slug <span className="text-[#525252]">(auto-gerado, editável)</span>
        </label>
        <input
          id="slug"
          type="text"
          value={slug}
          onChange={(e) => handleSlugChange(e.target.value)}
          required
          disabled={loading}
          className="w-full px-3 py-2.5 bg-[#0a0a0a] border border-[#262626] rounded-lg text-white font-mono placeholder-[#525252] focus:outline-none focus:border-[#3b82f6] transition-colors disabled:opacity-50"
          placeholder="clinica_santa_clara"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm text-[#a3a3a3] mb-1.5">
          E-mail do Cliente
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
          className="w-full px-3 py-2.5 bg-[#0a0a0a] border border-[#262626] rounded-lg text-white placeholder-[#525252] focus:outline-none focus:border-[#3b82f6] transition-colors disabled:opacity-50"
          placeholder="cliente@empresa.com"
        />
      </div>

      {loading && (
        <div className="bg-[#0a0a0a] rounded-lg p-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-sm text-[#a3a3a3]">{STEPS[currentStep]}</span>
          </div>
          <div className="mt-2 h-1 bg-[#262626] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#3b82f6] rounded-full transition-all duration-1000"
              style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
            />
          </div>
        </div>
      )}

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
        {loading ? 'Processando...' : 'Iniciar Onboarding'}
      </button>
    </form>
  )
}
