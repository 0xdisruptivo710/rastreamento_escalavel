import { NextResponse } from 'next/server'
import { container } from '@/infrastructure/container'

export async function GET() {
  try {
    const authService = container.getAuthService()
    const session = await authService.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    if (session.userRole === 'admin') {
      const listTenants = container.getListTenantsUseCase()
      const tenants = await listTenants.execute()
      return NextResponse.json(tenants)
    }

    const getTenant = container.getGetTenantByUserIdUseCase()
    const tenant = await getTenant.execute(session.id)

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant não encontrado' }, { status: 404 })
    }

    return NextResponse.json(tenant)
  } catch (error) {
    console.error('[API /tenants] Erro:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
