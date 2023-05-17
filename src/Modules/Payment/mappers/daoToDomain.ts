import { Mapper } from 'utils/interfaces/mappers';
import { FactureDao } from '../db/dao/facture';
import { Facture } from '../domain/entity/Facture';

export class MapperPaymentDaoToDomain implements Mapper<FactureDao, Facture> {
  to (factureDao: FactureDao): Facture {
    //console.log("Facture => ", factureDao);
    return {
      id: factureDao.facture_code,
      tenant: factureDao.tenant,
      bookingCode: factureDao.booking_code,
      resourceCode: factureDao.resource_code,
      userDni: factureDao.dni,
      details: JSON.parse(factureDao.facture_details),
      total: (factureDao.facture_total.length > 0) ? parseFloat(factureDao.facture_total) : 0,
      status: factureDao.facture_state,
      method: factureDao.facture_payment_method,
      created_at: factureDao.facture_payment_date,
      updated_at: factureDao.facture_payment_date,
      startDate: factureDao.start_date,
      endDate: factureDao.end_date
    };
  }

  toDomainList (factureDaoList: FactureDao[]): Facture[] {
    return factureDaoList.map(factureDao => this.to(factureDao));
  }

  from (facture: Facture): FactureDao {
    return {
      tenant: facture.tenant,
      entity: 'facture',
      bookingpk: facture.bookingCode,
      bookingsk: facture.bookingCode,
      start_date: facture.startDate,
      end_date: facture.endDate,
      dni: facture.userDni,
      booking_code: facture.bookingCode,
      resource_code: facture.resourceCode,
      facture_code: facture.id,
      facture_state: facture.status,
      facture_details: JSON.stringify(facture.details),
      facture_total: facture.total.toString(),
      facture_payment_method: facture.method,
      facture_payment_state: facture.status,
      facture_payment_amount: facture.total.toString(),
      facture_payment_date: facture.created_at,
      facture_payment_reference: facture.id,
      facture_payment_transaction: ''
    };
  }

  fromDomainList (factureList: Facture[]): FactureDao[] {
    return factureList.map(facture => this.from(facture));
  }
}
