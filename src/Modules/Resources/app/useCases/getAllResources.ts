import { Resource } from '@Resources/domain/entities/Resource';
import { ResourceRepository } from '@Resources/domain/repositories/Resource';

export class GetAllResourceUseCase {
  private readonly _resourceRepository: ResourceRepository;

  constructor (resourceRepository: ResourceRepository) {
    this._resourceRepository = resourceRepository;
  }

  async run (): Promise<Resource[]> {
    return await this._resourceRepository.getAll();
  }
}
