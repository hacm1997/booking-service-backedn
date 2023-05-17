import { Booking } from '@Booking/domain/entities/Booking';
import { ResourceBookedError } from '@Booking/domain/exceptions/ResourceBooked';
import { BookingRepository } from '@Booking/domain/repositories/Booking';
import { AlreadyBooked } from '@Booking/domain/services/AlreadyBooked';
import { MapperBookingDomainDto } from '@Booking/mappers/booking/DomainDto';
import { ResourceRepository } from '@Resources/domain/repositories/Resource';
import { ResetBookingProcess } from 'Modules/Booking/domain/services/ResetBookingProcess';
import { createUserController } from 'Modules/Users/controllers/create';
import { Exception } from 'utils/Exceptions';
import { BookingDto } from '../dto/booking';

export class CreateBookingUseCase {
  private readonly _bookingRepository: BookingRepository;
  private readonly _resourceRepository: ResourceRepository;
  private readonly _openSearchRepository: Partial<ResourceRepository>;
  private readonly _mapper = new MapperBookingDomainDto();
  private readonly resetProcess: ResetBookingProcess;

  constructor (bookingRepository: BookingRepository, resourceRepository: ResourceRepository, openSearchRepository: Partial<ResourceRepository>) {
    this._bookingRepository = bookingRepository;
    this._resourceRepository = resourceRepository;
    this._openSearchRepository = openSearchRepository;
    this.resetProcess = new ResetBookingProcess(this._bookingRepository, this._resourceRepository);
  }

  async run (booking: BookingDto, tenant: any): Promise<BookingDto | undefined> {
    const resource = await this._resourceRepository.get(booking.booking.resource_code);
    console.log(resource);
    if (resource.code === '') {
      await this.resetProcess.run('step1');
    }
    const bookignDomain: Booking = this._mapper.from(booking, tenant, resource);
    // check if the dates of booking are available in the resource durationAvailable
    const dateFromBooking = new Date(bookignDomain.date_from);
    const dateToBooking = new Date(bookignDomain.date_to);
    const durationAvailable = resource.durationAvailable;
    if (durationAvailable !== undefined) {
      const durationAvailableDate = new Date(durationAvailable);
      if (dateFromBooking < durationAvailableDate || dateToBooking < durationAvailableDate) {
        throw new Exception('The dates of booking are not available in the resource durationAvailable');
      }
    }
    // STEP 2: Check if the resource is already booked
    const alreadyBooked = new AlreadyBooked(this._bookingRepository);
    const isAlreadyBooked = await alreadyBooked.run(booking.booking.resource_code, new Date(bookignDomain.date_from));
    if (isAlreadyBooked) {
      await this.resetProcess.run('step2');
    }
    // STEP 3: Check if the resource is already booked in the availability slots
    const availabilitySlots = await this._bookingRepository.getAvailabilitySlotsByResource(booking.booking.resource_code, new Date(bookignDomain.date_from).toISOString());
    const dateFrom = new Date(bookignDomain.date_from);
    const dateTo = new Date(bookignDomain.date_to);
    availabilitySlots.forEach((slot) => {
      const slotStartDate = new Date(slot.start_date);
      const slotEndDate = new Date(slot.end_date);
      if (dateFrom >= slotStartDate && dateFrom <= slotEndDate && slot.state === 'booked') {
        throw new ResourceBookedError();
      } else if (dateTo >= slotStartDate && dateTo <= slotEndDate && slot.state === 'booked') {
        throw new ResourceBookedError();
      }
    });

    // TODO: STEP 4: Save the user
    await createUserController(booking.user, tenant).catch(async () => await this.resetProcess.run('step4'));
    // STEP 5: uPDATE AVAILABILITY
    if (bookignDomain.state === 'paid') {
      await this._bookingRepository.createAvailabilitySlotByResource(booking.booking.resource_code, {
        start_date: new Date(bookignDomain.date_from).toISOString(),
        end_date: new Date(bookignDomain.date_to).toISOString(),
        state: 'booked',
        resource_id: resource.code,
        details: JSON.stringify({
          booking_id: bookignDomain.code,
          tenant_id: tenant,
          user_id: bookignDomain.booker?.id
        }),
        id: `AvailabilitySlot#${resource.code}#${new Date(bookignDomain.date_from).toISOString()}#${new Date(bookignDomain.date_to).toISOString()}`
      }).catch(async () => await this.resetProcess.run('step5'));
      // STEP 6: update open search slots
      await this._openSearchRepository.updateAvailabilitySlots?.(resource.code, booking.booking.start_date, booking.booking.end_date).catch(async () => await this.resetProcess.run('step6', resource.code, booking.booking.start_date, booking.booking.end_date));
      // STEP 7: Create the booking document in dynamodb
      const bookingCreated = await this._bookingRepository.create(bookignDomain).catch(async () => await this.resetProcess.run('step7', resource.code, booking.booking.start_date, booking.booking.end_date));
      try {
        if (bookingCreated === undefined) throw new Exception('Error creating the booking');
        const bookingDTO = this._mapper.to(bookingCreated);
        return bookingDTO;
      } catch (error) {
        await this.resetProcess.run('finally', resource.code, booking.booking.start_date, booking.booking.end_date, booking.user.dni);
      }
    } else if (bookignDomain.state === 'pending') {
      const bookingCreated = await this._bookingRepository.create(bookignDomain).catch(async () => await this.resetProcess.run('step7', resource.code, booking.booking.start_date, booking.booking.end_date));
      try {
        if (bookingCreated === undefined) throw new Exception('Error creating the booking');
        const bookingDTO = this._mapper.to(bookingCreated);
        return bookingDTO;
      } catch (error) {
        await this.resetProcess.run('finally', resource.code, booking.booking.start_date, booking.booking.end_date, booking.user.dni);
      }
    } else {
      throw new ResourceBookedError();
    }
  }
}
