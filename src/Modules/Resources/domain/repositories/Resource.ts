import { json } from 'utils/json.interface';
import { Resource } from '../entities/Resource';

export interface ResourceRepository {
  tenant: string
  create: (resource: Resource) => Promise<Resource>
  insertRating: (resource: Resource, rating: number, dni: string) => Promise<Resource>
  get: (code: string) => Promise<Resource>
  getByCharacteristics: (characteristics: json) => Promise<Resource[]>
  getAll: () => Promise<Resource[]>
  delete: (code: string) => Promise<unknown>
  getByRange: (from: string, to?: string) => Promise<Resource[]>
  getByOwner: (owner: string) => Promise<Resource[]>
  updateAvailabilitySlots?: (id: string, from: string, to: string) => Promise<unknown>
  deleteAvailabilitySlots?: (id: string, from: string, to: string) => Promise<unknown>
  update: (resource: Resource) => Promise<Resource>
}
