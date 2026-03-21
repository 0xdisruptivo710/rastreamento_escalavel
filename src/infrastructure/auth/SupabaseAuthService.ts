import { IAuthService, InviteUserMetadata, InvitedUser, SessionUser } from '@/domain/interfaces/IAuthService'
import { InviteError } from '@/domain/errors/InviteError'
import { createAdminClient } from '../database/supabase/admin'
import { createServerSupabaseClient } from '../database/supabase/server'

export class SupabaseAuthService implements IAuthService {
  async inviteUser(email: string, metadata: InviteUserMetadata): Promise<InvitedUser> {
    const supabase = createAdminClient()

    // Usar createUser em vez de inviteUserByEmail para evitar rate limit de e-mail.
    // O admin pode compartilhar a senha temporária com o cliente,
    // ou o cliente pode usar "Esqueci minha senha" para definir a própria.
    const tempPassword = this.generateTempPassword()

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        nome_empresa: metadata.nomeEmpresa,
        slug: metadata.slug,
        user_role: metadata.userRole,
      },
    })

    if (error) {
      throw new InviteError(`Falha ao criar usuário: ${error.message}`)
    }

    console.log(`[Auth] Usuário criado: ${email} | Senha temporária: ${tempPassword}`)

    return {
      id: data.user.id,
      email: data.user.email!,
      tempPassword,
    } as InvitedUser & { tempPassword: string }
  }

  async getSession(): Promise<SessionUser | null> {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      return null
    }

    return {
      id: user.id,
      email: user.email!,
      userRole: (user.user_metadata?.user_role as string) ?? 'client',
    }
  }

  async deleteUser(userId: string): Promise<void> {
    const supabase = createAdminClient()
    const { error } = await supabase.auth.admin.deleteUser(userId)

    if (error) {
      console.error(`Falha ao deletar usuário ${userId}: ${error.message}`)
    }
  }

  private generateTempPassword(): string {
    const chars = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let password = ''
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return password + '!1'
  }
}
