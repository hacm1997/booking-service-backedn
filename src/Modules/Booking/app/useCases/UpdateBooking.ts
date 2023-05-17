import { Booking } from '@Booking/domain/entities/Booking';
import { BookingRepository } from '@Booking/domain/repositories/Booking';

export class UpdateBookingUseCase {
  private readonly _bookingRepository: BookingRepository;

  constructor (bookingRepository: BookingRepository) {
    this._bookingRepository = bookingRepository;
  }

  async run (startDate: string, state: string, resourceId: string): Promise<Booking> {
    const booking = await this._bookingRepository.get(startDate, resourceId);
    return await this._bookingRepository.setState(booking, state);
  }
}
