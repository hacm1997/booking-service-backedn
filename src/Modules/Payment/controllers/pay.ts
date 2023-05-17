import { NextFunction, Request, Response } from 'express';
import { DynamoDBBookingRepository } from 'Modules/Booking/infrastucture/BookingDynamoDB';
import { ResourceDynamoDBRepository } from 'Modules/Resources/infrastructure/ResourceDynamoDB.repository';
import { ResourceOpenSearchRepository } from 'Modules/Resources/infrastructure/resourceOpensearch.repository';
import { PaymentDto } from '../app/dto/payment';
import { PayUseCase } from '../app/usecases/pay';
import { DynamoDBPaymentRepository } from '../db/repository/Payment';

export const PayController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const xsrfCookie = (req.headers.xsrfcookie as string).split(';').find((cookie: string) => cookie.includes('tenant'))?.split('=')[1];
    if (xsrfCookie === undefined) {
      throw new Error('No XSRF cookie found');
    }
    const payData = req.body as PaymentDto;
    const paymentRepository = new DynamoDBPaymentRepository(xsrfCookie);
    const resourceRepository = new ResourceDynamoDBRepository(xsrfCookie);
    const bookingRepository = new DynamoDBBookingRepository(xsrfCookie);
    const openSearchRepository = new ResourceOpenSearchRepository(xsrfCookie);
    const payUseCase = new PayUseCase(paymentRepository, bookingRepository, resourceRepository, openSearchRepository);
    const payment = await payUseCase.run(payData);
    res.status(200).json({
      message: `PAYMENT of ${payment?.userDni ?? ''} user for ${payment?.resourceCode} resource from ${payment?.startDate ?? ''} to ${payment?.endDate}`,
      data: payment,
      statusbar: 'success'
    });
  } catch (error) {
    next(error);
  }
};
