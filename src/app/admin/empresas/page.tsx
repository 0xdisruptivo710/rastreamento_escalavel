'use client'

import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { TenantProps } from '@/domain/entities/Tenant'

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendente',
  provisioning: 'Provisionando',
  active: 'Ativo',
  error: 'Erro',
  inactive: 'Inativo',
}

export default function EmpresasPage() {
  const [tenants, setTenants] = useState<TenantProps[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTenants()
  }, [])

  async function fetchTenants() {
    try {
      const res = await fetch('/api/tenants')
      if (res.ok) {
        const data = await res.json()
        setTenants(Array.isArray(data) ? data : [data])
      }
    } catch (err) {
      console.error('Erro ao buscar empresas:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-white">Empresas</h1>
        <a
          href="/admin/onboarding"
          className="px-4 py-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white text-sm font-medium rounded-lg transition-colors"
        >
          Nova Empresa
        </a>
      </div>

      {loading ? (
        <div className="text-[#737373] text-sm">Carregando...</div>
      ) : tenants.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-[#737373]">Nenhuma empresa cadastrada</p>
          <a href="/admin/onboarding" className="text-[#3b82f6] text-sm mt-2 inline-block hover:underline">
            Cadastrar primeira empresa
          </a>
        </div>
      ) : (
        <div className="bg-[#141414] border border-[#262626] rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#262626]">
                <th className="text-left px-4 py-3 text-xs text-[#737373] font-medium uppercase tracking-wider">Empresa</th>
                <th className="text-left px-4 py-3 text-xs text-[#737373] font-medium uppercase tracking-wider">Slug</th>
                <th className="text-left px-4 py-3 text-xs text-[#737373] font-medium uppercase tracking-wider">E-mail</th>
                <th className="text-left px-4 py-3 text-xs text-[#737373] font-medium uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs text-[#737373] font-medium uppercase tracking-wider">Data</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((tenant) => (
                <tr key={tenant.id ?? tenant.slug} className="border-b border-[#262626] last:border-0 hover:bg-[#1a1a1a] transition-colors">
                  <td className="px-4 py-3 text-sm text-white font-medium">{tenant.nomeEmpresa}</td>
                  <td className="px-4 py-3 text-sm text-[#a3a3a3] font-mono">{tenant.slug}</td>
                  <td className="px-4 py-3 text-sm text-[#a3a3a3]">{tenant.email}</td>
                  <td className="px-4 py-3">
                    <Badge variant={tenant.status as 'active' | 'pending' | 'provisioning' | 'error' | 'inactive'}>
                      {STATUS_LABELS[tenant.status] ?? tenant.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-[#737373]">
                    {tenant.createdAt ? new Date(tenant.createdAt).toLocaleDateString('pt-BR') : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
