import { FactureDto } from './facture';

export interface PaymentDto {
  tenant: string
  bookingCode: string
  resourceCode: string
  userDni: string
  method: string
  startDate: string
  endDate: string
  facture: FactureDto
}
