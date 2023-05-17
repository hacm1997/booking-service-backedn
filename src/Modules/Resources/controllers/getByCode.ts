import { GetResourceUseCase } from '@Resources/app/useCases/getResource';
import { ResourceDynamoDBRepository } from '@Resources/infrastructure/ResourceDynamoDB.repository';
import { NextFunction, Request, Response } from 'express';

export const getResourceByCodeController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { code } = req.params;
  const xsrfCookie = (req.headers.xsrfcookie as string).split(';').find((cookie: string) => cookie.includes('tenant'))?.split('=')[1];
  const dynamoDBResourceRepository = new ResourceDynamoDBRepository(xsrfCookie as string);
  try {
    const useCase = new GetResourceUseCase(dynamoDBResourceRepository);
    const resource = await useCase.run(code);
    const response = {
      data: resource,
      message: 'resource listed',
      status: 200,
      params_sent: {
        code
      }
    };
    res.status(200).json(response);
  } catch (error: any) {
    if (error.message === 'Resource not found') {
      const response = {
        data: null,
        message: 'resource not found',
        status: 404,
        params_sent: {
          code
        }
      };
      res.status(404).json(response);
    } else {
      next(error);
    }
  }
};
