export interface BookingDynamoDBDao {
  tenant: any
  entity: any
  pk: any
  sk: any
  booking_details: any
  bookingpk: any
  bookingsk: any
  start_date: any
  end_date: any
  dni: any
  password: any
  cellphone: any
  email: any
  username: any
  booking_code: any
  booking_state: any
  resource_code: any
  resource_name: any
  resource_owner: any
  resource_owner_email?: any
  resource_owner_email_password?: any
  resource_type: any
  resource_beds?: any
  resource_bathrooms?: any
  resource_capacity_kids?: any
  resource_capacity_adults?: any
  resource_bedrooms?: any
  resource_description?: any
  resource_location: any
  resource_price: any
  resource_mood?: any
  resource_area?: any
  resource_status: any
  resource_images?: any
  resource_amenities?: any
  resource_rules?: any
  resource_policies?: any
  user_email?: any
  user_cellphone?: any
  user_username?: any
  user_dni?: any
}
