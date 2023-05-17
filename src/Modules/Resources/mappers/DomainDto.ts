import { ResourceDto } from '@Resources/app/dto/resource';
import { ResourceCharacteristic } from '@Resources/domain/entities/Characteristic';
import { Resource } from '@Resources/domain/entities/Resource';
import { Mapper } from 'utils/interfaces/mappers';

export class MapperResourceDomainDto implements Mapper<Resource, ResourceDto> {
  to (entity: Resource): ResourceDto {
    return {
      code: entity.code,
      name: entity.name,
      characteristics: entity.resourceCharacteristics,
      description: entity.resourceCharacteristics.find((characteristic) => characteristic.code === 'description')?.value as string,
      owner: entity.owner,
      rating: entity.resourceCharacteristics.find((characteristic) => characteristic.code === 'rating')?.value as number,
      rating_count: entity.ratings?.length,
      currency: entity.resourceCharacteristics.find((characteristic) => characteristic.code === 'currency')?.value as string,
      price: entity.resourceCharacteristics.find((characteristic) => characteristic.code === 'price')?.value as number,
      state: entity.status
    };
  }

  from (dto: ResourceDto, tenant?: string): Resource {
    const objectKeys = Object.keys(dto.characteristics);
    const resourceCharacteristics: ResourceCharacteristic[] = [];
    objectKeys.forEach((key) => {
      resourceCharacteristics.push({
        code: key,
        value: dto.characteristics[key]
      });
    });
    const characteristics = [
      {
        code: 'description',
        value: dto.description
      },
      {
        code: 'rating',
        value: dto.rating
      },
      {
        code: 'rating_count',
        value: dto.rating_count
      },
      {
        code: 'currency',
        value: dto.currency
      },
      ...resourceCharacteristics
    ];
    return new Resource(
      {
        code: dto.code as string,
        name: dto.name,
        resourceCharacteristics: characteristics,
        owner: dto.owner,
        status: dto.state as string,
        entity: 'Resource',
        durationAvailable: dto.durationAvailable ?? 0,
        tenant
      }
    );
  }
}
