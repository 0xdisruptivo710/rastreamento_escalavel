import { NextRequest, NextResponse } from 'next/server'
import { container } from '@/infrastructure/container'
import { leadFilterSchema } from '@/validation/lead-filter.schema'

export async function GET(request: NextRequest) {
  try {
    const authService = container.getAuthService()
    const session = await authService.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const filterInput = {
      dataInicio: searchParams.get('dataInicio') ?? undefined,
      dataFim: searchParams.get('dataFim') ?? undefined,
      campanha: searchParams.get('campanha') ?? undefined,
      status: searchParams.get('status') ?? undefined,
      busca: searchParams.get('busca') ?? undefined,
      page: searchParams.get('page') ?? undefined,
      pageSize: searchParams.get('pageSize') ?? undefined,
    }

    const parsed = leadFilterSchema.safeParse(filterInput)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Filtros inválidos', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const getLeads = container.getGetLeadsByTenantUseCase()
    const result = await getLeads.execute(session.id, parsed.data)

    return NextResponse.json(result)
  } catch (error) {
    console.error('[API /leads] Erro:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
