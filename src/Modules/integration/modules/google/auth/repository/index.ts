import { ConfigRepositoryDynamoDB } from 'Modules/integration/modules/db/config';
import { Exception } from 'utils/Exceptions';
import { CredentialsInit, FullCredentials } from 'utils/Oauth/config/google';

export class GoogleRepositoryDynamoDB extends ConfigRepositoryDynamoDB {
  constructor (tenant: string) {
    super(tenant);
  }

  async createGoogleConfig (config: CredentialsInit): Promise<boolean> {
    return await this.createConfig<CredentialsInit>(config, 'Google');
  }

  async updateGoogleConfig (config: CredentialsInit): Promise<boolean> {
    return await this.updateConfig<CredentialsInit>(config, 'Google');
  }

  async getGoogleConfig (): Promise<CredentialsInit | FullCredentials> {
    return await this.getConfig<CredentialsInit | FullCredentials>('Google');
  }

  async deleteGoogleConfig (): Promise<boolean> {
    return await this.deleteConfig('Google');
  }

  async createGoogleToken (cred: FullCredentials): Promise<boolean> {
    const credentials = await this.getGoogleConfig() as FullCredentials;
    if ((credentials == null)) throw new Exception('Credentials not found');
    credentials.accessToken = cred.accessToken;
    credentials.refreshToken = cred.refreshToken;
    credentials.expiryDate = cred.expiryDate;
    credentials.tokenType = cred.tokenType;
    credentials.code = cred.code;
    return await this.updateGoogleConfig(credentials);
  }

  async updateGoogleToken (cred: FullCredentials): Promise<boolean> {
    return await this.createGoogleToken(cred);
  }

  async getGoogleToken (refreshGoogleToken: () => void): Promise<FullCredentials> {
    const credentials = await this.getGoogleConfig() as FullCredentials;
    if ((credentials == null)) throw new Exception('Credentials not found');
    if ((credentials.accessToken == null)) throw new Exception('Access token not found');
    if ((credentials.refreshToken == null)) throw new Exception('Refresh token not found');
    if ((credentials.expiryDate == null)) throw new Exception('Expiry date not found');
    if ((credentials.expiryDate <= Date.now() - 1000)) {
      await refreshGoogleToken();
      return await this.getGoogleToken(refreshGoogleToken);
    }
    return credentials;
  }

  async deleteGoogleToken (): Promise<boolean> {
    const credentials = await this.getGoogleConfig() as FullCredentials;
    if ((credentials == null)) throw new Error('Credentials not found');
    credentials.accessToken = undefined;
    credentials.refreshToken = undefined;
    credentials.expiryDate = undefined;
    return await this.updateGoogleConfig(credentials);
  }
}
