import { google } from 'googleapis';
import { ILogger } from 'utils/Logger/logger.interface';
import { LoggerService } from 'utils/Logger/logger.service';
import { calendar_v3 } from 'googleapis/build/src/apis/calendar';
import { CredentialsInit, FullCredentials } from '../config/google';
import { GoogleRepositoryDynamoDB } from 'Modules/integration/modules/google/auth/repository';

// class for save the tokens after the first login and use them for the next logins without the need to login again
export default class GoogleService {
  private static _INSTANCE: GoogleService;
  private readonly calendar: calendar_v3.Calendar | undefined;
  private readonly logger: ILogger;
  private readonly repository: GoogleRepositoryDynamoDB;
  private readonly tenantId: string;

  private constructor (tenantId: string, repository?: GoogleRepositoryDynamoDB) {
    this.logger = new LoggerService();
    this.repository = repository ?? new GoogleRepositoryDynamoDB(tenantId);
    this.tenantId = tenantId;
    this.logger.log('Initializing Google Service...');
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  }

  public async saveCredentials (credentials: FullCredentials): Promise < void > {
    await this.repository.createGoogleToken(credentials);
  }

  public async getCredentials (): Promise < FullCredentials > {
    const credentials = await this.repository.getGoogleToken(this.refreshCredentials.bind(this));
    return {
      ...credentials
    };
  }

  public async refreshCredentials (): Promise < void > {
    const credentials = await this.repository.getGoogleConfig() as FullCredentials;
    const { clientSecret, clientId, redirectUri, code, refreshToken } = credentials;
    const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
    oAuth2Client.setCredentials({ refresh_token: refreshToken });
    const token = await (await oAuth2Client.refreshAccessToken()).credentials;
    await this.repository.updateGoogleToken({
      ...credentials,
      accessToken: token.access_token ?? '',
      refreshToken: token.refresh_token ?? '',
      expiryDate: token.expiry_date ?? 0,
      code
    });
  }

  public static async getInstance (tenantId: string): Promise < GoogleService > {
    if (this._INSTANCE == null) {
      this._INSTANCE = new GoogleService(tenantId);
    }
    return this._INSTANCE;
  }

  public async getConfig (): Promise < CredentialsInit > {
    return await this.repository.getGoogleConfig() as CredentialsInit;
  }
}
