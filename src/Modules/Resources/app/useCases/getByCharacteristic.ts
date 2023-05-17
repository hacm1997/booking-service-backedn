import { BookingRepository } from '@Booking/domain/repositories/Booking';
import { Resource } from '@Resources/domain/entities/Resource';
import { ResourceRepository } from '@Resources/domain/repositories/Resource';
import { json } from 'utils/json.interface';

export class GetResourceByCharacteristic {
  private readonly _repository: ResourceRepository;
  private readonly _bookingRepository: BookingRepository;

  constructor (repository: ResourceRepository, bookingRepository: BookingRepository) {
    this._repository = repository;
    this._bookingRepository = bookingRepository;
  }

  async run (characteristics: json[], dateTo?: string, dateFrom?: string): Promise<Resource[]> {
    dateTo = dateTo ?? new Date().toDateString();
    dateFrom = dateFrom ?? new Date().toDateString();
    const resources = await this._repository.getByCharacteristics(characteristics);
    return resources;
  }
}
