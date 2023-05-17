import { json } from 'utils/json.interface';
import { UserDto } from 'Modules/Users/dto/User';

export interface BookingDto {
  tenant?: any
  user: UserDto
  booking: {
    status: string
    code: string
    details?: json
    resource_code: string
    start_date: string
    end_date: string
  }
};
