/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { QuerySQLFilterBuilder } from '@Database/aws/opensearch/queryFilters';
import { OpenSearch } from '@Database/Clients/opensearch';
import { json } from 'utils/json.interface';
import { Resource } from '../domain/entities/Resource';
import { ResourceRepository } from '../domain/repositories/Resource';
import { MapperResourceDomainDao } from '../mappers/DomainDao';

export class ResourceOpenSearchRepository implements Partial<ResourceRepository> {
  tenant: string;
  private readonly _connection: OpenSearch;
  private readonly mapperResource = new MapperResourceDomainDao();

  constructor (tenant: string) {
    this.tenant = tenant;
    this._connection = new OpenSearch();
  }

  async getByCharacteristics (characteristics: json): Promise<Resource[]> {
    const builder = new QuerySQLFilterBuilder();

    // characteristics.tenant = this.tenant;
    const keys = Object.keys(characteristics);

    keys.forEach((key) => {
      let operator = '';
      let value = characteristics[key];
      let filter = '';
      const join = 'AND';
      if (key === 'startprice' || key === 'startarea' || key === 'bedrooms' || key === 'bathrooms' || key === 'beds' || key === 'capacity_kids' || key === 'capacity_adults') {
        if (key === 'startprice' || key === 'startarea') {
          key = key.substring(5, key.length);
        }
        operator = '>=';
      } else if (key === 'endarea' || key === 'endprice') {
        key = key.substring(3, key.length);
        operator = '<=';
      } else {
        operator = '=';
        if (typeof value === 'string') {
          // multi match query
          filter = `MATCHQUERY(${key},"${value}")`;
          operator = '';
          value = '';
        }
      }
      if (filter === '') {
        filter = key;
      }
      builder.addFilter(filter, value, operator, join);
    });

    const sql = builder.build();
    // builder.getParams();
    const bookings = await this._connection.search(sql).then((response) => {
      console.log('response', response);
      return response;
    }).catch((error) => {
      console.log('error', error);
      return [];
    });
    bookings.forEach((booking: any) => {
      booking.characteristics = JSON.parse(booking.characteristics);
    });
    return bookings;
  }

  async delete (code: string): Promise<void> {
    await this._connection.deleteResource(code);
  }

  async create (resource: Resource): Promise<Resource> {
    // index Booking in OpenSearch
    const resourceDao = this.mapperResource.to(resource);

    const resourcetoIndex = {
      tenant: resource.tenant,
      resource_id: resource.code,
      type: resource.resourceCharacteristics.find((characteristic) => characteristic.code === 'type')?.value,
      status: resource.status,
      mood: resource.resourceCharacteristics.find((characteristic) => characteristic.code === 'mood')?.value,
      bedrooms: resource.resourceCharacteristics.find((characteristic) => characteristic.code === 'bedrooms')?.value,
      bathrooms: resource.resourceCharacteristics.find((characteristic) => characteristic.code === 'bathrooms')?.value,
      beds: resource.resourceCharacteristics.find((characteristic) => characteristic.code === 'beds')?.value,
      price: resource.resourceCharacteristics.find((characteristic) => characteristic.code === 'price')?.value,
      owner: resource.owner,
      name: resource.name,
      description: resourceDao.resource_description,
      currency: resource.resourceCharacteristics.find((characteristic) => characteristic.code === 'currency')?.value,
      rating: resource.resourceCharacteristics.find((characteristic) => characteristic.code === 'rating')?.value,
      rating_count: resource.resourceCharacteristics.find((characteristic) => characteristic.code === 'rating')?.value,
      area: resource.resourceCharacteristics.find((characteristic) => characteristic.code === 'area')?.value,
      capacity_kids: resource.resourceCharacteristics.find((characteristic) => characteristic.code === 'capacity_kids')?.value,
      capacity_adults: resource.resourceCharacteristics.find((characteristic) => characteristic.code === 'capacity_adults')?.value,
      availabiliySlots: [],
      characteristics: JSON.stringify(resource.resourceCharacteristics)
    };
    await this._connection.indexResource(resourcetoIndex);
    return resource;
  }

  async update (resource: Resource): Promise<Resource> {
    const resourceDao = this.mapperResource.to(resource);

    const resourcetoIndex = {
      resource_id: resource.code,
      type: resource.resourceCharacteristics.find((characteristic) => characteristic.code === 'type')?.value,
      status: resource.status,
      mood: resource.resourceCharacteristics.find((characteristic) => characteristic.code === 'mood')?.value,
      bedrooms: resource.resourceCharacteristics.find((characteristic) => characteristic.code === 'bedrooms')?.value,
      bathrooms: resource.resourceCharacteristics.find((characteristic) => characteristic.code === 'bathrooms')?.value,
      beds: resource.resourceCharacteristics.find((characteristic) => characteristic.code === 'beds')?.value,
      price: resource.resourceCharacteristics.find((characteristic) => characteristic.code === 'price')?.value,
      owner: resource.owner,
      name: resource.name,
      description: resourceDao.resource_description,
      currency: resource.resourceCharacteristics.find((characteristic) => characteristic.code === 'currency')?.value,
      rating: resource.resourceCharacteristics.find((characteristic) => characteristic.code === 'rating')?.value,
      rating_count: resource.resourceCharacteristics.find((characteristic) => characteristic.code === 'rating')?.value,
      area: resource.resourceCharacteristics.find((characteristic) => characteristic.code === 'area')?.value,
      capacity_kids: resource.resourceCharacteristics.find((characteristic) => characteristic.code === 'capacity_kids')?.value,
      capacity_adults: resource.resourceCharacteristics.find((characteristic) => characteristic.code === 'capacity_adults')?.value,
      availabiliySlots: [],
      characteristics: JSON.stringify(resource.resourceCharacteristics)
    };
    // index resource in OpenSearch
    const index = await this._connection.searchResource(resourcetoIndex.resource_id);
    if (index._id !== undefined) {
      // await this._connection.deleteResource(Resource.resource_id);
      await this._connection.updateResource(resourcetoIndex.resource_id, resourcetoIndex);
    } else {
      await this._connection.indexResource(resourcetoIndex);
    }
    return resource;
  }

  async updateAvailabilitySlots (id: string, from: string, to: string): Promise<unknown> {
    console.log('updateAvailabilitySlots', id, from, to);
    const booking = await this._connection.searchResource(id);
    if (booking?._id !== undefined) {
      const slot = {
        from,
        to,
        status: 'booked'
      };
      console.log('slot', slot);
      const update = await this._connection.updateAvailabilitySlots(booking._id, slot);
      return update;
    }
    return {};
  }

  async deleteAvailabilitySlots (id: string, from: string, to: string): Promise<unknown> {
    const booking = await this._connection.searchResource(id);
    if (booking?._id !== undefined) {
      const slot = {
        from,
        to,
        status: 'available'
      };
      const update = await this._connection.updateAvailabilitySlots(booking._id, slot);
      return update;
    }
    return {};
  }
}
