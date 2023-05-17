import { DynamoDB } from '@Database/aws/dynamodb';
import { DynamoDBConnection } from '@Database/Clients/dynamodb';
import { Guest } from '../domain/entities/Guest';
import { GuestRepository } from '../domain/guest.repository';
import { MapperUserDomainDao } from '../mappers/DomainDao';

export class GuestDynamoDBRepository implements GuestRepository {
  private readonly mapper: MapperUserDomainDao;
  private _connection?: DynamoDBConnection;
  tenant: string;

  constructor (tenant: string, connection?: DynamoDBConnection) {
    this._connection = connection;
    this.tenant = tenant;
    this.mapper = new MapperUserDomainDao();
  }

  async save (guest: Guest): Promise<boolean> {
    this._connection = new DynamoDBConnection(await DynamoDB.getInstance());
    const guestDao = this.mapper.to(guest);
    const params = {
      TableName: DynamoDB.TABLE_NAME,
      Item: {
        pk: { S: `User#${this.tenant}` },
        sk: { S: `profile#${guestDao.guest_code}` },
        guest_code: { S: guestDao.guest_code },
        guest_name: { S: guestDao.guest_name },
        guest_email: { S: guestDao.guest_email },
        guest_cellphone: { S: guestDao.guest_cellphone },
        guest_details: { S: guestDao.guest_details }
      }
    };
    const result = await this._connection.put(params);
    return result.Attributes !== undefined;
  }

  async update (guest: Partial<Guest>): Promise<boolean> {
    this._connection = new DynamoDBConnection(await DynamoDB.getInstance());
    const guestDao = this.mapper.to(guest as Guest);
    const params = {
      TableName: DynamoDB.TABLE_NAME,
      Key: {
        pk: { S: `User#${this.tenant}` },
        sk: { S: `profile#${guestDao.guest_code}` }
      },
      UpdateExpression: 'set guest_name = :guest_name, guest_email = :guest_email, guest_cellphone = :guest_cellphone, guest_details = :guest_details',
      ExpressionAttributeValues: {
        ':guest_name': { S: guestDao.guest_name },
        ':guest_email': { S: guestDao.guest_email },
        ':guest_cellphone': { S: guestDao.guest_cellphone },
        ':guest_details': { S: guestDao.guest_details }
      },
      ReturnValues: 'ALL_NEW'
    };
    const result = await this._connection.update(params);
    return result.Attributes !== undefined;
  }

  async delete (dni: string): Promise<boolean> {
    this._connection = new DynamoDBConnection(await DynamoDB.getInstance());
    const params = {
      TableName: DynamoDB.TABLE_NAME,
      Key: {
        pk: { S: `User#${this.tenant}` },
        sk: { S: `profile#${dni}` }
      },
      ReturnValues: 'ALL_OLD'
    };
    const result = await this._connection.delete(params);
    return result.Attributes !== undefined;
  }

  async get (dni: string): Promise<Guest | undefined> {
    this._connection = new DynamoDBConnection(await DynamoDB.getInstance());
    const params = {
      TableName: DynamoDB.TABLE_NAME,
      KeyConditionExpression: 'pk = :pk and sk = :sk',
      ExpressionAttributeValues: {
        ':pk': { S: `User#${this.tenant}` },
        ':sk': { S: `profile#${dni}` }
      }
    };
    const result = await this._connection.query(params);
    return result.Items?.map(item => this.mapper.from(item as any))[0];
  }

  async getAll (): Promise<Guest[]> {
    this._connection = new DynamoDBConnection(await DynamoDB.getInstance());
    const params = {
      TableName: DynamoDB.TABLE_NAME,
      KeyConditionExpression: 'pk = :pk',
      ExpressionAttributeValues: {
        ':pk': { S: `User#${this.tenant}` }
      }
    };
    const result = await this._connection.query(params);
    return result.Items?.map(item => this.mapper.from(item as any)) ?? [];
  }
}
