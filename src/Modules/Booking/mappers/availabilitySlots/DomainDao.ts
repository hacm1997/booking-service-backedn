import { AvailabilitySlot } from 'Modules/Booking/domain/entities/AvailabilitySlot';
import { AvailabilitySlotDao } from 'Modules/Booking/infrastucture/dao/AvailabilitySlot';
import { AvailabilitySlotDynamoDBDao } from 'Modules/Booking/infrastucture/dao/slots.dynamo';
import { Mapper } from 'utils/interfaces/mappers';

export class MapperAvailabilitySlotsDomainDao implements Mapper<AvailabilitySlot, AvailabilitySlotDao> {
  to (entity: AvailabilitySlot, tenant?: string): AvailabilitySlotDao {
    return {
      pk: `Booking#${tenant ?? ''}`,
      sk: `slots#${entity.resource_id}#${entity.start_date}#${entity.end_date}`,
      entity: 'slots',
      resource_code: entity.resource_id,
      start_date: entity.start_date,
      details: entity.details,
      end_date: entity.end_date,
      tenant: tenant ?? '',
      state: entity.state
    };
  }

  from (dao: AvailabilitySlotDao): AvailabilitySlot {
    return {
      resource_id: dao.resource_code,
      start_date: new Date(dao.start_date).toISOString(),
      details: dao.details,
      end_date: new Date(dao.end_date).toLocaleString(),
      id: dao.sk,
      state: dao.state
    };
  }
}

export class MapperAvailabilitySlotsDynamoDBDao implements Mapper<AvailabilitySlotDao, AvailabilitySlotDynamoDBDao> {
  to (entity: AvailabilitySlotDao, tenant?: string): AvailabilitySlotDynamoDBDao {
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
      resource_code: {
        S: entity.resource_code
      },
      start_date: {
        S: entity.start_date
      },
      details: {
        S: entity.details
      },
      end_date: {
        S: entity.end_date
      },
      tenant: {
        S: tenant ?? ''
      },
      state: {
        S: entity.state
      }
    };
  }

  from (dao: AvailabilitySlotDynamoDBDao): AvailabilitySlotDao {
    return {
      pk: dao.pk.S,
      sk: dao.sk.S,
      entity: dao.entity?.S,
      resource_code: dao.resource_code?.S,
      start_date: dao.start_date?.S,
      details: dao.details?.S,
      end_date: dao.end_date?.S,
      tenant: dao.tenant?.S,
      state: dao.state?.S
    };
  }
}
