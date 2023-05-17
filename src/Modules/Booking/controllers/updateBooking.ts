import { UpdateBookingUseCase } from '@Booking/app/useCases/UpdateBooking';
import { DynamoDBBookingRepository } from '@Booking/infrastucture/BookingDynamoDB';
import { NextFunction, Request, Response } from 'express';

export const updateBookingController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { start_date: startDate } = req.params;
  const { resource_id: resourceId } = req.query;
  const { state } = req.body;
  const xsrfCookie = (req.headers.xsrfcookie as string).split(';').find((cookie: string) => cookie.includes('tenant'))?.split('=')[1];
  const bookingRepository = new DynamoDBBookingRepository(xsrfCookie, startDate);
  const bookingUseCase = new UpdateBookingUseCase(bookingRepository);
  const bookingUpdated = await bookingUseCase.run(startDate, state, resourceId as string);
  res.status(200).json({
    message: `UPDATE BOOKING: ${bookingUpdated as unknown as string}`,
    statusbar: 'success'
  });
};

export const updateBooking = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { code, startDate, state } = req.params;
    // const { startDate } = req.query;
    // const state = req.body;
    console.log('state =>', state);
    console.log('startDate =>', startDate);
    console.log('resource_id =>', code);
    const xsrfCookie = (req.headers.xsrfcookie as string).split(';').find((cookie: string) => cookie.includes('tenant'))?.split('=')[1];
    const bookingRepository = new DynamoDBBookingRepository(xsrfCookie, startDate);
    const bookingUseCase = new UpdateBookingUseCase(bookingRepository);
    const bookingUpdated = await bookingUseCase.run(startDate ?? '' as string, state, code ?? '' as string);
    res.status(200).json({
      message: `UPDATE BOOKING: ${bookingUpdated as unknown as string}`,
      statusbar: 'success'
    });
  } catch (error) {
    next(error);
  }
};
