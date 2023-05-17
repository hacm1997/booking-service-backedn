import nodemailer, { Transporter } from 'nodemailer';
import { MailerRepository } from './mailer.repository';
import { MailOptions } from './mailOptions.interface';
import { TransportOptions } from './transportOptions.interface';

export class MailerService implements MailerRepository {
  private readonly transport: Transporter | undefined;
  private readonly mailOptions: MailOptions;
  private readonly transportOptions: TransportOptions;

  constructor (mailOptions: MailOptions, transportOptions: TransportOptions) {
    this.mailOptions = mailOptions;
    this.transportOptions = transportOptions;
    this.transport = nodemailer.createTransport(this.transportOptions);
  }

  async sendEmail (): Promise<void> {
    return await this.transport?.sendMail(this.mailOptions);
  }
}
