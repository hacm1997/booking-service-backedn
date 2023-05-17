import { PaymentRepository } from 'Modules/Payment/domain/repositories/Payment';
import { PaymentDto } from '../dto/payment';

export class GetPayUseCase {
  private readonly paymentRepository: PaymentRepository;

  constructor (paymentRepository: PaymentRepository) {
    this.paymentRepository = paymentRepository;
  }

  async run (bookingCode: string): Promise<PaymentDto> {
    const facture = await this.paymentRepository.getFactureByBookingCode(bookingCode);
    return {
      bookingCode: facture.bookingCode,
      resourceCode: facture.resourceCode,
      method: facture.method,
      startDate: facture.startDate,
      tenant: facture.tenant,
      userDni: facture.userDni,
      endDate: facture.endDate,
      facture: {
        booking_code: facture.bookingCode,
        details: facture.details,
        reference: facture.id,
        total: facture.total,
        status: facture.status
      }
    };
  }
}
