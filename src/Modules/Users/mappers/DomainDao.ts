import { GuestDao } from '@Users/dao/Guest';
import { GuestDetails } from '@Users/domain/entities/Details';
import { Guest } from '@Users/domain/entities/Guest';
import { Mapper } from 'utils/interfaces/mappers';

export class MapperUserDomainDao implements Mapper<Guest, GuestDao> {
  to (entity: Guest): GuestDao {
    return {
      guest_code: entity.id,
      guest_email: entity.email,
      guest_name: entity.name,
      guest_cellphone: entity.cellphone,
      guest_details: JSON.stringify(entity.details) ?? ''
    };
  }

  from (dao: GuestDao): Guest {
    const details = dao.guest_details as any;
    return new Guest(dao.guest_code, dao.guest_name, dao.guest_email, dao.guest_cellphone ?? '', MapperGuestDetails(details?.S ?? ''));
  }
}

const MapperGuestDetails = (guestDetails: string): GuestDetails[] | undefined => {
  const details: GuestDetails[] = [];
  if (guestDetails !== '') {
    const detailsArray = JSON.parse(guestDetails);
    detailsArray.forEach((detail: any) => {
      details.push({
        code: detail.code,
        value: detail.value,
        description: detail.description
      });
    });
  } else {
    return [];
  }
};
