import { Mapper } from 'utils/interfaces/mappers';
import { Guest } from '../domain/entities/Guest';
import { UserDto } from '../dto/User';

export class MapperUserDOmainDto implements Mapper<Guest, UserDto> {
  to (entity: Guest): UserDto {
    return {
      dni: entity.id,
      name: entity.name,
      email: entity.email,
      cellphone: entity.cellphone,
      details: entity.details
    };
  }

  from (dto: UserDto): Guest {
    return new Guest(dto.dni, dto.name, dto.email, dto.cellphone, dto.details);
  }
}
