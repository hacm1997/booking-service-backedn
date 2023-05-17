export interface AvailabilitySlotDao {
  pk: string
  sk: string
  tenant: string
  resource_code: string
  start_date: string
  entity: string
  end_date: string
  state?: string
  details?: string
}
