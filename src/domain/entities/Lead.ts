export interface LeadProps {
  id?: number
  createdAt?: Date
  nome?: string
  numero?: string
  email?: string
  cidade?: string
  campanha?: string
  conjunto?: string
  anuncio?: string
  sourceId?: string
  ctaClid?: string
  thumbnail?: string
  cta?: string
  url?: string
  sourceUrl?: string
  mensagem?: string
  status?: string
  dataCriacao?: string
  tracking?: string
}

export class Lead {
  private readonly _id?: number
  private readonly _createdAt: Date
  private readonly _nome?: string
  private readonly _numero?: string
  private readonly _email?: string
  private readonly _cidade?: string
  private readonly _campanha?: string
  private readonly _conjunto?: string
  private readonly _anuncio?: string
  private readonly _sourceId?: string
  private readonly _ctaClid?: string
  private readonly _thumbnail?: string
  private readonly _cta?: string
  private readonly _url?: string
  private readonly _sourceUrl?: string
  private readonly _mensagem?: string
  private readonly _status: string
  private readonly _dataCriacao?: string
  private readonly _tracking?: string

  constructor(props: LeadProps) {
    this._id = props.id
    this._createdAt = props.createdAt ?? new Date()
    this._nome = props.nome
    this._numero = props.numero
    this._email = props.email
    this._cidade = props.cidade
    this._campanha = props.campanha
    this._conjunto = props.conjunto
    this._anuncio = props.anuncio
    this._sourceId = props.sourceId
    this._ctaClid = props.ctaClid
    this._thumbnail = props.thumbnail
    this._cta = props.cta
    this._url = props.url
    this._sourceUrl = props.sourceUrl
    this._mensagem = props.mensagem
    this._status = props.status ?? 'Entrou em contato'
    this._dataCriacao = props.dataCriacao
    this._tracking = props.tracking
  }

  get id(): number | undefined { return this._id }
  get createdAt(): Date { return this._createdAt }
  get nome(): string | undefined { return this._nome }
  get numero(): string | undefined { return this._numero }
  get email(): string | undefined { return this._email }
  get cidade(): string | undefined { return this._cidade }
  get campanha(): string | undefined { return this._campanha }
  get conjunto(): string | undefined { return this._conjunto }
  get anuncio(): string | undefined { return this._anuncio }
  get sourceId(): string | undefined { return this._sourceId }
  get ctaClid(): string | undefined { return this._ctaClid }
  get thumbnail(): string | undefined { return this._thumbnail }
  get cta(): string | undefined { return this._cta }
  get url(): string | undefined { return this._url }
  get sourceUrl(): string | undefined { return this._sourceUrl }
  get mensagem(): string | undefined { return this._mensagem }
  get status(): string { return this._status }
  get dataCriacao(): string | undefined { return this._dataCriacao }
  get tracking(): string | undefined { return this._tracking }
}
