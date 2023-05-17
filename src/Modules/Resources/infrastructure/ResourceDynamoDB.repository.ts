import { DynamoDB } from '@Database/aws/dynamodb';
import { DynamoDBConnection } from '@Database/Clients/dynamodb';
import { Resource } from '@Resources/domain/entities/Resource';
import { ResourceRepository } from '@Resources/domain/repositories/Resource';
import { MapperResourceDomainDao } from '@Resources/mappers/DomainDao';
import { json } from 'utils/json.interface';
import { ResourceDynamoDBDao } from './dao/Resource';

export class ResourceDynamoDBRepository implements ResourceRepository {
  tenant: string;
  private _connection?: DynamoDBConnection;
  private readonly mapperResource = new MapperResourceDomainDao();

  constructor (tenant: string, connection?: DynamoDBConnection) {
    this._connection = connection;
    this.tenant = tenant;
  }

  async create (resource: Resource): Promise<Resource> {
    this._connection = new DynamoDBConnection(await DynamoDB.getInstance());
    const resourceDao = this.mapperResource.to(resource);

    const resourceDetailsParam: AWS.DynamoDB.PutItemInput = {
      TableName: DynamoDB.TABLE_NAME,
      Item: {
        pk: { S: resourceDao.pk },
        sk: { S: resourceDao.sk },
        tenant: { S: this.tenant.toUpperCase() },
        resource_name: { S: resourceDao.resource_name },
        resource_code: { S: resourceDao.resource_code },
        resource_duration_available: { N: resourceDao.resource_duration_available?.toString() ?? '0' },
        resource_owner: { S: resourceDao.resource_owner },
        resource_beds: { N: resourceDao.resource_beds?.toString() ?? '0' },
        resource_bathrooms: { N: resourceDao.resource_bathrooms?.toString() ?? '0' },
        resource_capacity_kids: { N: resourceDao.resource_capacity_kids?.toString() ?? '0' },
        resource_capacity_adults: { N: resourceDao.resource_capacity_adults?.toString() ?? '0' },
        resource_bedrooms: { N: resourceDao.resource_bedrooms?.toString() ?? '0' },
        resource_description: { S: resourceDao.resource_description ?? '' },
        resource_location: { S: resourceDao.resource_location },
        resource_price: { N: resourceDao.resource_price.toString() },
        resource_mood: { S: resourceDao.resource_mood ?? '' },
        resource_area: { S: resourceDao.resource_area?.toString() ?? '0' },
        resource_status: { S: resourceDao.resource_status },
        resource_images: { S: JSON.stringify(resourceDao.resource_images) },
        resource_amenities: { S: JSON.stringify(resourceDao.resource_amenities) },
        resource_rules: { S: JSON.stringify(resourceDao.resource_rules) },
        resource_policies: { S: JSON.stringify(resourceDao.resource_policies) },
        resource_type: { S: resourceDao.resource_type },
        resource_owner_email: { S: resourceDao.resource_owner_email ?? '' },
        resource_owner_email_password: { S: resourceDao.resource_owner_email_password ?? '' },
        entity: { S: resourceDao.entity },
        resource_createdAt: { S: new Date().toISOString() },
        resource_updatedAt: { S: new Date().toISOString() },
        resource_characteristhics: { S: JSON.stringify(resourceDao.resource_characteristics) }
      }
    };

    await this._connection?.put(resourceDetailsParam).then((data: json) => {
    }).catch((error: { message: any }) => {
      throw new Error(error.message);
    });

    return resource;
  }

  async delete (code: string): Promise<void> {
    // update resource status to deleted
    this._connection = new DynamoDBConnection(await DynamoDB.getInstance());
    const params: AWS.DynamoDB.UpdateItemInput = {
      TableName: DynamoDB.TABLE_NAME,
      Key: {
        pk: { S: `Resource#${this.tenant.toUpperCase()}` },
        sk: { S: `Details#${code}` }
      },
      UpdateExpression: 'SET resource_status = :resource_status, resource_updatedAt = :resource_updatedAt',
      ExpressionAttributeValues: {
        ':resource_status': { S: 'deleted' },
        ':resource_updatedAt': { S: new Date().toISOString() }
      },
      ReturnValues: 'UPDATED_NEW'
    };
    await this._connection?.update(params);
  }

  // TODO: Implement this method
  async insertRating (resource: Resource, rating: number, dni: string): Promise<Resource> {
    this._connection = new DynamoDBConnection(await DynamoDB.getInstance());
    throw new Error('Method not implemented.');
  }

  async get (code: string): Promise<Resource> {
    this._connection = new DynamoDBConnection(await DynamoDB.getInstance());
    const params: AWS.DynamoDB.QueryInput = {
      TableName: DynamoDB.TABLE_NAME,
      KeyConditionExpression: 'pk = :pk AND sk = :sk',
      ExpressionAttributeValues: {
        ':pk': { S: `Resource#${this.tenant.toUpperCase()}` },
        ':sk': { S: `Details#${code}` }
      },
      ConsistentRead: true
    };
    const resourceDao = await (await this._connection?.query(params)).Items?.[0];
    const resource: ResourceDynamoDBDao = {
      pk: resourceDao?.pk?.S ?? '',
      sk: resourceDao?.sk?.S ?? '',
      tenant: resourceDao?.tenant?.S ?? '',
      resource_name: resourceDao?.resource_name?.S ?? '',
      resource_code: resourceDao?.resource_code?.S ?? '',
      resource_duration_available: ((resourceDao?.resource_duration_available?.N) != null) ? parseInt(resourceDao.resource_duration_available?.N) : 0,
      resource_owner: resourceDao?.resource_owner?.S ?? '',
      resource_beds: ((resourceDao?.resource_beds?.N) != null) ? parseInt(resourceDao.resource_beds?.N) : 0,
      resource_bathrooms: ((resourceDao?.resource_bathrooms?.N) != null) ? parseInt(resourceDao.resource_bathrooms?.N) : 0,
      resource_capacity_kids: ((resourceDao?.resource_capacity_kids?.N) != null) ? parseInt(resourceDao.resource_capacity_kids?.N) : 0,
      resource_capacity_adults: ((resourceDao?.resource_capacity_adults?.N) != null) ? parseInt(resourceDao.resource_capacity_adults?.N) : 0,
      resource_bedrooms: ((resourceDao?.resource_bedrooms?.N) != null) ? parseInt(resourceDao.resource_bedrooms?.N) : 0,
      resource_description: resourceDao?.resource_description?.S ?? '',
      resource_location: resourceDao?.resource_location?.S ?? '',
      resource_price: ((resourceDao?.resource_price?.N) != null) ? parseInt(resourceDao.resource_price?.N) : 0,
      resource_mood: resourceDao?.resource_mood?.S ?? '',
      resource_area: ((resourceDao?.resource_area?.N) != null) ? parseInt(resourceDao.resource_area?.N) : 0,
      resource_status: resourceDao?.resource_status?.S ?? '',
      resource_images: JSON.parse(resourceDao?.resource_images?.S ?? '[]'),
      resource_amenities: JSON.parse(resourceDao?.resource_amenities?.S ?? '[]'),
      resource_rules: JSON.parse(resourceDao?.resource_rules?.S ?? '[]'),
      resource_policies: JSON.parse(resourceDao?.resource_policies?.S ?? '[]'),
      resource_type: resourceDao?.resource_type?.S ?? '',
      resource_owner_email: resourceDao?.resource_owner_email?.S ?? '',
      resource_owner_email_password: resourceDao?.resource_owner_email_password?.S ?? '',
      entity: resourceDao?.entity?.S ?? '',
      resource_characteristics: JSON.parse(resourceDao?.resource_characteristics?.S ?? '{}')
    };
    return this.mapperResource.from(resource);
  }

  async getByCharacteristics (characteristics: json): Promise<Resource[]> {
    this._connection = new DynamoDBConnection(await DynamoDB.getInstance());
    const keys = Object.keys(characteristics);
    let characteristicsToFilter = '';
    keys.forEach((key, index) => {
      characteristicsToFilter += index === 0 ? 'AND ' : '';
      if (key === 'price' || key === 'area' || key === 'bedrooms' || key === 'bathrooms' || key === 'beds' || key === 'capacity_kids' || key === 'capacity_adults') {
        characteristicsToFilter += `resource_${key} <= :${key}`;
      } else {
        characteristicsToFilter += `resource_${key} = :${key}`;
      }
      if (index !== keys.length - 1) {
        characteristicsToFilter += ' AND ';
      }
    });
    let expressionAtrributeValues = {};
    keys.forEach((key) => {
      expressionAtrributeValues = {
        ...expressionAtrributeValues,
        [`:${key}`]: !isNaN(characteristics[key]) ? { N: characteristics[key] } : { S: characteristics[key] }
      };
    });
    const params = {
      TableName: DynamoDB.TABLE_NAME,
      FilterExpression: `pk = :pk AND begins_with(sk, :sk) ${characteristicsToFilter}`,
      ExpressionAttributeValues: {
        ':pk': { S: `Resource#${this.tenant.toUpperCase()}` },
        ':sk': { S: 'Details#' },
        ...expressionAtrributeValues
      },
      ConsistentRead: true
    };
    const resourcesDao = await (await this._connection?.scan(params)).Items as any[];
    const resources: ResourceDynamoDBDao[] = resourcesDao.map((resourceDao) => {
      return {
        pk: resourceDao?.pk.S ?? '',
        sk: resourceDao?.sk.S ?? '',
        tenant: resourceDao?.tenant.S ?? '',
        resource_name: resourceDao?.resource_name.S ?? '',
        resource_code: resourceDao?.resource_code.S ?? '',
        resource_duration_available: ((resourceDao?.resource_duration_available.N) != null) ? parseInt(resourceDao.resource_duration_available.N) : 0,
        resource_owner: resourceDao?.resource_owner.S ?? '',
        resource_beds: ((resourceDao?.resource_beds?.N) != null) ? parseInt(resourceDao.resource_beds.N) : 0,
        resource_bathrooms: ((resourceDao?.resource_bathrooms.N) != null) ? parseInt(resourceDao.resource_bathrooms.N) : 0,
        resource_capacity_kids: ((resourceDao?.resource_capacity_kids.N) != null) ? parseInt(resourceDao.resource_capacity_kids.N) : 0,
        resource_capacity_adults: ((resourceDao?.resource_capacity_adults.N) != null) ? parseInt(resourceDao.resource_capacity_adults.N) : 0,
        resource_bedrooms: ((resourceDao?.resource_bedrooms.N) != null) ? parseInt(resourceDao.resource_bedrooms.N) : 0,
        resource_description: resourceDao?.resource_description.S ?? '',
        resource_location: resourceDao?.resource_location.S ?? '',
        resource_price: ((resourceDao?.resource_price.N) != null) ? parseInt(resourceDao.resource_price.N) : 0,
        resource_mood: resourceDao?.resource_mood.S ?? '',
        resource_area: ((resourceDao?.resource_area.N) != null) ? parseInt(resourceDao.resource_area.N) : 0,
        resource_status: resourceDao?.resource_status.S ?? '',
        resource_images: JSON.parse(resourceDao?.resource_images.S ?? '[]'),
        resource_amenities: JSON.parse(resourceDao?.resource_amenities.S ?? '[]'),
        resource_rules: JSON.parse(resourceDao?.resource_rules.S ?? '[]'),
        resource_policies: JSON.parse(resourceDao?.resource_policies.S ?? '[]'),
        resource_type: resourceDao?.resource_type.S ?? '',
        resource_owner_email: resourceDao?.resource_owner_email.S ?? '',
        resource_owner_email_password: resourceDao?.resource_owner_email_password.S ?? '',
        entity: resourceDao?.entity.S ?? '',
        resource_characteristics: JSON.parse(resourceDao?.resource_characteristics?.S ?? '{}')
      };
    });
    return resources.map((resource) => this.mapperResource.from(resource));
  }

  async update (resource: Resource): Promise<Resource> {
    this._connection = new DynamoDBConnection(await DynamoDB.getInstance());
    const resourceDao = this.mapperResource.to(resource);
    const resourceDetailsParam: AWS.DynamoDB.UpdateItemInput = {
      TableName: DynamoDB.TABLE_NAME,
      Key: {
        pk: { S: resourceDao.pk },
        sk: { S: resourceDao.sk }
      },
      UpdateExpression: 'SET resource_name = :resource_name, resource_code = :resource_code, resource_owner = :resource_owner, resource_beds = :resource_beds, resource_bathrooms = :resource_bathrooms, resource_capacity_kids = :resource_capacity_kids, resource_capacity_adults = :resource_capacity_adults, resource_bedrooms = :resource_bedrooms, resource_description = :resource_description, resource_location = :resource_location, resource_price = :resource_price, resource_mood = :resource_mood, resource_area = :resource_area, resource_status = :resource_status, resource_images = :resource_images, resource_amenities = :resource_amenities, resource_rules = :resource_rules, resource_policies = :resource_policies, resource_type = :resource_type, resource_owner_email = :resource_owner_email, resource_owner_email_password = :resource_owner_email_password, resource_updatedAt = :resource_updatedAt , resource_characteristics = :resource_characteristics',
      ExpressionAttributeValues: {
        ':resource_name': { S: resourceDao.resource_name },
        ':resource_code': { S: resourceDao.resource_code },
        ':resource_owner': { S: resourceDao.resource_owner },
        ':resource_beds': typeof resourceDao.resource_beds === 'number' ? { N: resourceDao.resource_beds.toString() } : { NULL: true },
        ':resource_bathrooms': typeof resourceDao.resource_bathrooms === 'number' ? { N: resourceDao.resource_bathrooms.toString() } : { NULL: true },
        ':resource_capacity_kids': typeof resourceDao.resource_capacity_kids === 'number' ? { N: resourceDao.resource_capacity_kids.toString() } : { NULL: true },
        ':resource_capacity_adults': typeof resourceDao.resource_capacity_adults === 'number' ? { N: resourceDao.resource_capacity_adults.toString() } : { NULL: true },
        ':resource_bedrooms': typeof resourceDao.resource_bedrooms === 'number' ? { N: resourceDao.resource_bedrooms.toString() } : { NULL: true },
        ':resource_description': { S: resourceDao.resource_description ?? '' },
        ':resource_location': { S: resourceDao.resource_location },
        ':resource_price': { N: resourceDao.resource_price.toString() },
        ':resource_mood': (resourceDao.resource_mood != null) ? { S: resourceDao.resource_mood } : { NULL: true },
        ':resource_area': (resourceDao.resource_area != null) ? { N: resourceDao.resource_area?.toString() ?? '0' } : { NULL: true },
        ':resource_status': { S: resourceDao.resource_status },
        ':resource_images': (resourceDao.resource_images != null) ? { S: JSON.stringify(resourceDao.resource_images) } : { NULL: true },
        ':resource_amenities': (resourceDao.resource_amenities != null) ? { S: JSON.stringify(resourceDao.resource_amenities) } : { NULL: true },
        ':resource_rules': (resourceDao.resource_rules != null) ? { S: JSON.stringify(resourceDao.resource_rules) } : { NULL: true },
        ':resource_policies': (resourceDao.resource_policies != null) ? { S: JSON.stringify(resourceDao.resource_policies) } : { NULL: true },
        ':resource_type': { S: resourceDao.resource_type },
        ':resource_owner_email': (resourceDao.resource_owner_email != null) ? { S: resourceDao.resource_owner_email } : { NULL: true },
        ':resource_owner_email_password': (resourceDao.resource_owner_email_password != null) ? { S: resourceDao.resource_owner_email_password } : { NULL: true },
        ':resource_updatedAt': { S: new Date().toISOString() },
        ':resource_characteristics': { S: JSON.stringify(resourceDao.resource_characteristics) }
      }
    };
    const resourceUpdated = await this._connection?.update(resourceDetailsParam).then((data: any) => {
      return resourceDao;
    });
    return this.mapperResource.from(resourceUpdated);
  }

  async getAll (): Promise<Resource[]> {
    this._connection = new DynamoDBConnection(await DynamoDB.getInstance());
    const params = {
      TableName: DynamoDB.TABLE_NAME,
      FilterExpression: 'pk = :pk AND begins_with(sk, :sk)',
      ExpressionAttributeValues: {
        ':pk': { S: `Resource#${this.tenant.toUpperCase()}` },
        ':sk': { S: 'details#' }
      },
      ConsistentRead: true
    };
    const resourcesDao = await (await this._connection?.query(params)).Items as unknown as ResourceDynamoDBDao[];
    return resourcesDao.map((resourceDao) => this.mapperResource.from(resourceDao));
  }

  // TODO: Implement this method
  async getByRange (from: string, to?: string | undefined): Promise<Resource[]> {
    throw new Error('Method not implemented.');
  }

  async getByOwner (owner: string): Promise<Resource[]> {
    this._connection = new DynamoDBConnection(await DynamoDB.getInstance());
    const params = {
      TableName: DynamoDB.TABLE_NAME,
      FilterExpression: 'pk = :pk # AND begins_with(sk, :sk) AND resource_owner = :resource_owner',
      ExpressionAttributeValues: {
        ':pk': { S: `Resource#${this.tenant.toUpperCase()}` },
        ':sk': { S: 'details#' },
        ':resource_owner': { S: owner }
      },
      ConsistentRead: true
    };
    const resourcesDao = await (await this._connection?.scan(params)).Items as unknown as ResourceDynamoDBDao[];
    return resourcesDao.map((resourceDao) => this.mapperResource.from(resourceDao));
  }
}
