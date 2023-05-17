import { json } from 'Utils/json.interface';

export interface MailOptions {
  from: string
  to?: string
  subject: string
  html: string
  attachments?: json[]
}
