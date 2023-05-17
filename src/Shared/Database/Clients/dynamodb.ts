import { DynamoDB } from '@Database/aws/dynamodb';

export class DynamoDBConnection {
  constructor (private readonly dynamoDB?: AWS.DynamoDB) {
    if (dynamoDB == null) {
      throw new Error('Cannot be called directly without being built.');
    }
  }

  static async build (dynamoDB?: AWS.DynamoDB): Promise<DynamoDBConnection> {
    if (dynamoDB == null) {
      const connection = await DynamoDB.getInstance().then(async (dynamoDB) => {
        await DynamoDB.start(dynamoDB);
        return new DynamoDBConnection(dynamoDB);
      });
      return connection;
    }
    return new DynamoDBConnection(dynamoDB);
  }

  async query (params: AWS.DynamoDB.QueryInput): Promise<AWS.DynamoDB.QueryOutput> {
    return await new Promise((resolve, reject) => {
      this.dynamoDB?.query(params, (error: AWS.AWSError, data: AWS.DynamoDB.QueryOutput) => {
        if (error != null) {
          reject(error);
        } else {
          resolve(data);
        }
      });
    });
  }

  async scan (params: AWS.DynamoDB.ScanInput): Promise<AWS.DynamoDB.ScanOutput> {
    return await new Promise((resolve, reject) => {
      this.dynamoDB?.scan(params, (error: AWS.AWSError, data: AWS.DynamoDB.ScanOutput) => {
        if (error != null) {
          reject(error);
        } else {
          resolve(data);
        }
      });
    });
  }

  async multipleScan (params: AWS.DynamoDB.ScanInput): Promise<AWS.DynamoDB.ScanOutput[]> {
    const results: AWS.DynamoDB.ScanOutput[] = [];
    let lastEvaluatedKey: AWS.DynamoDB.Key | undefined;
    do {
      const result = await this.scan({ ...params, ExclusiveStartKey: lastEvaluatedKey });
      results.push(result);
      lastEvaluatedKey = result.LastEvaluatedKey;
    } while (lastEvaluatedKey != null);
    return results;
  }

  async put (params: AWS.DynamoDB.PutItemInput): Promise<AWS.DynamoDB.PutItemOutput> {
    return await new Promise((resolve, reject) => {
      this.dynamoDB?.putItem(params, (error: AWS.AWSError, data: AWS.DynamoDB.PutItemOutput) => {
        if (error != null) {
          reject(error);
        } else {
          resolve(data);
        }
      });
    });
  }

  async multiplePut (params: AWS.DynamoDB.PutItemInput[]): Promise<AWS.DynamoDB.PutItemOutput[]> {
    return await Promise.all(params.map(async (param) => await this.put(param)));
  }

  async delete (params: AWS.DynamoDB.DeleteItemInput): Promise<AWS.DynamoDB.DeleteItemOutput> {
    return await new Promise((resolve, reject) => {
      this.dynamoDB?.deleteItem(params, (error: AWS.AWSError, data: AWS.DynamoDB.DeleteItemOutput) => {
        if (error != null) {
          reject(error);
        } else {
          resolve(data);
        }
      });
    });
  }

  async update (params: AWS.DynamoDB.UpdateItemInput): Promise<AWS.DynamoDB.UpdateItemOutput> {
    return await new Promise((resolve, reject) => {
      this.dynamoDB?.updateItem(params, (error: AWS.AWSError, data: AWS.DynamoDB.UpdateItemOutput) => {
        if (error != null) {
          reject(error);
        } else {
          resolve(data);
        }
      });
    });
  }

  async multipleUpdate (params: AWS.DynamoDB.UpdateItemInput[]): Promise<AWS.DynamoDB.UpdateItemOutput[]> {
    return await Promise.all(params.map(async (param) => await this.update(param)));
  }

  async batchWrite (params: AWS.DynamoDB.BatchWriteItemInput): Promise<AWS.DynamoDB.BatchWriteItemOutput> {
    return await new Promise((resolve, reject) => {
      this.dynamoDB?.batchWriteItem(params, (error: AWS.AWSError, data: AWS.DynamoDB.BatchWriteItemOutput) => {
        if (error != null) {
          reject(error);
        } else {
          resolve(data);
        }
      });
    });
  }

  async getTableDescription (tableName: string): Promise<AWS.DynamoDB.TableDescription | undefined> {
    const result = await this.dynamoDB?.describeTable({ TableName: tableName }).promise();
    return result?.Table;
  }

  async transactWrite (params: AWS.DynamoDB.TransactWriteItemsInput): Promise<AWS.DynamoDB.TransactWriteItemsOutput> {
    return await new Promise((resolve, reject) => {
      this.dynamoDB?.transactWriteItems(params, (error: AWS.AWSError, data: AWS.DynamoDB.TransactWriteItemsOutput) => {
        if (error != null) {
          reject(error);
        } else {
          resolve(data);
        }
      });
    });
  }

  async transactGet (params: AWS.DynamoDB.TransactGetItemsInput): Promise<AWS.DynamoDB.TransactGetItemsOutput> {
    return await new Promise((resolve, reject) => {
      this.dynamoDB?.transactGetItems(params, (error: AWS.AWSError, data: AWS.DynamoDB.TransactGetItemsOutput) => {
        if (error != null) {
          reject(error);
        } else {
          resolve(data);
        }
      });
    });
  }
}
