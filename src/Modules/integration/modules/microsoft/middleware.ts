import { NextFunction, Request, Response } from 'express';
import getClient from './client';
import * as microsoftGraph from '@microsoft/microsoft-graph-client';

export interface RequestWithGraphClient extends Request {
  graphClient?: microsoftGraph.Client | null
}

async function authMicrosoftMiddleware (
  req: RequestWithGraphClient,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    req.graphClient = await getClient;
    next();
  } catch (error) {
    console.error(error);
    res.status(401).send('Unauthorized');
  }
}

export default authMicrosoftMiddleware;
