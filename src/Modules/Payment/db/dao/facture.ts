import { json } from 'utils/json.interface';

export interface FactureDao {
  tenant: string
  entity: string
  bookingpk: string
  bookingsk: string
  start_date: string
  end_date: string
  dni: string
  booking_code: string
  resource_code: string
  facture_code: string
  facture_state: string
  facture_details: string
  facture_total: string
  facture_payment_method: string
  facture_payment_state: string
  facture_payment_amount: string
  facture_payment_link?: string
  facture_payment_date: string
  facture_payment_reference: string
  facture_payment_transaction: string
  facture_payment_response?: json
  facture_payment_error?: json
  facture_payment_error_code?: string
  facture_payment_error_message?: string
  facture_payment_error_type?: string
}
