export class TenantAlreadyExistsError extends Error {
  constructor(slug: string) {
    super(`Tenant com slug "${slug}" já existe`)
    this.name = 'TenantAlreadyExistsError'
  }
}
