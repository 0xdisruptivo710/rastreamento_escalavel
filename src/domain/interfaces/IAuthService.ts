export interface InviteUserMetadata {
  nomeEmpresa: string
  slug: string
  userRole: string
}

export interface InvitedUser {
  id: string
  email: string
}

export interface SessionUser {
  id: string
  email: string
  userRole: string
}

export interface IAuthService {
  inviteUser(email: string, metadata: InviteUserMetadata): Promise<InvitedUser>
  getSession(): Promise<SessionUser | null>
  deleteUser(userId: string): Promise<void>
}
