import { DynamoDBConnection } from '@Database/Clients/dynamodb';
import { Exception } from 'utils/Exceptions';

export class ConfigRepositoryDynamoDB {
  tenant: string;
  tablename: string = 'Kru360-config-integrations';
  private _connection?: DynamoDBConnection;

  constructor (tenant: string, connection?: DynamoDBConnection) {
    this.tenant = tenant;
    this._connection = connection;
  }

  private async getConnection (): Promise<DynamoDBConnection> {
    if (this._connection == null) {
      this._connection = await DynamoDBConnection.build();
    }
    return this._connection;
  }

  async createConfig<T> (config: T, module: string): Promise<boolean> {
    const params = {
      TableName: this.tablename,
      Item: {
        pk: { S: this.tenant.toUpperCase() },
        sk: { S: module + '#config' },
        config: { S: JSON.stringify(config) }
      },
      ConditionExpression: 'attribute_not_exists(pk) AND attribute_not_exists(sk)'
    };
    const connection = await this.getConnection();
    await connection.put(params).catch((error) => {
      if (error.code === 'ConditionalCheckFailedException') {
        throw new Exception('Email config already exists');
      }
      throw error;
    });
    return true;
  }

  async updateConfig<T> (config: T, module: string): Promise<boolean> {
    const params = {
      TableName: this.tablename,
      Key: {
        pk: { S: this.tenant.toUpperCase() },
        sk: { S: module + '#config' }
      },
      UpdateExpression: 'set config = :config',
      ExpressionAttributeValues: {
        ':config': { S: JSON.stringify(config) }
      },
      ReturnValues: 'ALL_NEW'
    };
    const connection = await this.getConnection();
    await connection.update(params).catch((error) => {
      if (error.code === 'ConditionalCheckFailedException') {
        throw new Exception('Email config does not exist');
      }
      throw error;
    });
    return true;
  }

  async getConfig<T> (module: string): Promise<T> {
    const params: AWS.DynamoDB.QueryInput = {
      TableName: this.tablename,
      KeyConditionExpression: 'pk = :pk AND sk = :sk',
      ExpressionAttributeValues: {
        ':pk': { S: this.tenant.toUpperCase() },
        ':sk': { S: module + '#config' }
      },
      Limit: 1,
      ScanIndexForward: false,
      ConsistentRead: true,
      ReturnConsumedCapacity: 'TOTAL',
      ProjectionExpression: 'config'
    };
    const connection = await this.getConnection();
    const result = await connection.query(params).catch((error) => {
      console.log(error);
      if (error.code === 'ConditionalCheckFailedException') {
        console.log(error.message);
        throw new Exception('Google config does not exist');
      }
      throw error;
    });
    if (result.Items == null || result.Items.length === 0) {
      throw new Exception('Google config does not exist');
    }
    return JSON.parse(result.Items[0].config.S ?? '{}');
  }

  async deleteConfig (module: string): Promise<boolean> {
    const params: AWS.DynamoDB.DeleteItemInput = {
      TableName: this.tablename,
      Key: {
        pk: { S: this.tenant.toUpperCase() },
        sk: { S: module + '#config' }
      }
    };
    const connection = await this.getConnection();
    await connection.delete(params);
    return true;
  }
}
