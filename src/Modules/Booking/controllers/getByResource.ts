import { GetByResourceBookingUseCase } from '@Booking/app/useCases/getByResourceBooking';
import { DynamoDBBookingRepository } from '@Booking/infrastucture/BookingDynamoDB';
import { Request, Response } from 'express';

export const getByResourceBookingController = async (req: Request, res: Response): Promise<void> => {
  const { resource, start_date: startDate, end_date: endDate } = req.query as { resource: string, start_date: string, end_date?: string };
  const xsrfCookie = (req.headers.xsrfcookie as string).split(';').find((cookie: string) => cookie.includes('tenant'))?.split('=')[1];
  const dynamoDBBookingRepository = new DynamoDBBookingRepository(xsrfCookie, resource);
  const useCase = new GetByResourceBookingUseCase(dynamoDBBookingRepository);
  const bookings = await useCase.run(resource, startDate ?? new Date().toISOString(), endDate);
  const response = {
    data: bookings,
    message: 'bookings listed',
    status: 200,
    params_sent: {
      resource,
      startDate
    }
  };
  res.status(200).json(response);
};
