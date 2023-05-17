import { json } from 'utils/json.interface';

export interface ResourceDynamoDBDao {
  tenant: string
  entity: string
  pk: string
  sk: string
  resource_code: string
  resource_name: string
  resource_duration_available?: number
  resource_owner: string
  resource_owner_email?: string | null
  resource_owner_email_password?: string | null
  resource_type: string
  resource_beds?: number | null
  resource_bathrooms?: number
  resource_capacity_kids?: number
  resource_capacity_adults?: number
  resource_bedrooms?: number
  resource_description?: string | null
  resource_location: string
  resource_price: number
  resource_mood?: string | null
  resource_area?: number | null
  resource_status: string
  resource_images?: json | null
  resource_amenities?: json | null
  resource_rules?: json | null
  resource_policies?: json | null
  resource_characteristics?: json | null
}
