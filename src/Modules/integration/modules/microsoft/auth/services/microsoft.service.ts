import { Client } from '@microsoft/microsoft-graph-client';
import { ILogger } from 'utils/Logger/logger.interface';
import { LoggerService } from 'utils/Logger/logger.service';
import { CredentialsInit, FullCredentials } from 'utils/Oauth/config/google';
import { MicrosoftRepositoryDynamoDB } from '../repository';

// class for save the tokens after the first login and use them for the next logins without the need to login again
export default class MicrosoftService {
  private static _INSTANCE: MicrosoftService;
  private readonly logger: ILogger;
  private readonly client: Client;
  private readonly repository: MicrosoftRepositoryDynamoDB;
  private readonly tenantId: string;

  private constructor (tenantId: string, repository?: MicrosoftRepositoryDynamoDB) {
    this.client = Client.init({
      authProvider: async (done) => {
        const token = await this.getCredentials();
        done(null, token.accessToken ?? '');
      }
    });
    this.logger = new LoggerService();
    this.repository = repository ?? new MicrosoftRepositoryDynamoDB(tenantId);
    this.tenantId = tenantId;
    this.logger.log('Initializing Google Service...');
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  }

  public async saveCredentials (credentials: FullCredentials): Promise < void > {
    await this.repository.createMicrosoftToken(credentials);
  }

  public async getCredentials (): Promise < FullCredentials > {
    return await this.repository.getMicrosoftToken(this.refreshCredentials.bind(this));
  }

  public async refreshCredentials (): Promise < void > {
    const credentials = await this.repository.getMicrosoftConfig() as FullCredentials;
    const { clientSecret, clientId, redirectUri, code, refreshToken } = credentials;

    const url = `https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT as string}/oauth2/v2.0/token`;
    const body = new URLSearchParams();
    body.append('client_id', clientId ?? '');
    body.append('client_secret', clientSecret ?? '');
    body.append('redirect_uri', redirectUri ?? '');
    body.append('grant_type', 'refresh_token');
    body.append('refresh_token', refreshToken ?? '');
    body.append('scope', 'https://graph.microsoft.com/.default');

    const response = await fetch(url, {
      method: 'POST',
      body
    });

    const token = await response.json();
    await this.repository.updateMicrosoftToken({
      ...credentials,
      accessToken: token.access_token ?? '',
      refreshToken: token.refresh_token ?? '',
      expiryDate: token.expiry_date ?? 0,
      code
    });
  }

  public static async getInstance (tenantId: string): Promise < MicrosoftService > {
    if (this._INSTANCE == null) {
      this._INSTANCE = new MicrosoftService(tenantId);
    }
    return this._INSTANCE;
  }

  public async getConfig (): Promise < CredentialsInit > {
    return await this.repository.getMicrosoftConfig() as CredentialsInit;
  }

  public async getCaledarEvents (): Promise < any > {
    const response = await this.client.api('/me/calendar/events').get();
    return response;
  }

  public async getCalendar (): Promise < any > {
    const response = await this.client.api('/me/calendars').get();
    return response;
  }

  async _getClient (): Promise < Client > {
    return this.client;
  }
}
