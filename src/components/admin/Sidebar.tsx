'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/infrastructure/database/supabase/client'

const NAV_ITEMS = [
  { href: '/admin/empresas', label: 'Empresas' },
  { href: '/admin/onboarding', label: 'Novo Onboarding' },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="w-60 h-screen bg-[#0f0f0f] border-r border-[#262626] flex flex-col fixed left-0 top-0">
      <div className="p-4 border-b border-[#262626]">
        <h2 className="text-sm font-bold text-white">Admin</h2>
        <p className="text-xs text-[#737373]">Rastreamento de Leads</p>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
              pathname === item.href
                ? 'bg-[#3b82f6]/10 text-[#3b82f6]'
                : 'text-[#a3a3a3] hover:bg-[#1a1a1a] hover:text-white'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="p-3 border-t border-[#262626]">
        <button
          onClick={handleLogout}
          className="w-full px-3 py-2 text-sm text-[#a3a3a3] hover:text-white hover:bg-[#1a1a1a] rounded-lg transition-colors text-left"
        >
          Sair
        </button>
      </div>
    </aside>
  )
}
