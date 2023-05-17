import { Resource } from '@Resources/domain/entities/Resource';
import { ResourceRepository } from '@Resources/domain/repositories/Resource';

export class GetResourcesBookingInRange {
  constructor (private readonly resourceRepository: ResourceRepository) {
    this.resourceRepository = resourceRepository;
  }

  async run (from: string, to: string): Promise<Resource[]> {
    to = to ?? new Date().getTime().toString();
    from = from ?? new Date().toUTCString();
    const resources = await this.resourceRepository.getByRange(from, to);
    return resources;
  }
}
