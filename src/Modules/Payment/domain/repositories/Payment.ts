import { Facture } from '../entity/Facture';

export interface PaymentRepository {
  createFacture: (facture: Facture) => Promise<Facture>
  getFactureByBookingCode: (bookingCode: string) => Promise<Facture>
  getFactureByUserDni: (bookingCode: string, userDni: string) => Promise<Facture>
  getFactureByTenant: (tenant: string) => Promise<Facture>
  updateFacture: (Facture: Facture) => Promise<Facture>
  deleteFacture: (Facture: Facture) => Promise<Facture>
}
