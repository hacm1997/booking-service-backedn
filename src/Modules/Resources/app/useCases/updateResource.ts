import { Resource } from '@Resources/domain/entities/Resource';
import { ResourceRepository } from '@Resources/domain/repositories/Resource';
import { MapperResourceDomainDto } from 'Modules/Resources/mappers/DomainDto';
import { ResourceDto } from '../dto/resource';

export class UpdateResourceUseCase {
  private readonly _repository: ResourceRepository;
  private readonly _openSearchRepository: Partial<ResourceRepository>;
  private readonly _mapper = new MapperResourceDomainDto();

  constructor (repository: ResourceRepository, openSearchRepository: Partial<ResourceRepository>) {
    this._openSearchRepository = openSearchRepository;
    this._repository = repository;
  }

  async run (resource: ResourceDto, tenant: any): Promise<Resource> {
    const resourceDomain: Resource = this._mapper.from(resource, tenant);
    await this._openSearchRepository.update?.(resourceDomain);
    return await this._repository.update(resourceDomain);
  }
}
