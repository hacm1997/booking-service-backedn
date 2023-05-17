import { Booking } from '@Booking/domain/entities/Booking';
import { BookingRepository } from '@Booking/domain/repositories/Booking';
import {
  MapperBookingDomainDao,
  MapperBookingDynamoDBDao
} from '@Booking/mappers/booking/DomainDao';
import { DynamoDB } from '@Database/aws/dynamodb';
import { DynamoDBConnection } from '@Database/Clients/dynamodb';
import { GuestDao } from '@Users/dao/Guest';
import { Guest } from '@Users/domain/entities/Guest';
import { MapperUserDomainDao } from '@Users/mappers/DomainDao';
import { AvailabilitySlot } from '../domain/entities/AvailabilitySlot';
import {
  MapperAvailabilitySlotsDomainDao,
  MapperAvailabilitySlotsDynamoDBDao
} from '../mappers/availabilitySlots/DomainDao';
import { BookingDynamoDBDao } from './dao/Booking.dynamo';
import { AvailabilitySlotDynamoDBDao } from './dao/slots.dynamo';

export class DynamoDBBookingRepository implements BookingRepository {
  private _connection?: DynamoDBConnection;
  tenant: any;
  resource?: string | undefined;
  mapperBooking = new MapperBookingDomainDao();
  mapperDynamoBooking = new MapperBookingDynamoDBDao();
  mapperSlots = new MapperAvailabilitySlotsDomainDao();
  mapperDynamoSlots = new MapperAvailabilitySlotsDynamoDBDao();

  constructor (
    tenant: any,
    resource?: string | undefined,
    connection?: DynamoDBConnection
  ) {
    this._connection = connection;
    this.tenant = tenant;
    this.resource = resource;
  }

  async create (booking: Booking): Promise<Booking> {
    this._connection = new DynamoDBConnection(await DynamoDB.getInstance());
    const bookignDao = this.mapperBooking.to(booking);
    const bookingDetailsParam: AWS.DynamoDB.PutItemInput = {
      TableName: DynamoDB.TABLE_NAME,
      Item: {
        pk: { S: bookignDao.pk },
        sk: { S: bookignDao.sk },
        tenant: { S: this.tenant },
        booking_code: { S: bookignDao.booking_code },
        resource_code: { S: bookignDao.resource_code },
        end_date: { S: bookignDao.end_date },
        start_date: { S: bookignDao.start_date },
        booking_state: { S: bookignDao.booking_state },
        booking_details: { S: JSON.stringify(bookignDao.booking_details) },
        user_dni: { S: bookignDao.dni },
        user_email: { S: bookignDao.email },
        user_cellphone: { S: bookignDao.cellphone },
        user_username: { S: bookignDao.username },
        bookingpk: { S: `Resource#${this.tenant as string}` },
        bookingsk: {
          S: `${bookignDao.start_date}#${bookignDao.resource_code}#${bookignDao.end_date}`
        }
      },
      ConditionExpression: 'attribute_not_exists(sk)'
    };
    await this._connection.put(bookingDetailsParam);
    return booking;
  }

  async setState (booking: Booking, state: string): Promise<Booking> {
    this._connection = new DynamoDBConnection(await DynamoDB.getInstance());
    const bookignDao = this.mapperBooking.to(booking);
    const bookingDetailsParam: AWS.DynamoDB.UpdateItemInput = {
      TableName: DynamoDB.TABLE_NAME,
      Key: {
        pk: { S: bookignDao.pk },
        sk: { S: bookignDao.sk }
      },
      UpdateExpression: 'SET booking_state = :state',
      ExpressionAttributeValues: {
        ':state': { S: state }
      },
      ReturnValues: 'ALL_NEW'
    };
    const bookingUpdated = (await (
      await this._connection.update(bookingDetailsParam)
    ).Attributes) as unknown as BookingDynamoDBDao;
    const bookingDao = this.mapperDynamoBooking.from(bookingUpdated);
    return this.mapperBooking.from(bookingDao);
  }

  async get (
    startDate: string,
    resourceId: string,
    endDate?: string
  ): Promise<Booking> {
    this._connection = new DynamoDBConnection(await DynamoDB.getInstance());
    const keyConditionExpression =
      endDate !== undefined
        ? 'bookingpk = :bookingpk AND bookingsk = :bookingsk'
        : 'bookingpk = :bookingpk AND begins_with(bookingsk, :bookingsk)';
    const valueBookingSK =
      endDate !== undefined
        ? `${startDate}#${resourceId}#${endDate}`
        : `${startDate}#${resourceId}`;
    const bookingDetailsParam: AWS.DynamoDB.QueryInput = {
      TableName: DynamoDB.TABLE_NAME,
      IndexName: DynamoDB.BOOKING_INDEX_NAME,
      KeyConditionExpression: keyConditionExpression,
      ExpressionAttributeValues: {
        ':bookingpk': { S: `Resource#${this.tenant as string}` },
        ':bookingsk': { S: valueBookingSK }
      },
      ScanIndexForward: false
    };
    console.log(bookingDetailsParam);
    const query = await this._connection.query(bookingDetailsParam);
    console.log(query);
    const bookings = query.Items as unknown as BookingDynamoDBDao[];
    console.log(bookings);
    const bookingDao = this.mapperDynamoBooking.from(bookings[0]);
    console.log(bookingDao);
    return this.mapperBooking.from(bookingDao);
  }

  async getByResource (
    code: string,
    startDate: string,
    endDate?: string | Date
  ): Promise<Booking[]> {
    const availabilitySlots = await this.getAvailabilitySlotsByResource(
      code,
      startDate,
      endDate
    );
    const bookings = await this.getByRange(startDate, endDate as string);
    const bookingsFiltered = bookings.filter((booking) => {
      if (endDate !== undefined) {
        return booking.date_to >= startDate && booking.date_from <= endDate;
      }
      return booking.date_to >= startDate;
    });
    console.log(bookings);
    const bookingsFilteredByResource = bookingsFiltered.filter(
      (booking) => booking.resource.code === code
    );
    console.log(bookingsFilteredByResource);
    const bookingsFilteredByResourceAndAvailability =
      bookingsFilteredByResource.filter((booking) => {
        return availabilitySlots.find(
          (slot) => slot.start_date === booking.date_from
        );
      });
    return bookingsFilteredByResourceAndAvailability;
  }

  async getByRange (from: string, to?: string | undefined): Promise<Booking[]> {
    this._connection = new DynamoDBConnection(await DynamoDB.getInstance());
    const bookingDetailsParam: AWS.DynamoDB.QueryInput = {
      TableName: DynamoDB.TABLE_NAME,
      IndexName: DynamoDB.BOOKING_INDEX_NAME,
      KeyConditionExpression:
        'bookingpk = :bookingpk AND begins_with(bookingsk, :bookingsk)',
      ExpressionAttributeValues: {
        ':bookingpk': { S: `Resource#${this.tenant as string}` },
        ':bookingsk': { S: `${from.substring(0, 2)}` }
      },
      ScanIndexForward: false
    };
    const bookings = (await (
      await this._connection.query(bookingDetailsParam)
    ).Items) as unknown as BookingDynamoDBDao[];
    const bookingsFiltered = bookings.filter((booking) => {
      if (to !== undefined) {
        return booking.start_date <= to;
      }
      return true;
    });
    const bookingsDao = bookingsFiltered.map((booking) =>
      this.mapperDynamoBooking.from(booking)
    );
    return bookingsDao.map((booking) => this.mapperBooking.from(booking));
  }

  async getAll (): Promise<Booking[]> {
    this._connection = new DynamoDBConnection(await DynamoDB.getInstance());
    const bookingDetailsParam: AWS.DynamoDB.QueryInput = {
      TableName: DynamoDB.TABLE_NAME,
      IndexName: DynamoDB.BOOKING_INDEX_NAME,
      KeyConditionExpression: 'bookingpk = :bookingpk',
      ExpressionAttributeValues: {
        ':bookingpk': { S: `Resource#${this.tenant as string}` }
      },
      ScanIndexForward: false
    };
    const bookings = (await (
      await this._connection.query(bookingDetailsParam)
    ).Items) as unknown as BookingDynamoDBDao[];
    const bookingsDao = bookings.map((booking) =>
      this.mapperDynamoBooking.from(booking)
    );
    return bookingsDao.map((booking) => this.mapperBooking.from(booking));
  }

  async getByDNI (
    dni: string,
    startDate?: string,
    code?: string
  ): Promise<Booking[]> {
    console.log('getByDNI');
    this._connection = new DynamoDBConnection(await DynamoDB.getInstance());
    const eq = (startDate !== undefined && code !== undefined);
    const params: AWS.DynamoDB.QueryInput = {
      TableName: DynamoDB.TABLE_NAME,
      KeyConditionExpression: `pk = :pk AND ${eq ? 'sk = :sk' : 'begins_with(sk, :sk)'}`,
      ExpressionAttributeValues: {
        ':pk': { S: `User#${this.tenant as string}` },
        ':sk': {
          S: `booking#${dni}#${startDate ?? ''}${
            code !== undefined ? '#' + code : ''
          }`
        }
      },
      ScanIndexForward: false
    };
    console.log(params);
    const bookings = (await (
      await this._connection.query(params)
    ).Items) as unknown as BookingDynamoDBDao[];
    const bookingsDao = bookings.map((booking) =>
      this.mapperDynamoBooking.from(booking)
    );
    return bookingsDao.map((booking) => this.mapperBooking.from(booking));
  }

  async delete (dni: string, dateFrom: string): Promise<void> {
    this._connection = new DynamoDBConnection(await DynamoDB.getInstance());
    const params: AWS.DynamoDB.DeleteItemInput = {
      TableName: DynamoDB.TABLE_NAME,
      Key: {
        pk: { S: `Resource#${this.tenant as string}` },
        sk: { S: `Booking#${dni}#${dateFrom}` }
      }
    };
    await this._connection.delete(params);
  }

  // AVAILABILITY SLOTS
  async getAvailabilitySlotsByResource (
    code: string,
    startDate?: string,
    endDate?: string | Date
  ): Promise<AvailabilitySlot[]> {
    this._connection = new DynamoDBConnection(await DynamoDB.getInstance());
    const bookingDetailsParam: AWS.DynamoDB.QueryInput = {
      TableName: DynamoDB.TABLE_NAME,
      KeyConditionExpression: 'pk = :pk AND begins_with(sk, :sk)',
      ExpressionAttributeValues: {
        ':pk': { S: `Resource#${this.tenant as string}` },
        ':sk': {
          S: `AvailabilitySlot#${code}#${startDate?.substring(0, 2) ?? ''}`
        }
      },
      ScanIndexForward: false
    };
    const slotDao = await (
      await this._connection?.query(bookingDetailsParam)
    ).Items;
    if (slotDao === undefined) {
      return [];
    }
    const slots = slotDao as unknown as AvailabilitySlotDynamoDBDao[];
    const slotsDao = slots.map((slot) => this.mapperDynamoSlots.from(slot));
    return slotsDao.map((slot) => this.mapperSlots.from(slot));
  }

  async updateAvailabilitySlotByResource (
    code: string,
    slot: AvailabilitySlot
  ): Promise<AvailabilitySlot> {
    this._connection = new DynamoDBConnection(await DynamoDB.getInstance());
    const slotDao = this.mapperSlots.to(slot);
    const params: AWS.DynamoDB.UpdateItemInput = {
      TableName: DynamoDB.TABLE_NAME,
      Key: {
        pk: { S: `Resource#${this.tenant as string}` },
        sk: {
          S: `AvailabilitySlot#${code}#${slot.start_date}#${slot.end_date}`
        }
      },
      UpdateExpression:
        'SET #start_date = :start_date, #end_date = :end_date, #state = :state, #details = :details, #tenant = :tenant, #resource_code = :resource_code',
      ExpressionAttributeNames: {
        '#start_date': 'start_date',
        '#end_date': 'end_date',
        '#state': 'state',
        '#details': 'details',
        '#tenant': 'tenant',
        '#resource_code': 'resource_code'
      },
      ExpressionAttributeValues: {
        ':start_date': { S: slotDao.start_date },
        ':end_date': { S: slotDao.end_date },
        ':state': { S: slotDao.state ?? 'booked' },
        ':details': { S: slotDao.details ?? '{}' },
        ':tenant': { S: this.tenant as string },
        ':resource_code': { S: slotDao.resource_code }
      },
      ReturnValues: 'ALL_NEW'
    };
    const updatedSlot = (await (
      await this._connection.update(params)
    ).Attributes) as unknown as AvailabilitySlotDynamoDBDao;
    const updatedSlotDao = this.mapperDynamoSlots.from(updatedSlot);
    return this.mapperSlots.from(updatedSlotDao);
  }

  async createAvailabilitySlotByResource (
    code: string,
    slots: AvailabilitySlot
  ): Promise<void> {
    this._connection = new DynamoDBConnection(await DynamoDB.getInstance());
    const slotDao = this.mapperSlots.to(slots);
    const params: AWS.DynamoDB.PutItemInput = {
      TableName: DynamoDB.TABLE_NAME,
      Item: {
        pk: { S: `Resource#${this.tenant as string}` },
        sk: {
          S: `AvailabilitySlot#${code}#${slotDao.start_date}#${slotDao.end_date}`
        },
        start_date: { S: slotDao.start_date },
        end_date: { S: slotDao.end_date },
        state: { S: slotDao.state },
        details: { S: slotDao.details },
        tenant: { S: slotDao.tenant },
        resource_code: { S: slotDao.resource_code }
      }
    };
    await this._connection.put(params).then((res: any) => {});
  }

  async deleteAvailabilitySlotByResource (
    resourceId: string,
    startDate: string,
    endDate: string
  ): Promise<AvailabilitySlot> {
    this._connection = new DynamoDBConnection(await DynamoDB.getInstance());
    const params: AWS.DynamoDB.DeleteItemInput = {
      TableName: DynamoDB.TABLE_NAME,
      Key: {
        pk: { S: `Resource#${this.tenant as string}` },
        sk: { S: `AvailabilitySlot#${resourceId}#${startDate}#${endDate}` }
      }
    };
    const deletedSlot = (await (
      await this._connection.delete(params)
    ).Attributes) as unknown as AvailabilitySlotDynamoDBDao;
    const deletedSlotDao = this.mapperDynamoSlots.from(deletedSlot);
    return this.mapperSlots.from(deletedSlotDao);
  }

  // GUESTS

  // ToDo: Reubicar en otro repositorio
  async getUser (dni: string): Promise<Guest> {
    this._connection = new DynamoDBConnection(await DynamoDB.getInstance());
    const userParam: AWS.DynamoDB.GetItemInput = {
      TableName: DynamoDB.TABLE_NAME,
      Key: {
        pk: { S: `User#${this.tenant as string}` },
        sk: { S: `profile#${dni}` }
      }
    };
    const user = (await (
      await this._connection?.query(userParam)
    ).Items) as unknown as GuestDao[];
    return new MapperUserDomainDao().from(user[0]);
  }

  // ToDo: Reubicar en otro repositorio
  async createUser (user: Guest): Promise<Guest> {
    this._connection = new DynamoDBConnection(await DynamoDB.getInstance());
    const mapperUser = new MapperUserDomainDao();
    const userDao = mapperUser.to(user);
    const userParam: AWS.DynamoDB.PutItemInput = {
      TableName: DynamoDB.TABLE_NAME,
      Item: {
        pk: { S: `User${this.tenant as string}` },
        sk: { S: `profile#${userDao.guest_code}` },
        name: { S: userDao.guest_name },
        details: { S: userDao.guest_details },
        dni: { S: userDao.guest_code },
        cellphone: { S: userDao.guest_cellphone },
        email: { S: userDao.guest_email }
      },
      ConditionExpression:
        'attribute_not_exists(sk) AND attribute_not_exists(pk)'
    };
    const userCreated = (await (
      await this._connection.put(userParam)
    ).Attributes) as unknown as GuestDao;
    return mapperUser.from(userCreated);
  }
}
