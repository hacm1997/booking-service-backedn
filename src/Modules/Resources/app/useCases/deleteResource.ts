import { ResourceRepository } from 'Modules/Resources/domain/repositories/Resource';

export class DeleteResourceUseCase {
  private readonly _repository: ResourceRepository;
  private readonly _openSearchRepository: Partial<ResourceRepository>;

  constructor (repository: ResourceRepository, openSearchRepository: Partial<ResourceRepository>) {
    this._repository = repository;
    this._openSearchRepository = openSearchRepository;
  }

  async run (id: string): Promise<void> {
    await this._repository.delete(id);
    await this._openSearchRepository.delete?.(id);
  }
}
