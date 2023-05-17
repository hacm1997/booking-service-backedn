import { ResourceRepository } from '@Resources/domain/repositories/Resource';
import { MapperResourceDomainDto } from 'Modules/Resources/mappers/DomainDto';
import { ResourceDto } from '../dto/resource';

export class GetResourceUseCase {
  private readonly _resourceRepository: ResourceRepository;
  private readonly _mapperResource: MapperResourceDomainDto;

  constructor (resourceRepository: ResourceRepository) {
    this._resourceRepository = resourceRepository;
    this._mapperResource = new MapperResourceDomainDto();
  }

  async run (code: string): Promise<ResourceDto> {
    const resource = await this._resourceRepository.get(code);
    return this._mapperResource.to(resource);
  }
}
