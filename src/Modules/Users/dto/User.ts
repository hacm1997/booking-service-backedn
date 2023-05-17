import { GuestDetails } from '../domain/entities/Details';

export interface UserDto {
  dni: string
  name: string
  email: string
  cellphone: string
  details?: GuestDetails[]
}
