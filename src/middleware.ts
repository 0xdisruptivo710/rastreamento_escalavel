import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC_ROUTES = ['/login', '/auth/callback', '/auth/accept-invite']

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            supabaseResponse = NextResponse.next({ request })
            supabaseResponse.cookies.set(name, value, options as Record<string, unknown>)
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Rotas públicas — permitir acesso sem auth
  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    if (user) {
      const userRole = (user.user_metadata?.user_role as string) ?? 'client'
      const redirectPath = userRole === 'admin' ? '/admin/empresas' : '/dashboard'
      return NextResponse.redirect(new URL(redirectPath, request.url))
    }
    return supabaseResponse
  }

  // Sem autenticação — redirecionar para login
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const userRole = (user.user_metadata?.user_role as string) ?? 'client'

  // Rota raiz — redirecionar por role
  if (pathname === '/') {
    const redirectPath = userRole === 'admin' ? '/admin/empresas' : '/dashboard'
    return NextResponse.redirect(new URL(redirectPath, request.url))
  }

  // Admin routes — bloquear clientes
  if (pathname.startsWith('/admin')) {
    if (userRole !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  // Dashboard routes — redirecionar admins para admin
  if (pathname.startsWith('/dashboard')) {
    if (userRole === 'admin') {
      return NextResponse.redirect(new URL('/admin/empresas', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public|api).*)'],
}
