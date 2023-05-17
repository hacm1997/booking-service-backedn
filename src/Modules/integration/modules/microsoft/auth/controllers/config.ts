import { NextFunction, Request, Response } from 'express';
import { MicrosoftRepositoryDynamoDB } from '../repository';

export const createConfigController = async (res: Response, req: Request, next: NextFunction): Promise<void> => {
  try {
    const tenant = (req.headers.xsrfcookie as string).split(';').find((cookie: string) => cookie.includes('tenant'))?.split('=')[1];
    const credentials = req.body;
    const microsoftRepository = new MicrosoftRepositoryDynamoDB(tenant as string);
    const config = await microsoftRepository.createMicrosoftConfig(credentials);
    res.status(200).send(config);
  } catch (error) {
    next(error);
  }
};

export const getConfigController = async (res: Response, req: Request, next: NextFunction): Promise<void> => {
  try {
    const tenant = (req.headers.xsrfcookie as string).split(';').find((cookie: string) => cookie.includes('tenant'))?.split('=')[1];
    const microsoftRepository = new MicrosoftRepositoryDynamoDB(tenant as string);
    const config = await microsoftRepository.getMicrosoftConfig();
    res.status(200).send(config);
  } catch (error) {
    next(error);
  }
};

export const deleteConfigController = async (res: Response, req: Request, next: NextFunction): Promise<void> => {
  try {
    const tenant = (req.headers.xsrfcookie as string).split(';').find((cookie: string) => cookie.includes('tenant'))?.split('=')[1];
    const microsoftRepository = new MicrosoftRepositoryDynamoDB(tenant as string);
    const config = await microsoftRepository.deleteMicrosoftConfig();
    res.status(200).send(config);
  } catch (error) {
    next(error);
  }
};

export const updateConfigController = async (res: Response, req: Request, next: NextFunction): Promise<void> => {
  try {
    const tenant = (req.headers.xsrfcookie as string).split(';').find((cookie: string) => cookie.includes('tenant'))?.split('=')[1];
    const credentials = req.body;
    const microsoftRepository = new MicrosoftRepositoryDynamoDB(tenant as string);
    const config = await microsoftRepository.updateMicrosoftConfig(credentials);
    res.status(200).send(config);
  } catch (error) {
    next(error);
  }
};
