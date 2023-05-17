import { Booking } from '@Booking/domain/entities/Booking';
import { BookingRepository } from '@Booking/domain/repositories/Booking';

export class GetByDniBookingUseCase {
  private readonly _bookingRepository: BookingRepository;

  constructor (bookingRepository: BookingRepository) {
    this._bookingRepository = bookingRepository;
  }

  async run (
    dni: string,
    startDate?: string,
    code?: string
  ): Promise<Booking[]> {
    return await this._bookingRepository.getByDNI(dni, startDate, code);
  }
}
