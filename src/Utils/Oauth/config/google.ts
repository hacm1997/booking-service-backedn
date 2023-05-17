export const SCOPES = [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile'
];

export const TOKENPATH = '../credentials';
export const CREDENTIALSPATH = '../credentials';

export interface CredentialsInit {
  clientId?: string | undefined
  clientSecret?: string | undefined
  redirectUri?: string | undefined
}

export interface FullCredentials extends CredentialsInit {
  code: string
  accessToken?: string | undefined
  refreshToken?: string | undefined
  expiryDate?: number | undefined
  tokenType?: string | undefined
}

export interface Credentials {
  clientId: string
  clientSecret: string
  redirectUri: string
}
