import { Booking } from '@Booking/domain/entities/Booking';
import { BookingDao } from '@Booking/infrastucture/dao/Booking';
import { MapperResourceDomainDao } from '@Resources/mappers/DomainDao';
import { GuestDao } from '@Users/dao/Guest';
import { MapperUserDomainDao } from '@Users/mappers/DomainDao';
import { Mapper } from 'utils/interfaces/mappers';
import { BookingDynamoDBDao } from '../../infrastucture/dao/Booking.dynamo';

export class MapperBookingDomainDao implements Mapper<Booking, BookingDao> {
  mapperResource = new MapperResourceDomainDao();
  mapperUser = new MapperUserDomainDao();
  to (entity: Booking): BookingDao {
    return {
      tenant: entity.id.split('#')[1],
      booking_code: entity.code,
      booking_details: JSON.stringify(entity.bookingDetails),
      booking_state: entity.state !== undefined ? entity.state : 'pending',
      bookingpk: entity.id,
      bookingsk: entity.sk !== undefined ? entity.sk : 'booking',
      cellphone: entity.booker !== undefined ? entity.booker.cellphone : '',
      email: entity.booker !== undefined ? entity.booker.email : '',
      username: entity.booker !== undefined ? entity.booker.name : '',
      dni: entity.booker !== undefined ? entity.booker.id : '',
      pk: entity.id,
      password: '',
      resource_code: entity.resource !== undefined ? entity.resource.code ?? '' : '',
      resource_location: entity.resource !== undefined ? entity.resource.resourceCharacteristics?.find((characteristic) => characteristic.code === 'location')?.value : '',
      resource_name: entity.resource !== undefined ? entity.resource.name ?? '' : '',
      resource_owner: entity.resource !== undefined ? entity.resource.owner ?? '' : '',
      resource_owner_email: entity.resource !== undefined ? entity.resource.resourceCharacteristics?.find((characteristic) => characteristic.code === 'owner_email')?.value : '',
      resource_price: entity.resource !== undefined ? entity.resource.resourceCharacteristics?.find((characteristic) => characteristic.code === 'price')?.value : 0,
      resource_status: entity.resource !== undefined ? entity.resource.status ?? '' : '',
      resource_type: entity.resource !== undefined ? entity.resource.resourceCharacteristics?.find((characteristic) => characteristic.code === 'type')?.value : '',
      sk: `booking#${entity.booker?.id as string}#${new Date(entity.date_from).toISOString()}#${entity.code}`,
      resource_amenities: entity.resource !== undefined ? entity.resource.resourceCharacteristics?.find((characteristic) => characteristic.code === 'amenities')?.value : [],
      resource_area: entity.resource !== undefined ? entity.resource.resourceCharacteristics?.find((characteristic) => characteristic.code === 'area')?.value : 0,
      resource_bathrooms: entity.resource !== undefined ? entity.resource.resourceCharacteristics?.find((characteristic) => characteristic.code === 'bathrooms')?.value : 0,
      resource_bedrooms: entity.resource !== undefined ? entity.resource.resourceCharacteristics?.find((characteristic) => characteristic.code === 'bedrooms')?.value : 0,
      end_date: new Date(entity.date_to).toISOString(),
      entity: 'booking',
      resource_beds: entity.resource !== undefined ? entity.resource.resourceCharacteristics?.find((characteristic) => characteristic.code === 'beds')?.value : 0,
      start_date: new Date(entity.date_from).toISOString(),
      resource_capacity_adults: entity.resource !== undefined ? entity.resource.resourceCharacteristics?.find((characteristic) => characteristic.code === 'capacity_adults')?.value : 0,
      resource_capacity_kids: entity.resource !== undefined ? entity.resource.resourceCharacteristics?.find((characteristic) => characteristic.code === 'capacity_kids')?.value : 0,
      resource_description: entity.resource !== undefined ? entity.resource.resourceCharacteristics?.find((characteristic) => characteristic.code === 'description')?.value : '',
      resource_images: entity.resource !== undefined ? entity.resource.resourceCharacteristics?.find((characteristic) => characteristic.code === 'images')?.value : [],
      resource_mood: entity.resource !== undefined ? entity.resource.resourceCharacteristics?.find((characteristic) => characteristic.code === 'mood')?.value : '',
      resource_owner_email_password: entity.resource !== undefined ? entity.resource.resourceCharacteristics?.find((characteristic) => characteristic.code === 'owner_email_password')?.value : '',
      resource_policies: entity.resource !== undefined ? entity.resource.resourceCharacteristics?.find((characteristic) => characteristic.code === 'policies')?.value : [],
      resource_rules: entity.resource !== undefined ? entity.resource.resourceCharacteristics?.find((characteristic) => characteristic.code === 'rules')?.value : []
    };
  }

  from (dao: BookingDao): Booking {
    const guestDao: GuestDao = {
      guest_code: dao.dni,
      guest_email: dao.email,
      guest_name: dao.username,
      guest_cellphone: dao.cellphone,
      guest_details: JSON.stringify({
        dni: dao.dni,
        email: dao.email,
        name: dao.username,
        cellphone: dao.cellphone
      })
    };
    return new Booking({
      id: `User#${dao.tenant as string}`,
      sk: dao.sk,
      code: dao.booking_code,
      date_from: new Date(dao.start_date).toISOString(),
      date_to: new Date(dao.end_date).toISOString(),
      state: dao.booking_state,
      resource: dao.resource_code !== undefined
        ? {
            status: dao.resource_status,
            code: dao.resource_code,
            name: dao.resource_name,
            owner: dao.resource_owner,
            resourceCharacteristics: [
              {
                code: 'location',
                value: dao.resource_location
              },
              {
                code: 'owner_email',
                value: dao.resource_owner_email
              },
              {
                code: 'price',
                value: dao.resource_price
              },
              {
                code: 'status',
                value: dao.resource_status
              },
              {
                code: 'type',
                value: dao.resource_type
              },
              {
                code: 'amenities',
                value: dao.resource_amenities
              },
              {
                code: 'area',
                value: dao.resource_area
              },
              {
                code: 'bathrooms',
                value: dao.resource_bathrooms
              },
              {
                code: 'bedrooms',
                value: dao.resource_bedrooms
              },
              {
                code: 'beds',
                value: dao.resource_beds
              },
              {
                code: 'capacity_adults',
                value: dao.resource_capacity_adults
              },
              {
                code: 'capacity_kids',
                value: dao.resource_capacity_kids
              },
              {
                code: 'description',
                value: dao.resource_description
              },
              {
                code: 'images',
                value: dao.resource_images
              },
              {
                code: 'mood',
                value: dao.resource_mood
              },
              {
                code: 'owner_email_password',
                value: dao.resource_owner_email_password
              },
              {
                code: 'policies',
                value: dao.resource_policies
              },
              {
                code: 'rules',
                value: dao.resource_rules
              }
            ]
          }
        : {},
      booker: this.mapperUser.from(guestDao),
      bookers: [this.mapperUser.from(guestDao)],
      bookingDetails: dao.booking_details !== 'undefined' ? JSON.parse(dao.booking_details) : undefined,
      calendar_block_id: dao.booking_details !== 'undefined' ? JSON.parse(dao.booking_details).calendar_block_id : undefined
    });
  }
}

export class MapperBookingDynamoDBDao implements Mapper<BookingDao, BookingDynamoDBDao> {
  to (entity: BookingDao, tenant?: string): BookingDynamoDBDao {
    return {
      pk: {
        S: entity.pk
      },
      sk: {
        S: entity.sk
      },
      entity: {
        S: entity.entity
      },
      booking_code: {
        S: entity.booking_code
      },
      dni: {
        S: entity.dni
      },
      username: {
        S: entity.username
      },
      email: {
        S: entity.email
      },
      cellphone: {
        S: entity.cellphone
      },
      start_date: {
        S: entity.start_date
      },
      end_date: {
        S: entity.end_date
      },
      resource_code: {
        S: entity.resource_code
      },
      resource_name: {
        S: entity.resource_name
      },
      resource_owner: {
        S: entity.resource_owner
      },
      resource_location: {
        S: entity.resource_location
      },
      resource_owner_email: {
        S: entity.resource_owner_email
      },
      resource_price: {
        N: entity.resource_price
      },
      resource_status: {
        S: entity.resource_status
      },
      resource_type: {
        S: entity.resource_type
      },
      resource_amenities: {
        S: entity.resource_amenities
      },
      resource_area: {
        N: entity.resource_area
      },
      resource_bathrooms: {
        N: entity.resource_bathrooms
      },
      resource_bedrooms: {
        N: entity.resource_bedrooms
      },
      resource_beds: {
        N: entity.resource_beds
      },
      resource_capacity_adults: {
        N: entity.resource_capacity_adults
      },
      resource_capacity_kids: {
        N: entity.resource_capacity_kids
      },
      resource_description: {
        S: entity.resource_description
      },
      resource_images: {
        S: entity.resource_images
      },
      resource_mood: {
        S: entity.resource_mood
      },
      resource_owner_email_password: {
        S: entity.resource_owner_email_password
      },
      resource_policies: {
        S: entity.resource_policies
      },
      resource_rules: {
        S: entity.resource_rules
      },
      booking_details: {
        S: entity.booking_details
      },
      tenant: {
        S: tenant ?? ''
      },
      booking_state: {
        S: entity.booking_state
      },
      bookingpk: {
        S: entity.bookingpk
      },
      bookingsk: {
        S: entity.bookingsk
      },
      password: {
        S: entity.password
      }
    };
  }

  from (dao: BookingDynamoDBDao): BookingDao {
    return {
      pk: dao.pk.S,
      sk: dao.sk.S,
      entity: dao.entity?.S,
      booking_code: dao.booking_code?.S,
      dni: dao.dni !== undefined ? dao.dni.S : dao.user_dni?.S,
      username: dao.username !== undefined ? dao.username.S : dao.user_username?.S,
      email: dao.email !== undefined ? dao.email.S : dao.user_email?.S,
      cellphone: dao.cellphone !== undefined ? dao.cellphone.S : dao.user_cellphone?.S,
      start_date: dao.start_date?.S,
      end_date: dao.end_date?.S,
      resource_code: dao.resource_code?.S,
      resource_name: dao.resource_name?.S,
      resource_owner: dao.resource_owner?.S,
      resource_location: dao.resource_location?.S,
      resource_owner_email: dao.resource_owner_email?.S,
      resource_price: dao.resource_price?.N,
      resource_status: dao.resource_status?.S,
      resource_type: dao.resource_type?.S,
      resource_amenities: dao.resource_amenities?.S,
      resource_area: dao.resource_area?.N,
      resource_bathrooms: dao.resource_bathrooms?.N,
      resource_bedrooms: dao.resource_bedrooms?.N,
      resource_beds: dao.resource_beds?.N,
      resource_capacity_adults: dao.resource_capacity_adults?.N,
      resource_capacity_kids: dao.resource_capacity_kids?.N,
      resource_description: dao.resource_description?.S,
      resource_images: dao.resource_images?.S,
      resource_mood: dao.resource_mood?.S,
      resource_owner_email_password: dao.resource_owner_email_password?.S,
      resource_policies: dao.resource_policies?.S,
      resource_rules: dao.resource_rules?.S,
      booking_details: dao.booking_details?.S,
      tenant: dao.tenant?.S,
      booking_state: dao.booking_state?.S,
      bookingpk: dao.bookingpk?.S,
      bookingsk: dao.bookingsk?.S,
      password: dao.password?.S
    };
  }
}
