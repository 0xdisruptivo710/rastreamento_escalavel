export class Email {
  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  private readonly _value: string

  constructor(raw: string) {
    const trimmed = raw.trim().toLowerCase()
    if (!Email.EMAIL_REGEX.test(trimmed)) {
      throw new Error(`E-mail inválido: ${raw}`)
    }
    this._value = trimmed
  }

  get value(): string {
    return this._value
  }

  equals(other: Email): boolean {
    return this._value === other._value
  }

  toString(): string {
    return this._value
  }
}
