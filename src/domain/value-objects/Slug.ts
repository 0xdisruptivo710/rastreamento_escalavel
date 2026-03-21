export class Slug {
  private readonly _value: string

  constructor(raw: string) {
    const sanitized = Slug.sanitize(raw)
    if (!sanitized || sanitized.length === 0) {
      throw new Error('Slug inválido: não pode ser vazio após sanitização')
    }
    if (sanitized.length > 63) {
      throw new Error('Slug inválido: máximo 63 caracteres')
    }
    this._value = sanitized
  }

  get value(): string {
    return this._value
  }

  get tableName(): string {
    return `Rastreamento_${this._value}`
  }

  get webhookPath(): string {
    return this._value
  }

  get webhookPathTag(): string {
    return `tracking_${this._value}`
  }

  static sanitize(raw: string): string {
    return raw
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '')
  }

  equals(other: Slug): boolean {
    return this._value === other._value
  }

  toString(): string {
    return this._value
  }
}
