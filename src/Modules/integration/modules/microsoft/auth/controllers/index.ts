import { NextFunction, Request, Response } from 'express';
import { FullCredentials } from 'utils/Oauth/config/google';
import MicrosoftService from '../services/microsoft.service';
import { MicrosoftOauthService } from '../services/oauth';

export const AuthSaveTokenController = async (res: Response, req: Request, next: NextFunction): Promise<void> => {
  try {
    const code = req.params.code;
    const codeQuery = req.query.code;
    const credentials = req.body as FullCredentials;
    if (code == null && codeQuery == null) {
      res.status(400).send('No code provided');
    }
    const tenant = (req.headers.xsrfcookie as string).split(';').find((cookie: string) => cookie.includes('tenant'))?.split('=')[1];
    const microsoftService = await MicrosoftService.getInstance(tenant ?? '');
    const googleOauthService = new MicrosoftOauthService(microsoftService);
    await googleOauthService.saveTokens(credentials);
    res.status(200).json({ message: 'Token saved' });
  } catch (error) {
    next(error);
  }
};

export const AuthGetTokensController = async (res: Response, req: Request, next: NextFunction): Promise<void> => {
  try {
    const tenant = (req.headers.xsrfcookie as string).split(';').find((cookie: string) => cookie.includes('tenant'))?.split('=')[1];
    const googleService = await MicrosoftService.getInstance(tenant ?? '');
    const googleOauthService = new MicrosoftOauthService(googleService);
    const auth = await googleOauthService.getTokens();
    res.status(200).send(auth);
  } catch (error) {
    next(error);
  }
};
