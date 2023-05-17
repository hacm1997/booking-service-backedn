import { BookingDto } from '@Booking/app/dto/booking';
import { Booking } from '@Booking/domain/entities/Booking';
import { Resource } from '@Resources/domain/entities/Resource';
import { Guest } from '@Users/domain/entities/Guest';
import { Mapper } from 'utils/interfaces/mappers';
import { uuidv4 } from 'utils/services/uuid';

export class MapperBookingDomainDto implements Mapper<Booking, BookingDto> {
  to (entity: Booking): BookingDto {
    return {
      booking: {
        code: entity.code,
        status: entity.state as string,
        resource_code: entity.resource.code ?? '',
        start_date: entity.date_from.toString(),
        end_date: entity.date_to.toString(),
        details: entity.bookingDetails
      },
      user: {
        dni: entity.booker?.id as string,
        email: entity.booker?.email as string,
        cellphone: entity.booker?.cellphone as string,
        name: entity.booker?.name as string,
        details: entity.booker?.details
      }
    };
  }

  from (dto: BookingDto, tenant?: string, resource?: Resource): Booking {
    const code = uuidv4();
    return new Booking(
      {
        id: `User#${tenant as string}`,
        code,
        sk: `Booking#${dto.user?.dni}#${dto.booking.resource_code}#${dto.booking.start_date}#${code}}`,
        date_from: new Date(dto.booking.start_date).toISOString(),
        date_to: new Date(dto.booking.end_date).toISOString(),
        state: dto.booking.status,
        resource: resource as Resource,
        booker: new Guest(
          dto.user?.dni,
          dto.user?.name,
          dto.user?.email,
          dto.user?.cellphone,
          dto.user?.details
        ),
        bookers: [new Guest(
          dto.user?.dni,
          dto.user?.name,
          dto.user?.email,
          dto.user?.cellphone,
          dto.user?.details
        )],
        bookingDetails: dto.booking.details
      });
  }
}
