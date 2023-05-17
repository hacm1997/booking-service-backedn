import { NextFunction, Request, Response } from 'express';
import { GetSlotsByResourceUseCase } from '../app/useCases/getSlotsByResource';
import { DynamoDBBookingRepository } from '../infrastucture/BookingDynamoDB';

export const getSlotsByResourceController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const resourceId = req.params.id;
    const start = req.query.start;
    const end = req.query.end;
    const xsrfCookie = (req.headers.xsrfcookie as string).split(';').find((cookie: string) => cookie.includes('tenant'))?.split('=')[1];
    const useCase = new GetSlotsByResourceUseCase(new DynamoDBBookingRepository(xsrfCookie));
    if (typeof start !== 'string') {
      throw new Error('start date must be a string');
    }
    if (end !== undefined && typeof end !== 'string') {
      throw new Error('end date must be a string');
    }
    const slots = await useCase.run(resourceId, start, end ?? undefined);
    res.status(200).json(slots);
  } catch (error) {
    next(error);
  }
};
