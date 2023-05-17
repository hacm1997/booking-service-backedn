import { GetByDniBookingUseCase } from '@Booking/app/useCases/getByDniBooking';
import { DynamoDBBookingRepository } from '@Booking/infrastucture/BookingDynamoDB';
import { Request, Response } from 'express';

export const getByDniBookingController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const {
    dni,
    start_date: startDate,
    code
  } = req.query as { dni: string, start_date: string, code?: string };
  const xsrfCookie = (req.headers.xsrfcookie as string)
    .split(';')
    .find((cookie: string) => cookie.includes('tenant'))
    ?.split('=')[1];
  const dynamoDBBookingRepository = new DynamoDBBookingRepository(xsrfCookie);
  const useCase = new GetByDniBookingUseCase(dynamoDBBookingRepository);
  const bookings = await useCase.run(dni, startDate, code);
  const response = {
    data: bookings,
    message: 'bookings listed',
    status: 200,
    params_sent: {
      dni,
      startDate,
      code
    }
  };
  res.status(200).json(response);
};
