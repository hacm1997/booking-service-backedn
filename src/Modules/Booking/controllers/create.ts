import { CreateBookingUseCase } from '@Booking/app/useCases/CreateBooking';
import { DynamoDBBookingRepository } from '@Booking/infrastucture/BookingDynamoDB';
import { ResourceDynamoDBRepository } from '@Resources/infrastructure/ResourceDynamoDB.repository';
import { NextFunction, Request, Response } from 'express';
import { ResourceOpenSearchRepository } from 'Modules/Resources/infrastructure/resourceOpensearch.repository';
import { listenerEpayco } from 'utils/services/cron';

export const createBooking = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const booking = req.body;
    const resource = booking.booking.resource;
    const xsrfCookie = (req.headers.xsrfcookie as string).split(';').find((cookie: string) => cookie.includes('tenant'))?.split('=')[1];
    if (xsrfCookie === undefined) {
      throw new Error('XSRF Cookie not found');
    }
    const bookingRepository = new DynamoDBBookingRepository(xsrfCookie, resource);
    const resourceRepository = new ResourceDynamoDBRepository(xsrfCookie);
    const openSearchRepository = new ResourceOpenSearchRepository(xsrfCookie);
    const bookingCreator = new CreateBookingUseCase(bookingRepository, resourceRepository, openSearchRepository);
    const bookingCreated = await bookingCreator.run(booking, xsrfCookie);
    res.status(200).json({
      message: `CREATE BOOKING ${bookingCreated?.booking?.code ?? ''}`,
      data: bookingCreated,
      statusbar: 'success'
    });
    await listenerEpayco(xsrfCookie ?? '', bookingCreated?.booking?.code ?? '', bookingCreated?.booking?.resource_code ?? '', bookingCreated?.booking?.start_date ?? '', bookingCreated?.booking?.end_date ?? '', bookingCreated ?? []);
  } catch (error) {
    next(error);
  }
};
