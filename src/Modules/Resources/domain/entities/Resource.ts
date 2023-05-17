import { json } from 'utils/json.interface';
import { Rating } from './Rating';

export interface ResourceProps {
  tenant?: string
  entity?: string
  code: string
  status: string
  name: string
  owner: string
  durationAvailable?: number
  resourceCharacteristics: json[]
  ratings?: Rating[]
}

export class Resource {
  tenant?: string;
  code: string;
  status: string;
  entity?: string;
  name: string;
  owner: string;
  durationAvailable?: number;
  resourceCharacteristics: json[];
  ratings?: Rating[];

  constructor (resource: ResourceProps) {
    this.tenant = resource.tenant;
    this.code = resource.code;
    this.name = resource.name;
    this.owner = resource.owner;
    this.status = resource.status;
    this.entity = resource.entity;
    this.durationAvailable = resource.durationAvailable;
    this.resourceCharacteristics = resource.resourceCharacteristics;
    this.ratings = resource.ratings;
  }

  static create (resource: ResourceProps): Resource {
    return new Resource(resource);
  }
}
