import { NextFunction, Request, Response } from 'express';
import { GetPayUseCase } from '../app/usecases/getPay';
import { DynamoDBPaymentRepository } from '../db/repository/Payment';

export const getPayController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const bookingCode = req.params.bookingCode;
    const xsrfCookie = (req.headers.xsrfcookie as string).split(';').find((cookie: string) => cookie.includes('tenant'))?.split('=')[1];
    if (xsrfCookie === undefined) {
      throw new Error('No XSRF cookie found');
    }
    const paymentRepository = new DynamoDBPaymentRepository(xsrfCookie);
    const getPayUseCase = new GetPayUseCase(paymentRepository);
    const payment = await getPayUseCase.run(bookingCode);
    res.status(200).json(payment);
  } catch (error) {
    next(error);
  }
};
