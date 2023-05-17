import AWS from '../aws';
import env from 'Shared/env';
import { ILogger } from 'utils/Logger/logger.interface';
import { LoggerService } from 'utils/Logger/logger.service';
import { dataEmailTransporterOptionsTable } from './initData';

export class DynamoDB {
  public static TABLE_NAME: string = env.dynamodb.tableName ?? 'BOOKING';
  public static BOOKING_INDEX_NAME: string = 'booking';
  private static _INSTANCE: AWS.DynamoDB;
  private static readonly options_dev: AWS.DynamoDB.ClientConfiguration = { region: 'local', endpoint: env.dynamodb.endpoint, apiVersion: env.dynamodb.apiVersion, credentials: { accessKeyId: env.dynamodb.accessKeyId as string, secretAccessKey: env.dynamodb.secretAccessKey as string } };
  private static readonly options_prod: AWS.DynamoDB.ClientConfiguration = { region: env.dynamodb.region, apiVersion: env.dynamodb.apiVersion };
  private static logger: ILogger;

  static async getInstance (): Promise<AWS.DynamoDB> {
    if (this._INSTANCE == null) {
      this.logger = new LoggerService();
      this.logger.log('Initializing DynamoDB...');
      this.logger.log(`Environment: ${env.NODE_ENV as string}`);
      const options = env.NODE_ENV === 'development'
        ? this.options_dev
        : {
            ...this.options_prod
          };
      this._INSTANCE = new AWS.DynamoDB(options);
    }
    return this._INSTANCE;
  }

  static async start (instance: AWS.DynamoDB): Promise<void> {
    await this.createConfigTransporterOptionsTable(instance);
    await this.initDataConfigTransporterOptionsTable(instance);
    return await instance.createTable({
      TableName: DynamoDB.TABLE_NAME,
      AttributeDefinitions: [
        {
          AttributeName: 'pk',
          AttributeType: 'S'
        },
        {
          AttributeName: 'sk',
          AttributeType: 'S'
        },
        {
          AttributeName: 'bookingpk',
          AttributeType: 'S'
        },
        {
          AttributeName: 'bookingsk',
          AttributeType: 'S'
        }
      ],
      KeySchema: [
        {
          AttributeName: 'pk',
          KeyType: 'HASH'
        },
        {
          AttributeName: 'sk',
          KeyType: 'RANGE'
        }
      ],
      GlobalSecondaryIndexes: [
        {
          IndexName: 'booking',
          KeySchema: [
            {
              AttributeName: 'bookingpk',
              KeyType: 'HASH'
            },
            {
              AttributeName: 'bookingsk',
              KeyType: 'RANGE'
            }
          ],
          Projection: {
            ProjectionType: 'ALL'
          },
          ProvisionedThroughput: {
            ReadCapacityUnits: 3,
            WriteCapacityUnits: 3
          }
        }
      ],
      BillingMode: 'PROVISIONED',
      ProvisionedThroughput: {
        ReadCapacityUnits: 3,
        WriteCapacityUnits: 3
      }
    }, (error, data) => {
      if (error != null) {
        switch (error.code) {
          case 'ResourceInUseException':
            this.logger.log(`Table ${DynamoDB.TABLE_NAME} already exists.`);
            break;
          default:
            this.logger.warn(`Warning creating table ${DynamoDB.TABLE_NAME}: ${error.message}`);
        }
      } else {
        this.logger.log(`Table ${DynamoDB.TABLE_NAME} created.`);
      }
    }).promise().then(() => {
      this.logger.log(`Table ${DynamoDB.TABLE_NAME} is ready.`);
    }).catch((error) => {
      this.logger.warn(`Warning creating table ${DynamoDB.TABLE_NAME}: ${error.message as string}`);
    });
  }

  private static async initDataConfigTransporterOptionsTable (instance: AWS.DynamoDB): Promise<void> {
    const params = dataEmailTransporterOptionsTable.map((item) => {
      return {
        PutRequest: {
          Item: {
            pk: { S: item.tenant },
            sk: { S: item.module + '#config' },
            config: { S: JSON.stringify(item.config) }
          }
        }
      };
    });
    const paramsBatchWrite = {
      RequestItems: {
        [DynamoDB.TABLE_NAME]: params
      }
    };
    await instance.batchWriteItem(paramsBatchWrite).promise().then((data) => {
      this.logger.log('Data EmailTransporterOptions table created.');
    }).catch((error) => {
      this.logger.warn(`Warning creating data EmailTransporterOptions table: ${error.message as string}`);
    }
    );
  }

  private static async createConfigTransporterOptionsTable (instance: AWS.DynamoDB): Promise<void> {
    return await instance.createTable({
      TableName: 'Kru360-config-integrations',
      AttributeDefinitions: [
        {
          AttributeName: 'pk',
          AttributeType: 'S'
        },
        {
          AttributeName: 'sk',
          AttributeType: 'S'
        }
      ],
      KeySchema: [
        {
          AttributeName: 'pk',
          KeyType: 'HASH'
        },
        {
          AttributeName: 'sk',
          KeyType: 'RANGE'
        }
      ],
      BillingMode: 'PROVISIONED',
      ProvisionedThroughput: {
        ReadCapacityUnits: 1,
        WriteCapacityUnits: 1
      }
    }, (error, data) => {
      if (error != null) {
        switch (error.code) {
          case 'ResourceInUseException':
            this.logger.log('Table Kru360-config-integrations already exists.');
            break;
          default:
            this.logger.warn(`Warning creating table Kru360-config-integrations: ${error.message}`);
        }
      } else {
        this.logger.log('Table Kru360-config-integrations created.');
      }
    }).promise().then(() => {
      this.logger.log('Table Kru360-config-integrations is ready.');
    }
    ).catch((error) => {
      this.logger.warn(`Warning creating table Kru360-config-integrations: ${error.message as string}`);
    });
  }
}

export type DynamoDBFunctions = AWS.DynamoDB;
