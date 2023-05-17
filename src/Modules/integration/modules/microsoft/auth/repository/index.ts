import { ConfigRepositoryDynamoDB } from 'Modules/integration/modules/db/config';
import { Exception } from 'utils/Exceptions';
import { CredentialsInit, FullCredentials } from 'utils/Oauth/config/google';

export class MicrosoftRepositoryDynamoDB extends ConfigRepositoryDynamoDB {
  constructor (tenant: string) {
    super(tenant);
  }

  async createMicrosoftConfig (config: CredentialsInit): Promise<boolean> {
    return await this.createConfig<CredentialsInit>(config, 'Microsoft');
  }

  async updateMicrosoftConfig (config: CredentialsInit): Promise<boolean> {
    return await this.updateConfig<CredentialsInit>(config, 'Microsoft');
  }

  async getMicrosoftConfig (): Promise<CredentialsInit | FullCredentials> {
    return await this.getConfig<CredentialsInit | FullCredentials>('Microsoft');
  }

  async deleteMicrosoftConfig (): Promise<boolean> {
    return await this.deleteConfig('Microsoft');
  }

  async createMicrosoftToken (cred: FullCredentials): Promise<boolean> {
    const credentials = await this.getMicrosoftConfig() as FullCredentials;
    if ((credentials == null)) throw new Exception('Credentials not found');
    credentials.accessToken = cred.accessToken;
    credentials.refreshToken = cred.refreshToken;
    credentials.expiryDate = cred.expiryDate;
    credentials.tokenType = cred.tokenType;
    credentials.code = cred.code;
    return await this.updateMicrosoftConfig(credentials);
  }

  async updateMicrosoftToken (cred: FullCredentials): Promise<boolean> {
    return await this.createMicrosoftToken(cred);
  }

  async getMicrosoftToken (refreshMicrosoftToken: () => void): Promise<FullCredentials> {
    const credentials = await this.getMicrosoftConfig() as FullCredentials;
    if ((credentials == null)) throw new Exception('Credentials not found');
    if ((credentials.accessToken == null)) throw new Exception('Access token not found');
    if ((credentials.refreshToken == null)) throw new Exception('Refresh token not found');
    if ((credentials.expiryDate == null)) throw new Exception('Expiry date not found');
    if ((credentials.expiryDate <= Date.now() - 1000)) {
      await refreshMicrosoftToken();
      // return await this.getMicrosoftToken(refreshMicrosoftToken);
    }
    return credentials;
  }

  async deleteMicrosoftToken (): Promise<boolean> {
    const credentials = await this.getMicrosoftConfig() as FullCredentials;
    if ((credentials == null)) throw new Error('Credentials not found');
    credentials.accessToken = undefined;
    credentials.refreshToken = undefined;
    credentials.expiryDate = undefined;
    return await this.updateMicrosoftConfig(credentials);
  }
}
