import { ResourceRepository } from 'Modules/Resources/domain/repositories/Resource';
import { Exception } from 'utils/Exceptions';
import { ResourceBookedError } from '../exceptions/ResourceBooked';
import { BookingRepository } from '../repositories/Booking';

type StepFunctions = (resourceId: string, startDate: string, endDate: string, dni: string) => Promise<never>;

interface Steps {
  step1: StepFunctions
  step2: StepFunctions
  step4: StepFunctions
  step5: StepFunctions
  step6: StepFunctions
  step7: StepFunctions
  finally: StepFunctions
};

export class ResetBookingProcess {
  private readonly _bookingRepository: BookingRepository;
  private readonly _openSearchRepository: Partial<ResourceRepository>;

  constructor (bookingRepository: BookingRepository, openSearchRepository: Partial<ResourceRepository>) {
    this._bookingRepository = bookingRepository;
    this._openSearchRepository = openSearchRepository;
  }

  private readonly deleteAvailabilitySlotByResource = async (resourceId: string, startDate: string, endDate: string): Promise<void> => {
    await this._bookingRepository.deleteAvailabilitySlotByResource(resourceId, startDate, endDate).then((result) => {
      if (result === undefined) {
        throw new Exception('Error deleting availability');
      }
    });
  };

  private readonly deleteAvailabilitySlotByResourceInOpenSearch = async (resourceId: string, startDate: string, endDate: string): Promise<void> => {
    await this._openSearchRepository.deleteAvailabilitySlots?.(resourceId, startDate, endDate).then((result) => {
      if (result === undefined) {
        throw new Exception('Error deleting availability slots in os');
      }
    });
  };

  private readonly deleteBooking = async (dni: string, startDate: string): Promise<void> => {
    await this._bookingRepository.delete(dni, startDate).catch(() => { throw new Exception('Error deleting booking'); });
  };

  steps: Steps = {
    step1: () => { throw new Exception('Resource not found'); },
    step2: () => { throw new ResourceBookedError(); },
    step4: () => { throw new Exception('Error creating/updating user'); },
    step5: () => { throw new Exception('Error updating availability slots'); },
    step6: async (resourceId: string, startDate: string, endDate: string) => {
      await this.deleteAvailabilitySlotByResource(resourceId, startDate, endDate);
      throw new Exception('Error updating availability slots on os');
    },
    step7: async (resourceId: string, startDate: string, endDate: string) => {
      await this.deleteAvailabilitySlotByResource(resourceId, startDate, endDate);
      await this.deleteAvailabilitySlotByResourceInOpenSearch(resourceId, startDate, endDate);
      throw new Exception('Error updating availability slots on os');
    },
    finally: async (resourceId: string, startDate: string, endDate: string, dni: string) => {
      await this.deleteAvailabilitySlotByResource(resourceId, startDate, endDate);
      await this.deleteAvailabilitySlotByResourceInOpenSearch(resourceId, startDate, endDate);
      await this.deleteBooking(dni, startDate);
      throw new Exception('Error returning booking');
    }
  };

  async run (step: keyof Steps, resourceId?: string, startDate?: string, endDate?: string, dni?: string): Promise<void> {
    await this.steps[step](resourceId ?? '', startDate ?? '', endDate ?? '', dni ?? '');
  }
}
