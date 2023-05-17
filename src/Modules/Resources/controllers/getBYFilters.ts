import { Response, Request, NextFunction } from 'express';
import { Exception } from 'utils/Exceptions';
import { json } from 'utils/json.interface';
import { ResourceDynamoDBRepository } from '../infrastructure/ResourceDynamoDB.repository';
import { ResourceOpenSearchRepository } from '../infrastructure/resourceOpensearch.repository';
import { DBType } from '../routes';

export const getAllResourcesByFiltersController = async (req: Request, res: Response, next: NextFunction, db: DBType): Promise<void> => {
  const filters = req.query as json;
  const characteristics = filters;
  characteristics.tenant = (req.headers.xsrfcookie as string).split(';').find((cookie: string) => cookie.includes('tenant'))?.split('=')[1];
  const xsrfCookie = (req.headers.xsrfcookie as string).split(';').find((cookie: string) => cookie.includes('tenant'))?.split('=')[1];
  if (db === DBType.dynamo) {
    const repository = new ResourceDynamoDBRepository(xsrfCookie as string);
    const resources = await repository.getByCharacteristics(characteristics);
    res.status(200).json({
      data: resources,
      message: 'resources listed',
      status: 200,
      params_sent: {
        filters
      }
    });
  } else if (db === DBType.opensearch) {
    try {
      const repository = new ResourceOpenSearchRepository(xsrfCookie as string);
      const resources = await repository.getByCharacteristics(characteristics);
      res.status(200).json({
        data: resources,
        message: 'resources listed',
        status: 200,
        params_sent: {
          filters
        }
      });
    } catch (error) {
      next(error);
    }
  } else {
    next(new Exception('DB type not found'));
  }
};
