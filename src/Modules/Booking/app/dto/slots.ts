export interface AvailabilitySlotDto {
  start_date: string
  end_date: string
  resource_id: string
  slots?: AvailabilitySlotDto[]
}
