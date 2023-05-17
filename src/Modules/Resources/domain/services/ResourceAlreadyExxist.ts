import { ResourceRepository } from '../repositories/Resource';

export class ResourceAlreadyExist {
  private readonly _resourceRepository: ResourceRepository;

  constructor (resourceRepository: ResourceRepository) {
    this._resourceRepository = resourceRepository;
  }

  async run (code: string): Promise<boolean> {
    const resource = await this._resourceRepository.get(code);
    return resource.code !== '';
  }
}
