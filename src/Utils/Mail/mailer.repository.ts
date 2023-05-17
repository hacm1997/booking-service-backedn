export interface MailerRepository {
  sendEmail: () => Promise<void>
}
