export const dynamic = 'force-dynamic'

import { DashboardHeader } from '@/components/dashboard/DashboardHeader'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <DashboardHeader />
      <main className="max-w-7xl mx-auto px-6 py-6">{children}</main>
    </div>
  )
}
