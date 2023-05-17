import { CreateResourceUseCase } from '@Resources/app/useCases/createResource';
import { ResourceDynamoDBRepository } from '@Resources/infrastructure/ResourceDynamoDB.repository';
import { NextFunction, Request, Response } from 'express';
import { ResourceOpenSearchRepository } from '../infrastructure/resourceOpensearch.repository';

export const createResource = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const resource = req.body;
    const xsrfCookie = (req.headers.xsrfcookie as string).split(';').find((cookie: string) => cookie.includes('tenant'))?.split('=')[1];
    resource.tenant = xsrfCookie;
    const repository = new ResourceDynamoDBRepository(xsrfCookie as string);
    const opensearchRepository = new ResourceOpenSearchRepository(xsrfCookie as string);
    const useCase = new CreateResourceUseCase(repository, opensearchRepository);
    const resourceCreated = await useCase.run(resource, xsrfCookie);
    res.status(200).json({
      message: `CREATE RESOURCE: ${resourceCreated.code ?? ''}`,
      statusbar: 'success',
      data: resourceCreated
    });
  } catch (error) {
    next(error);
  }
};
