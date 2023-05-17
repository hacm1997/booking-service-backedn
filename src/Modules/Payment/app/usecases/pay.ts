import { BookingRepository } from 'Modules/Booking/domain/repositories/Booking';
import { PaymentRepository } from 'Modules/Payment/domain/repositories/Payment';
import { MapperPaymentDtoToDomain } from 'Modules/Payment/mappers/dtoToDomain';
import { ResourceRepository } from 'Modules/Resources/domain/repositories/Resource';
import { Exception } from 'utils/Exceptions';
import { PaymentDto } from '../dto/payment';

export class PayUseCase {
  private readonly paymentRepository: PaymentRepository;
  private readonly bookingRepository: BookingRepository;
  private readonly _openSearchRepository: Partial<ResourceRepository>;
  private readonly resourceRepository: ResourceRepository;
  private readonly _mapper = new MapperPaymentDtoToDomain();

  constructor (
    paymentRepository: PaymentRepository,
    bookingRepository: BookingRepository,
    resourceRepository: ResourceRepository,
    openSearchRepository: Partial<ResourceRepository>
  ) {
    this.paymentRepository = paymentRepository;
    this.bookingRepository = bookingRepository;
    this.resourceRepository = resourceRepository;
    this._openSearchRepository = openSearchRepository;
  }

  async run (paymentDto: PaymentDto): Promise<PaymentDto> {
    const payment = this._mapper.from(paymentDto);
    const { bookingCode, resourceCode, startDate } = payment;
    // STEP 1: Get the booking And check if exists
    console.log('STEP 1');
    console.log('bookingCode', bookingCode);
    console.log(startDate);
    const booking = await this.bookingRepository.get(startDate, resourceCode, payment.endDate).catch(() => {
      throw new Exception('Booking not found');
    });
    if (booking === undefined) {
      throw new Exception('Booking not found');
    }
    // STEP 2: Get the resource And check if exists
    console.log('STEP 2');
    const resource = await this.resourceRepository.get(resourceCode);
    if (resource === undefined) {
      throw new Exception('Resource not found');
    }
    // STEP 3: Check the facture status
    console.log('STEP 3');
    const facture = paymentDto.facture;
    // STEP 4: If the facture is paid then create a new one ELSE throw an exception
    console.log('STEP 4');
    const paymentResponse = await this.paymentRepository.createFacture(payment);
    if (facture !== undefined) {
      if (facture.status === 'paid') {
        // STEP 5: update open search availability slot
        console.log('STEP 5');
        let datefrom = booking.date_from;
        let dateTo = booking.date_to;
        if (typeof datefrom !== 'string') {
          dateTo = dateTo.toString();
          datefrom = datefrom.toISOString();
        }
        if (typeof dateTo !== 'string') {
          dateTo = dateTo.toISOString();
        }
        await this._openSearchRepository.updateAvailabilitySlots?.(resource.code, datefrom, dateTo);

        // STEP 6: update booking status
        console.log('STEP 6');
        await this.bookingRepository.setState(booking, 'paid').catch(async () => {
          await this._openSearchRepository.deleteAvailabilitySlots?.(resource.code, datefrom.toString(), dateTo.toString());
        });

        // STEP 7: update availability slot
        console.log('STEP 7');
        await this.bookingRepository.updateAvailabilitySlotByResource(resourceCode, {
          start_date: startDate,
          end_date: startDate,
          state: 'booked',
          resource_id: resourceCode
        }).catch(async () => {
          await this._openSearchRepository.deleteAvailabilitySlots?.(resource.code, datefrom.toString(), dateTo.toString());
          await this.bookingRepository.setState(booking, 'pending');
        });

        return {
          bookingCode: paymentResponse.bookingCode,
          resourceCode: paymentResponse.resourceCode,
          method: paymentResponse.method,
          startDate: paymentResponse.startDate,
          endDate: paymentResponse.endDate,
          tenant: paymentResponse.tenant,
          userDni: paymentResponse.userDni,
          facture: {
            booking_code: paymentResponse.bookingCode,
            details: paymentResponse.details,
            reference: paymentResponse.id,
            total: paymentResponse.total,
            status: paymentResponse.status
          }
        };
      } else {
        throw new Exception('The facture status is not paid');
      }
    } else {
      throw new Exception('The facture not exists');
    }
  }
}
