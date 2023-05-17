import { Guest } from '@Users/domain/entities/Guest';
import { AvailabilitySlot } from '../entities/AvailabilitySlot';
import { Booking } from '../entities/Booking';

// This interface was implemented by the class DynamoDBBookingRepository
export interface BookingRepository {
  tenant: string
  resource?: string
  create: (booking: Booking) => Promise<Booking>
  setState: (booking: Booking, state: string) => Promise<Booking>
  get: (
    start_date: string,
    resource_id: string,
    end_date?: string
  ) => Promise<Booking>
  getByResource: (
    code: string,
    startDate: string,
    endDate?: string | Date
  ) => Promise<Booking[]>
  getByDNI: (
    dni: string,
    startDate?: string,
    code?: string
  ) => Promise<Booking[]>
  getAll: () => Promise<Booking[]>
  delete: (dni: string, dateFrom: string) => Promise<unknown>
  getAvailabilitySlotsByResource: (
    resource_id: string,
    start_date: string,
    end_date?: string
  ) => Promise<AvailabilitySlot[]>
  updateAvailabilitySlotByResource: (
    resource_id: string,
    slot: AvailabilitySlot
  ) => Promise<AvailabilitySlot>
  createAvailabilitySlotByResource: (
    resource_id: string,
    slot: AvailabilitySlot
  ) => Promise<any>
  deleteAvailabilitySlotByResource: (
    resource_id: string,
    start_date: string,
    end_date: string
  ) => Promise<AvailabilitySlot>
  // ToDo: Reubicar este método en el repositorio de usuarios
  getUser: (dni: string) => Promise<Guest>
  // ToDo: Reubicar este método en el repositorio de usuarios
  createUser: (user: Guest) => Promise<Guest>
}
