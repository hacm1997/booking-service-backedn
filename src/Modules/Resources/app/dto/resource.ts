import { json } from 'utils/json.interface';

export interface ResourceDto {
  code?: string
  name: string
  description: string
  characteristics: json
  owner: string
  durationAvailable?: number
  rating?: number
  rating_count?: number
  price?: number
  currency?: string
  state?: string
}
