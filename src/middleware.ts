import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC_ROUTES = ['/login', '/auth/callback', '/auth/accept-invite']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Se env vars não estão configuradas, deixa passar
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.next()
  }

  let supabaseResponse = NextResponse.next({ request })

  try {
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
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
    })

    const { data: { user } } = await supabase.auth.getUser()

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
  } catch (error) {
    console.error('[Middleware] Erro:', error)
    // Em caso de erro, redireciona para login em rotas protegidas
    if (!PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return NextResponse.next()
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public|api).*)'],
}
