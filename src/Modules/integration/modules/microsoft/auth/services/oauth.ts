import { Exception } from 'utils/Exceptions';
import { FullCredentials } from 'utils/Oauth/config/google';
import MicrosoftService from './microsoft.service';

export class MicrosoftOauthService {
  constructor (private readonly googleService: MicrosoftService) {
    this.googleService = googleService;
  }

  async getTokens (): Promise<FullCredentials> {
    return await this.googleService.getCredentials();
  }

  async saveTokens (credentials: FullCredentials): Promise<void> {
    await this.googleService.saveCredentials(credentials).then(() => {
      console.log('Credentials saved');
      console.log(credentials);
    }).catch(() => {
      throw new Exception('Error saving credentials');
    });
  }
}
