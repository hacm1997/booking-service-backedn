import { NextFunction, Request, Response } from 'express';
import { DeleteResourceUseCase } from '../app/useCases/deleteResource';
import { ResourceDynamoDBRepository } from '../infrastructure/ResourceDynamoDB.repository';
import { ResourceOpenSearchRepository } from '../infrastructure/resourceOpensearch.repository';

export const deleteResource = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { code } = req.params;
    const xsrfCookie = (req.headers.xsrfcookie as string).split(';').find((cookie: string) => cookie.includes('tenant'))?.split('=')[1];
    const repository = new ResourceDynamoDBRepository(xsrfCookie as string);
    const opensearchRepository = new ResourceOpenSearchRepository(xsrfCookie as string);
    const useCase = new DeleteResourceUseCase(repository, opensearchRepository);
    const resourceDeleted = await useCase.run(code);
    res.status(200).json({
      message: `DELETE RESOURCE: ${code}`,
      statusbar: 'success',
      data: resourceDeleted
    });
  } catch (error) {
    next(error);
  }
};
