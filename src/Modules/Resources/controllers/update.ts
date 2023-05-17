import { ResourceDynamoDBRepository } from '@Resources/infrastructure/ResourceDynamoDB.repository';
import { NextFunction, Request, Response } from 'express';
import { UpdateResourceUseCase } from '../app/useCases/updateResource';
import { ResourceOpenSearchRepository } from '../infrastructure/resourceOpensearch.repository';

export const updateResource = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const resource = req.body;
    const xsrfCookie = (req.headers.xsrfcookie as string).split(';').find((cookie: string) => cookie.includes('tenant'))?.split('=')[1];
    resource.tenant = xsrfCookie;
    const repository = new ResourceDynamoDBRepository(xsrfCookie as string);
    const opensearchRepository = new ResourceOpenSearchRepository(xsrfCookie as string);
    const useCase = new UpdateResourceUseCase(repository, opensearchRepository);
    const resourceUpdated = await useCase.run(resource, xsrfCookie);
    res.status(200).json({
      data: resourceUpdated,
      message: 'resource updated',
      status: 200,
      params_sent: {
        resource
      }
    });
  } catch (error) {
    next(error);
  }
};
