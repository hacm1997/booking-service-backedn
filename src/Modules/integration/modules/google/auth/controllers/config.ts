import { NextFunction, Request, Response } from 'express';
import { GoogleRepositoryDynamoDB } from '../repository';

export const createConfigController = async (res: Response, req: Request, next: NextFunction): Promise<void> => {
  try {
    const tenant = (req.headers.xsrfcookie as string).split(';').find((cookie: string) => cookie.includes('tenant'))?.split('=')[1];
    const credentials = req.body;
    const googleRepository = new GoogleRepositoryDynamoDB(tenant as string);
    const config = await googleRepository.createGoogleConfig(credentials);
    res.status(200).send(config);
  } catch (error) {
    next(error);
  }
};

export const getConfigController = async (res: Response, req: Request, next: NextFunction): Promise<void> => {
  try {
    const tenant = (req.headers.xsrfcookie as string).split(';').find((cookie: string) => cookie.includes('tenant'))?.split('=')[1];
    const googleRepository = new GoogleRepositoryDynamoDB(tenant as string);
    const config = await googleRepository.getGoogleConfig();
    res.status(200).send(config);
  } catch (error) {
    next(error);
  }
};

export const deleteConfigController = async (res: Response, req: Request, next: NextFunction): Promise<void> => {
  try {
    const tenant = (req.headers.xsrfcookie as string).split(';').find((cookie: string) => cookie.includes('tenant'))?.split('=')[1];
    const googleRepository = new GoogleRepositoryDynamoDB(tenant as string);
    const config = await googleRepository.deleteGoogleConfig();
    res.status(200).send(config);
  } catch (error) {
    next(error);
  }
};

export const updateConfigController = async (res: Response, req: Request, next: NextFunction): Promise<void> => {
  try {
    const tenant = (req.headers.xsrfcookie as string).split(';').find((cookie: string) => cookie.includes('tenant'))?.split('=')[1];
    const credentials = req.body;
    const googleRepository = new GoogleRepositoryDynamoDB(tenant as string);
    const config = await googleRepository.updateGoogleConfig(credentials);
    res.status(200).send(config);
  } catch (error) {
    next(error);
  }
};
