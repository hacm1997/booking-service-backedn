import { Booking } from '@Booking/domain/entities/Booking';
import { BookingRepository } from '@Booking/domain/repositories/Booking';

export class GetAllByTenantBookingUseCase {
  private readonly _bookingRepository: BookingRepository;

  constructor (bookingRepository: BookingRepository) {
    this._bookingRepository = bookingRepository;
  }

  async run (): Promise<Booking[]> {
    return await this._bookingRepository.getAll();
  }
}
