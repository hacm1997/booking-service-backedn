import { Exception } from 'utils/Exceptions';
import { FullCredentials } from 'utils/Oauth/config/google';
import GoogleService from 'utils/Oauth/service/google';

export class GoogleOauthService {
  constructor (private readonly googleService: GoogleService) {
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
