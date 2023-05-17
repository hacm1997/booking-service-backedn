import { Guest } from './entities/Guest';

export interface GuestRepository {
  get: (id: string) => Promise<Guest | undefined>
  save: (Guest: Guest) => Promise<boolean>
  delete: (id: string) => Promise<boolean>
  getAll: () => Promise<Guest[]>
  update: (Guest: Partial<Guest>) => Promise<boolean>
}
