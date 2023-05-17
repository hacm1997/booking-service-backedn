import { DynamoDB } from '@Database/aws/dynamodb';
import { DynamoDBConnection } from '@Database/Clients/dynamodb';
import { Facture } from 'Modules/Payment/domain/entity/Facture';
import { PaymentRepository } from 'Modules/Payment/domain/repositories/Payment';
import { MapperPaymentDaoToDomain } from 'Modules/Payment/mappers/daoToDomain';
import { MapperPaymentDaoToDynamoDB } from 'Modules/Payment/mappers/daoToDynamo';
import { Exception } from 'utils/Exceptions';

export class DynamoDBPaymentRepository implements PaymentRepository {
  private _connection?: DynamoDBConnection;
  tenant: string;
  resource?: string | undefined;
  mapperBooking = new MapperPaymentDaoToDomain();
  mapperDynamoDB = new MapperPaymentDaoToDynamoDB();

  constructor (tenant: string, resource?: string | undefined, connection?: DynamoDBConnection) {
    this._connection = connection;
    this.tenant = tenant;
    this.resource = resource;
  }

  async createFacture (facture: Facture): Promise<Facture> {
    this._connection = new DynamoDBConnection(await DynamoDB.getInstance());
    const factureDao = this.mapperBooking.from(facture);
    const params = {
      TableName: DynamoDB.TABLE_NAME,
      Item: {
        pk: { S: `Payment#${this.tenant}` },
        sk: { S: `Facture#${factureDao.booking_code}#${factureDao.dni}#${factureDao.facture_code}` },
        dni: { S: factureDao.dni },
        booking_code: { S: factureDao.booking_code },
        resource_code: { S: factureDao.resource_code },
        facture_code: { S: factureDao.facture_code },
        facture_state: { S: factureDao.facture_state },
        facture_details: { S: factureDao.facture_details },
        facture_total: { N: factureDao.facture_total },
        facture_payment_method: { S: factureDao.facture_payment_method },
        facture_payment_state: { S: factureDao.facture_payment_state },
        facture_payment_amount: { N: factureDao.facture_payment_amount },
        facture_payment_date: { S: factureDao.facture_payment_date },
        facture_payment_reference: { S: factureDao.facture_payment_reference },
        facture_payment_transaction: { S: factureDao.facture_payment_transaction },
        facture_payment_error_code: { S: factureDao.facture_payment_error_code ?? '{}' },
        facture_payment_error_message: { S: factureDao.facture_payment_error_message ?? '{}' },
        facture_payment_error_type: { S: factureDao.facture_payment_error_type ?? '{}' },
        facture_payment_link: { S: factureDao.facture_payment_link ?? '{}' },
        tenant: { S: this.tenant },
        entity: { S: 'Páyment' }
      }
    };
    try {
      await this._connection.put(params);
      return facture;
    } catch (error) {
      throw new Exception('Error al crear la factura');
    }
  }

  async getFactureByBookingCode (bookingCode: string): Promise<Facture> {
    this._connection = new DynamoDBConnection(await DynamoDB.getInstance());
    const params = {
      TableName: DynamoDB.TABLE_NAME,
      KeyConditionExpression: 'pk = :pk and begins_with(sk, :sk)',
      ExpressionAttributeValues: {
        ':pk': { S: `Payment#${this.tenant}` },
        ':sk': { S: `Facture#${bookingCode}` }
      }
    };
    const result = await this._connection.query(params);
    //console.log("Result => ", result);
    //console.log("result item => ",result.Items?.[0]);
    const facture = this.mapperDynamoDB.from(result.Items?.[0] as any);
    
    return this.mapperBooking.to(facture);
  }

  async getFactureByUserDni (bookingCode: string, userDni: string): Promise<Facture> {
    this._connection = new DynamoDBConnection(await DynamoDB.getInstance());
    const params = {
      TableName: DynamoDB.TABLE_NAME,
      KeyConditionExpression: 'pk = :pk and begins_with(sk, :sk)',
      ExpressionAttributeValues: {
        ':pk': { S: `Payment#${this.tenant}` },
        ':sk': { S: `Facture#${bookingCode}#${userDni}` }
      }
    };
    const result = await this._connection.query(params);
    const facture = this.mapperDynamoDB.from(result.Items?.[0] as any);
    return this.mapperBooking.to(facture);
  }

  async getFactureByTenant (tenant: string): Promise<Facture> {
    this._connection = new DynamoDBConnection(await DynamoDB.getInstance());
    const params = {
      TableName: DynamoDB.TABLE_NAME,
      KeyConditionExpression: 'pk = :pk and begins_with(sk, :sk)',
      ExpressionAttributeValues: {
        ':pk': { S: `Payment#${tenant}` },
        ':sk': { S: 'Facture#' }
      }
    };
    const result = await this._connection.query(params);
    const facture = this.mapperDynamoDB.from(result.Items?.[0] as any);
    return this.mapperBooking.to(facture);
  }

  async updateFacture (Facture: Facture): Promise<Facture> {
    this._connection = new DynamoDBConnection(await DynamoDB.getInstance());
    const factureDao = this.mapperBooking.from(Facture);
    const params = {
      TableName: DynamoDB.TABLE_NAME,
      Key: {
        pk: { S: `Payment#${this.tenant}` },
        sk: { S: `Facture#${factureDao.booking_code}#${factureDao.dni}#${factureDao.facture_code}` }
      },
      UpdateExpression: 'set #booking_state = :booking_state, #facture_state = :facture_state, #facture_details = :facture_details, #facture_total = :facture_total, #facture_payment_method = :facture_payment_method, #facture_payment_state = :facture_payment_state, #facture_payment_amount = :facture_payment_amount, #facture_payment_date = :facture_payment_date, #facture_payment_reference = :facture_payment_reference, #facture_payment_transaction = :facture_payment_transaction, #facture_payment_error_code = :facture_payment_error_code, #facture_payment_error_message = :facture_payment_error_message, #facture_payment_error_type = :facture_payment_error_type',
      ExpressionAttributeNames: {
        '#booking_state': 'booking_state',
        '#facture_state': 'facture_state',
        '#facture_details': 'facture_details',
        '#facture_total': 'facture_total',
        '#facture_payment_method': 'facture_payment_method',
        '#facture_payment_state': 'facture_payment_state',
        '#facture_payment_amount': 'facture_payment_amount',
        '#facture_payment_date': 'facture_payment_date',
        '#facture_payment_reference': 'facture_payment_reference',
        '#facture_payment_transaction': 'facture_payment_transaction',
        '#facture_payment_error_code': 'facture_payment_error_code',
        '#facture_payment_error_message': 'facture_payment_error_message',
        '#facture_payment_error_type': 'facture_payment_error_type'
      },
      ExpressionAttributeValues: {
        ':facture_state': { S: factureDao.facture_state },
        ':facture_details': { S: factureDao.facture_details },
        ':facture_total': { N: factureDao.facture_total },
        ':facture_payment_method': { S: factureDao.facture_payment_method },
        ':facture_payment_state': { S: factureDao.facture_payment_state },
        ':facture_payment_amount': { N: factureDao.facture_payment_amount },
        ':facture_payment_date': { S: factureDao.facture_payment_date },
        ':facture_payment_reference': { S: factureDao.facture_payment_reference },
        ':facture_payment_transaction': { S: factureDao.facture_payment_transaction },
        ':facture_payment_error_code': { S: factureDao.facture_payment_error_code },
        ':facture_payment_error_message': { S: factureDao.facture_payment_error_message },
        ':facture_payment_error_type': { S: factureDao.facture_payment_error_type }
      }
    };
    const result = await this._connection.update(params);
    return this.mapperBooking.to(result.Attributes as any);
  }

  async deleteFacture (Facture: Facture): Promise<Facture> {
    this._connection = new DynamoDBConnection(await DynamoDB.getInstance());
    const factureDao = this.mapperBooking.from(Facture);
    const params = {
      TableName: DynamoDB.TABLE_NAME,
      Key: {
        pk: { S: `Payment#${this.tenant}` },
        sk: { S: `Facture#${factureDao.booking_code}#${factureDao.dni}#${factureDao.facture_code}` }
      }
    };
    const result = await this._connection.delete(params);
    return this.mapperBooking.to(result.Attributes as any);
  }
}
