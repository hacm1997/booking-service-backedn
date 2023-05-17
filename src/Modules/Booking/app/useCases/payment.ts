import { BookingRepository } from '@Booking/domain/repositories/Booking';
import { ResourceRepository } from '@Resources/domain/repositories/Resource';
import { Exception } from 'utils/Exceptions';

export class PayBookingUseCase {
  private readonly _bookingRepository: BookingRepository;
  // private readonly _paymentRepository: PaymentRepository;
  private readonly _resourceRepository: ResourceRepository;

  constructor (bookingRepository: BookingRepository, resourceRepository: ResourceRepository) {
    this._bookingRepository = bookingRepository;
    // this._paymentRepository = paymentRepository;
    this._resourceRepository = resourceRepository;
  }

  // async run (code: string, payment: Payment): Promise<Payment> {
  async run (code: string, resourceId: string): Promise<any> {
    const booking = await this._bookingRepository.get(code, resourceId);
    if (booking === undefined) {
      throw new Exception('Booking not found');
    }
    if (booking.resource === undefined) {
      throw new Exception('Resource not found');
    }
    if (booking.resource.code !== resourceId) {
      throw new Exception('Resource not found');
    }
    const resource = await this._resourceRepository.get(booking.resource?.code);
    // const paymentResult = await this._paymentRepository.pay(resource, payment);
    // if (paymentResult.status === 'approved') {
    // await this._bookingRepository.setState(booking, 'paid');
    // }
    // return paymentResult;
    return resource;
  }
}
