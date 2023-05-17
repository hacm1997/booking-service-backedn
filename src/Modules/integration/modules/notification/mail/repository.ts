import { TransportOptions } from 'utils/Mail/transportOptions.interface';
import { ConfigRepositoryDynamoDB } from '../../db/config';

export class MailerRepositoryDynamoDB extends ConfigRepositoryDynamoDB {
  constructor (tenant: string) {
    super(tenant);
  }

  async createEmail (config: TransportOptions): Promise<boolean> {
    return await this.createConfig<TransportOptions>(config, 'Email');
  }

  async updateEmail (config: TransportOptions): Promise<boolean> {
    return await this.updateConfig<TransportOptions>(config, 'Email');
  }

  async getEmailConfig (): Promise<TransportOptions> {
    return await this.getConfig<TransportOptions>('Email');
  }

  async deleteEmailConfig (): Promise<boolean> {
    return await this.deleteConfig('Email');
  }
}
