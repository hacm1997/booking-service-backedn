import { json } from 'utils/json.interface';

export interface FactureDto {
  reference: string
  booking_code: string
  status: string
  details: json
  total: number
}
