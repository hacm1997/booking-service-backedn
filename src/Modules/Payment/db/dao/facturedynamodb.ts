export interface FactureDynamo {
  tenant: { S: string }
  entity: { S: string }
  bookingpk: { S: string }
  bookingsk: { S: string }
  start_date: { S: string }
  end_date: { S: string }
  dni: { S: string }
  booking_code: { S: string }
  resource_code: { S: string }
  facture_code: { S: string }
  facture_state: { S: string }
  facture_details: { S: string }
  facture_total: { N: string }
  facture_payment_method: { S: string }
  facture_payment_state: { S: string }
  facture_payment_amount: { N: string }
  facture_payment_link?: { S: string }
  facture_payment_date: { S: string }
  facture_payment_reference: { S: string }
  facture_payment_transaction: { S: string }
  facture_payment_response?: { S: string }
  facture_payment_error?: { S: string }
  facture_payment_error_code?: { S: string }
  facture_payment_error_message?: { S: string }
  facture_payment_error_type?: { S: string }
}
