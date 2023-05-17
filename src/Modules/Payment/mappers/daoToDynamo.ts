import { Mapper } from 'utils/interfaces/mappers';
import { FactureDao } from '../db/dao/facture';
import { FactureDynamo } from '../db/dao/facturedynamodb';

export class MapperPaymentDaoToDynamoDB implements Mapper<FactureDao, FactureDynamo> {
  to (facture: FactureDao): FactureDynamo {
    return {
      booking_code: { S: facture.booking_code },
      bookingpk: { S: facture.bookingpk },
      bookingsk: { S: facture.bookingsk },
      dni: { S: facture.dni },
      entity: { S: facture.entity },
      facture_code: { S: facture.facture_code },
      facture_details: { S: facture.facture_details },
      facture_payment_amount: { N: facture.facture_payment_amount },
      facture_payment_date: { S: facture.facture_payment_date },
      facture_payment_method: { S: facture.facture_payment_method },
      facture_payment_reference: { S: facture.facture_payment_reference },
      facture_payment_state: { S: facture.facture_payment_state },
      facture_payment_transaction: { S: facture.facture_payment_transaction },
      facture_state: { S: facture.facture_state },
      facture_total: { N: facture.facture_total },
      resource_code: { S: facture.resource_code },
      start_date: { S: facture.start_date },
      end_date: { S: facture.end_date },
      tenant: { S: facture.tenant },
      facture_payment_error: (facture.facture_payment_error != null) ? { S: JSON.stringify(facture.facture_payment_error) } : undefined,
      facture_payment_error_code: (facture.facture_payment_error_code != null) ? { S: JSON.stringify(facture.facture_payment_error_code) } : undefined,
      facture_payment_error_message: (facture.facture_payment_error_message != null) ? { S: JSON.stringify(facture.facture_payment_error_message) } : undefined,
      facture_payment_error_type: (facture.facture_payment_error_type != null) ? { S: JSON.stringify(facture.facture_payment_error_type) } : undefined,
      facture_payment_link: (facture.facture_payment_link != null) ? { S: JSON.stringify(facture.facture_payment_link) } : undefined,
      facture_payment_response: (facture.facture_payment_response != null) ? { S: JSON.stringify(facture.facture_payment_response) } : undefined
    };
  }

  from (facture: FactureDynamo): FactureDao {
    return {
      booking_code: facture.booking_code.S,
      bookingpk: facture.bookingpk?.S ?? '',
      bookingsk: facture.bookingsk?.S ?? '',
      dni: facture.dni?.S,
      entity: facture.entity?.S,
      facture_code: facture.facture_code?.S,
      facture_details: facture.facture_details?.S,
      facture_payment_amount: facture.facture_payment_amount.N,
      facture_payment_date: facture.facture_payment_date?.S,
      facture_payment_method: facture.facture_payment_method?.S,
      facture_payment_reference: facture.facture_payment_reference?.S,
      facture_payment_state: facture.facture_payment_state?.S,
      facture_payment_transaction: facture.facture_payment_transaction?.S,
      facture_state: facture.facture_state?.S,
      facture_total: facture.facture_total.N,
      start_date: facture?.start_date?.S,
      end_date: facture.end_date?.S,
      resource_code: facture.resource_code?.S,
      tenant: facture.tenant?.S,
      facture_payment_error: (facture.facture_payment_error != null) ? JSON.parse(facture.facture_payment_error?.S) : undefined,
      facture_payment_error_code: (facture.facture_payment_error_code != null) ? JSON.parse(facture.facture_payment_error_code.S) : undefined,
      facture_payment_error_message: (facture.facture_payment_error_message != null) ? JSON.parse(facture.facture_payment_error_message.S) : undefined,
      facture_payment_error_type: (facture.facture_payment_error_type != null) ? JSON.parse(facture.facture_payment_error_type.S) : undefined,
      facture_payment_link: (facture.facture_payment_link != null) ? JSON.parse(facture.facture_payment_link.S) : undefined,
      facture_payment_response: (facture.facture_payment_response != null) ? JSON.parse(facture.facture_payment_response.S) : undefined
    };
  }
}
