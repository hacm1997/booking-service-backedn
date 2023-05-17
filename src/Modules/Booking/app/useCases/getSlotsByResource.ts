import { AvailabilitySlot } from 'Modules/Booking/domain/entities/AvailabilitySlot';
import { BookingRepository } from 'Modules/Booking/domain/repositories/Booking';
import { AvailabilitySlotDto } from '../dto/slots';

export class GetSlotsByResourceUseCase {
  private readonly repository: BookingRepository;
  constructor (repository: BookingRepository) {
    this.repository = repository;
  }

  async run (id: string, start: string, end?: string): Promise<AvailabilitySlotDto[]> {
    const slots = await this.repository.getAvailabilitySlotsByResource(id, start, end);
    return slots.map((slot: AvailabilitySlot) => {
      const { start_date: startDate, end_date: endDate, resource_id: resourceId } = slot;
      return {
        start_date: startDate,
        end_date: endDate,
        resource_id: resourceId
      };
    });
  }
}
