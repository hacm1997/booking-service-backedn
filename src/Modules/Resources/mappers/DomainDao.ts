import { Resource } from '@Resources/domain/entities/Resource';
import { ResourceDynamoDBDao } from '@Resources/infrastructure/dao/Resource';
import { Mapper } from 'utils/interfaces/mappers';

export class MapperResourceDomainDao implements Mapper<Resource, ResourceDynamoDBDao> {
  to (entity: Resource): ResourceDynamoDBDao {
    const characteristics = entity.resourceCharacteristics.map((characteristic) => {
      return {
        name: characteristic.code,
        value: characteristic.value
      };
    });
    const map = {
      entity: entity.entity as string,
      pk: `Resource#${entity.tenant?.toUpperCase() as string}`,
      sk: `Details#${entity.code}`,
      resource_code: entity.code,
      resource_name: entity.name,
      resource_duration_available: entity.durationAvailable,
      resource_location: entity.resourceCharacteristics.find((characteristic) => characteristic.code === 'location')?.value as string,
      resource_owner: entity.owner,
      resource_price: parseInt(entity.resourceCharacteristics.find((characteristic) => characteristic.code === 'price')?.value as string),
      resource_type: entity.resourceCharacteristics.find((characteristic) => characteristic.code === 'type')?.value as string,
      resource_status: entity.status,
      tenant: entity.tenant as string,
      resource_amenities: characteristics.filter((characteristic) => characteristic.name === 'amenities').length > 0 ? characteristics.filter((characteristic) => characteristic.name === 'amenities') : null,
      resource_bathrooms: parseInt(entity.resourceCharacteristics.find((characteristic) => characteristic.code === 'bathrooms')?.value as string),
      // resource_area: parseInt(entity.resourceCharacteristics.find((characteristic) => characteristic.code === 'area')?.value as string),
      resource_bedrooms: parseInt(entity.resourceCharacteristics.find((characteristic) => characteristic.code === 'bedrooms')?.value as string),
      resource_beds: parseInt(entity.resourceCharacteristics.find((characteristic) => characteristic.code === 'beds')?.value as string),
      resource_capacity_adults: parseInt(entity.resourceCharacteristics.find((characteristic) => characteristic.code === 'capacity_adults')?.value as string),
      resource_capacity_kids: parseInt(entity.resourceCharacteristics.find((characteristic) => characteristic.code === 'capacity_kids')?.value as string),
      resource_description: entity.resourceCharacteristics.find((characteristic) => characteristic.code === 'description')?.value === undefined ? null : entity.resourceCharacteristics.find((characteristic) => characteristic.code === 'description')?.value,
      resource_images: characteristics.filter((characteristic) => characteristic.name === 'images'),
      resource_mood: entity.resourceCharacteristics.find((characteristic) => characteristic.code === 'mood')?.value === undefined ? null : entity.resourceCharacteristics.find((characteristic) => characteristic.code === 'mood')?.value,
      resource_owner_email: entity.resourceCharacteristics.find((characteristic) => characteristic.code === 'owner_email')?.value === undefined ? null : entity.resourceCharacteristics.find((characteristic) => characteristic.code === 'owner_email')?.value,
      resource_owner_email_password: entity.resourceCharacteristics.find((characteristic) => characteristic.code === 'owner_email_password')?.value === undefined ? null : entity.resourceCharacteristics.find((characteristic) => characteristic.code === 'owner_email_password')?.value,
      resource_policies: characteristics.filter((characteristic) => characteristic.name === 'policies').length === 0 ? null : characteristics.filter((characteristic) => characteristic.name === 'policies'),
      resource_rules: characteristics.filter((characteristic) => characteristic.name === 'rules').length === 0 ? null : characteristics.filter((characteristic) => characteristic.name === 'rules'),
      resource_characteristics: characteristics
    };
    return map;
  };

  from (dao: ResourceDynamoDBDao): Resource {
    const characteristics = [
      {
        code: 'location',
        value: dao.resource_location
      },
      {
        code: 'price',
        value: dao.resource_price.toString()
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
        code: 'bathrooms',
        value: dao.resource_bathrooms?.toString()
      },
      {
        code: 'area',
        value: dao.resource_area?.toString() ?? '0'
      },
      {
        code: 'bedrooms',
        value: dao.resource_bedrooms?.toString()
      },
      {
        code: 'beds',
        value: dao.resource_beds?.toString()
      },
      {
        code: 'capacity_adults',
        value: dao.resource_capacity_adults?.toString()
      },
      {
        code: 'capacity_kids',
        value: dao.resource_capacity_kids?.toString()
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
        code: 'owner_email',
        value: dao.resource_owner_email
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
      },
      {
        code: 'characteristics',
        value: dao.resource_characteristics
      }
    ];
    return Resource.create({
      code: dao.resource_code,
      entity: dao.entity,
      name: dao.resource_name,
      owner: dao.resource_owner,
      durationAvailable: dao.resource_duration_available,
      resourceCharacteristics: characteristics,
      status: dao.resource_status,
      ratings: [],
      tenant: dao.tenant
    });
  }
}
