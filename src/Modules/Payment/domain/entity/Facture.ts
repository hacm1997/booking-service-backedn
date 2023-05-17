import { json } from 'utils/json.interface';

export interface Facture {
  id: string
  tenant: string
  bookingCode: string
  resourceCode: string
  userDni: string
  method: string
  startDate: string
  endDate: string
  details: json
  total: number
  status: string
  created_at: string
  updated_at: string
}
