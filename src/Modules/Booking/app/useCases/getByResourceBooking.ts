import { Booking } from '@Booking/domain/entities/Booking';
import { BookingRepository } from '@Booking/domain/repositories/Booking';

export class GetByResourceBookingUseCase {
  private readonly _bookingRepository: BookingRepository;

  constructor (bookingRepository: BookingRepository) {
    this._bookingRepository = bookingRepository;
  }

  async run (code: string, startDate: string, endDate?: string): Promise<Booking[]> {
    return await this._bookingRepository.getByResource(code, startDate, endDate);
  }
}
