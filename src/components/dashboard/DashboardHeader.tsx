'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/infrastructure/database/supabase/client'

export function DashboardHeader() {
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="border-b border-[#262626] bg-[#0f0f0f]">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        <h1 className="text-sm font-bold text-white">Dashboard de Leads</h1>
        <button
          onClick={handleLogout}
          className="text-sm text-[#a3a3a3] hover:text-white transition-colors"
        >
          Sair
        </button>
      </div>
    </header>
  )
}
