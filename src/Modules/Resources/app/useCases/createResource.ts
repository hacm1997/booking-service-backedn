import { Resource } from '@Resources/domain/entities/Resource';
import { ResourceRepository } from '@Resources/domain/repositories/Resource';
import { MapperResourceDomainDto } from '@Resources/mappers/DomainDto';
import { ResourceAlreadyExist } from 'Modules/Resources/domain/services/ResourceAlreadyExxist';
import { Exception } from 'utils/Exceptions';
import { ResourceDto } from '../dto/resource';

export class CreateResourceUseCase {
  private readonly _resourceRepository: ResourceRepository;
  private readonly _openSearchRepository: Partial<ResourceRepository>;
  private readonly _mapper = new MapperResourceDomainDto();

  constructor (resourceRepository: ResourceRepository, openSearchRepository: Partial<ResourceRepository>) {
    this._resourceRepository = resourceRepository;
    this._openSearchRepository = openSearchRepository;
  }

  async run (resource: ResourceDto, tenant: any): Promise<ResourceDto> {
    const resourceDomain: Resource = this._mapper.from(resource, tenant);
    const resourceAlreadyExist = new ResourceAlreadyExist(this._resourceRepository);
    const isAlreadyExist = await resourceAlreadyExist.run(resource.code ?? '');
    if (isAlreadyExist) {
      throw new Exception('Resource already exist');
    }
    const resourceOpenSearch = await this._openSearchRepository.create?.(resourceDomain);
    resourceDomain.code = resourceOpenSearch?.code ?? resourceDomain.code;

    const resourceDb = await this._resourceRepository.create(resourceDomain);
    return this._mapper.to(resourceDb);
  }
}
