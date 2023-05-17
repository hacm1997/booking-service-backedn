import { GetAllByTenantBookingUseCase } from '@Booking/app/useCases/getAllBooking';
import { DynamoDBBookingRepository } from '@Booking/infrastucture/BookingDynamoDB';
import { Request, Response } from 'express';

export const getAllBookingController = async (req: Request, res: Response): Promise<void> => {
  // const { dateto, datefrom } = req.params;
  const xsrfCookie = (req.headers.xsrfcookie as string).split(';').find((cookie: string) => cookie.includes('tenant'))?.split('=')[1];
  const dynamoDBBookingRepository = new DynamoDBBookingRepository(xsrfCookie);
  const getAllUseCase = new GetAllByTenantBookingUseCase(dynamoDBBookingRepository);
  const bookings = await getAllUseCase.run();
  const response = {
    data: bookings,
    message: 'bookings listed',
    status: 200
  };
  res.status(200).json(response);
};
