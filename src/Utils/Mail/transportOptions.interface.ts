export interface TransportOptions {
  host: string
  port?: number
  secure?: boolean
  auth: {
    user: string
    pass: string
  }
  tls?: {
    rejectUnauthorized?: boolean
  }
}
