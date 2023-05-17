import { Mapper } from 'utils/interfaces/mappers';
import { PaymentDto } from '../app/dto/payment';
import { Facture } from '../domain/entity/Facture';

export class MapperPaymentDtoToDomain implements Mapper<Facture, PaymentDto> {
  to (entity: Facture): PaymentDto {
    return {
      bookingCode: entity.bookingCode,
      userDni: entity.userDni,
      resourceCode: entity.resourceCode,
      tenant: entity.tenant,
      method: entity.method,
      startDate: entity.startDate,
      endDate: entity.endDate,
      facture: {
        booking_code: entity.bookingCode,
        details: entity.details,
        reference: entity.id,
        total: entity.total,
        status: entity.status
      }
    };
  }

  toDomainList (entityList: Facture[]): PaymentDto[] {
    return entityList.map(entity => this.to(entity));
  }

  from (dto: PaymentDto): Facture {
    return {
      id: dto.facture.reference,
      tenant: dto.tenant,
      bookingCode: dto.bookingCode,
      resourceCode: dto.resourceCode,
      userDni: dto.userDni,
      details: dto.facture.details,
      total: dto.facture.total,
      status: dto.facture.status,
      method: dto.method,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      startDate: dto.startDate,
      endDate: dto.endDate
    };
  }

  fromDomainList (dtoList: PaymentDto[]): Facture[] {
    return dtoList.map(dto => this.from(dto));
  }
}
