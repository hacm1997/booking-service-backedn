import { Exception } from 'utils/Exceptions';
import { MailerService } from 'utils/Mail/mailer.service';
import { MailOptions } from 'utils/Mail/mailOptions.interface';
import { TransportOptions } from 'utils/Mail/transportOptions.interface';
import { MailerRepositoryDynamoDB } from './repository';

export class MailService {
  private readonly repository: MailerRepositoryDynamoDB;
  private readonly tenant: string;

  constructor (tenant: string) {
    this.tenant = tenant;
    this.repository = new MailerRepositoryDynamoDB(this.tenant);
  }

  async createEmailConfig (config: TransportOptions): Promise<boolean> {
    return await this.repository.createEmail(config);
  }

  async updateEmailConfig (config: TransportOptions): Promise<boolean> {
    return await this.repository.updateEmail(config);
  }

  async getEmailConfig (): Promise<TransportOptions> {
    return await this.repository.getEmailConfig();
  }

  async deleteEmailConfig (): Promise<boolean> {
    return await this.repository.deleteEmailConfig();
  }

  async sendEmail (mailOptions: MailOptions): Promise<void> {
    const config = await this.repository.getEmailConfig();
    if (config == null || config.host == null) {
      throw new Exception('Email config does not exist');
    }
    const mailerService = new MailerService(mailOptions, config);
    await mailerService.sendEmail().then(() => {
      console.log('Email sent');
    }).catch((error) => {
      console.log('Email not sent');
      console.log(error);
      throw error;
    });
  }
}
