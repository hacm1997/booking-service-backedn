export interface BookingDao {
  tenant: any
  entity: string
  pk: string
  sk: string
  booking_details: string
  bookingpk: string
  bookingsk: string
  start_date: string
  end_date: string
  dni: string
  password: string
  cellphone: string
  email: string
  username: string
  booking_code: string
  booking_state: string
  resource_code: string
  resource_name: string
  resource_owner: string
  resource_owner_email?: string
  resource_owner_email_password?: string
  resource_type: string
  resource_beds?: number
  resource_bathrooms?: number
  resource_capacity_kids?: number
  resource_capacity_adults?: number
  resource_bedrooms?: number
  resource_description?: string
  resource_location: string
  resource_price: number
  resource_mood?: string
  resource_area?: number
  resource_status: string
  resource_images?: string
  resource_amenities?: string
  resource_rules?: string
  resource_policies?: string
}
