import { NextResponse } from 'next/server'
import { container } from '@/infrastructure/container'

export async function GET() {
  try {
    const authService = container.getAuthService()
    const session = await authService.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const getStats = container.getGetDashboardStatsUseCase()
    const stats = await getStats.execute(session.id)

    return NextResponse.json(stats)
  } catch (error) {
    console.error('[API /dashboard/stats] Erro:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
