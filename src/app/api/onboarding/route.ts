import { NextResponse } from 'next/server'
import { container } from '@/infrastructure/container'
import { onboardingSchema } from '@/validation/onboarding.schema'
import { TenantAlreadyExistsError } from '@/domain/errors/TenantAlreadyExistsError'
import { OnboardingError } from '@/domain/errors/OnboardingError'

export async function POST(request: Request) {
  try {
    // 1. AUTENTICAÇÃO
    const authService = container.getAuthService()
    const session = await authService.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // 2. AUTORIZAÇÃO
    if (session.userRole !== 'admin') {
      return NextResponse.json({ error: 'Acesso não autorizado' }, { status: 403 })
    }

    // 3. VALIDAÇÃO
    const body = await request.json()
    const parsed = onboardingSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    // 4. DELEGAÇÃO
    const createOnboarding = container.getCreateOnboardingUseCase()
    const result = await createOnboarding.execute(parsed.data)

    // 5. RESPOSTA
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    if (error instanceof TenantAlreadyExistsError) {
      return NextResponse.json({ error: error.message }, { status: 409 })
    }

    if (error instanceof OnboardingError) {
      return NextResponse.json(
        { error: 'Falha no processo de onboarding. Tente novamente.' },
        { status: 500 }
      )
    }

    console.error('[API /onboarding] Erro inesperado:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
