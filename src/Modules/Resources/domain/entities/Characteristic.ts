import { json } from 'utils/json.interface';

export interface ResourceCharacteristic {
  code: string
  value: string | number | boolean | json | null | undefined
  description?: string
}
