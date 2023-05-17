import client from '@Database/aws/opensearch';
import { ApiResponse, Client } from '@opensearch-project/opensearch/.';
import env from 'env/index';

export class OpenSearch {
  private readonly client: Client;
  private readonly index: string = env.opensearch.index ?? 'booking-failed';
  private readonly settings: any = {
    settings: {
      number_of_shards: 1,
      number_of_replicas: 1,
      index: {
        analysis: {
          analyzer: {
            default: {
              type: 'custom',
              tokenizer: 'standard',
              filter: ['lowercase', 'asciifolding', 'stop', 'porter_stem']
            }
          }
        },
        refresh_interval: '1s',
        max_result_window: 100000,
        max_inner_result_window: 100000,
        max_rescore_window: 100000
      }
    },
    mappings: {
      properties: {
        resource_id: { type: 'text' },
        tenant: { type: 'text' },
        type: { type: 'text' },
        status: { type: 'text' },
        mood: { type: 'text' },
        bedrooms: { type: 'integer' },
        bathrooms: { type: 'integer' },
        beds: { type: 'integer' },
        price: { type: 'long' },
        area: { type: 'integer' },
        characteristics: { type: 'text' },
        capacity_kids: { type: 'integer' },
        capacity_adults: { type: 'integer' },
        availabiliySlots: {
          type: 'nested',
          properties: {
            from: { type: 'date' },
            to: { type: 'date' },
            status: { type: 'text' }
          }
        }
      }
    }
  };

  constructor () {
    this.client = client;
  }

  async createIndex (): Promise<void> {
    await this.client.indices.create({
      index: this.index,
      body: this.settings
    }).then((response: ApiResponse) => {
      console.log('Index created', response.body);
    }).catch((error: any) => {
      console.log('Error creating index', error);
    });
  }

  async deleteIndex (): Promise<void> {
    await this.client.indices.delete({
      index: this.index
    });
  }

  async getIndex (): Promise<any> {
    return await this.client.indices.get({
      index: this.index
    });
  }

  async indexExists (): Promise<boolean | unknown> {
    const response = await this.client.indices.exists({
      index: this.index
    });
    if (response.body) {
      const index = await this.getIndex();
      console.log('Index exists', index.body[this.index].mappings);
      const settings = this.settings.settings;
      const mappings = this.settings.mappings;
      console.log('Settings', mappings);
      const keysOfSettings = Object.keys(settings);
      const keysOfMappings = Object.keys(mappings);
      const settigsEquals = keysOfSettings.every((key) => {
        return settings[key] === index.body[this.index].settings.index[key];
      });
      const mappingsEquals = keysOfMappings.every((key) => {
        return mappings[key] === index.body[this.index].mappings.properties[key];
      });
      if (!settigsEquals || !mappingsEquals) {
        console.log('Index settings are not equals');
      }
    }
    return response.body;
  }

  async indexResource (resource: any): Promise<unknown> {
    return await this.client.index({
      index: this.index,
      body: resource,
      id: resource.id,
      refresh: true
    });
  }

  async search (query: string): Promise<any> {
    // search for documents with sql like query language in opensearch
    const response: ApiResponse<Record<string, any>, unknown> = await this.client.transport.request({
      method: 'POST',
      path: '_plugins/_sql',
      body: {
        query
      }
    }).catch((error: any) => {
      console.log('Error searching', error);
      console.log('Error searching', error.meta.body.error);
      return null;
    }) as ApiResponse<Record<string, any>, unknown>;
    console.log('Response', response);
    if (response == null) {
      return [];
    }
    const schema = response.body.schema;
    const datarows = response.body.datarows;
    const results = datarows.map((row: any) => {
      const result: any = {};
      schema.forEach((column: any, index: number) => {
        result[column.name] = row[index];
      });
      return result;
    });
    return results;
  }

  // return _id of the document
  async searchResource (resourceId: string): Promise<any> {
    console.log('Searching booking', resourceId);
    const response = await this.client.search({
      index: this.index,
      body: {
        query: {
          match: {
            resource_id: resourceId
          }
        }
      }
    });
    console.log('Response', response.body.hits.hits);
    return response.body.hits.hits[0];
  }

  async deleteResource (id: string): Promise<void> {
    const resource = await this.getResource(id);
    await this.client.update({
      index: this.index,
      id: resource._id,
      body: {
        doc: {
          status: 'deleted'
        }
      }
    });
  }

  async updateResource (id: string, resource: any): Promise<void> {
    const resourceToUpdate = await this.getResource(id);
    // await this.deleteresource(id);
    console.log('resource to update', resourceToUpdate);
    const resourceToUpdateId = resourceToUpdate._id;
    console.log('resource to update id', resourceToUpdateId);
    await this.client.update({
      index: this.index,
      id: resourceToUpdateId,
      body: {
        doc: {
          ...resource
        }
      }
    });
  }

  async getResource (id: string): Promise<any> {
    return await this.client.search({
      index: this.index,
      body: {
        query: {
          match: {
            resource_id: id
          }
        }
      }
    }).then((response: ApiResponse) => {
      return response.body.hits.hits[0];
    }).catch((error: any) => {
      console.log('Error getting booking', error);
      return null;
    });
  }

  async updateAvailabilitySlots (id: string, slots: any): Promise<void> {
    await this.client.update({
      index: this.index,
      id,
      body: {
        doc: {
          availabiliySlots: slots
        }
      }
    });
  }
}
