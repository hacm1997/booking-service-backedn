import { Booking } from '../entities/Booking';
import { BookingRepository } from '../repositories/Booking';

export class AlreadyBooked {
  private bookings?: Booking[];

  constructor (private readonly bookingRepository: BookingRepository) {
    this.bookingRepository = bookingRepository;
  }

  /*
   * this function verify if the date is within a date range of the resource's Bookings
   * @param date
   * @returns boolean
   *
  */
  async run (resourceCode: string, date: Date): Promise<boolean> {
    this.bookings = await this.bookingRepository.getByResource(resourceCode, date.toISOString());
    return this.bookings.some((booking) => {
      const { date_from: dateFrom, date_to: dateTo } = booking;
      const startDate = new Date(dateFrom).getTime();
      const endDate = new Date(dateTo).getTime();
      const datetime = date.getTime();
      return datetime >= startDate && datetime <= endDate;
    });
  }
}
