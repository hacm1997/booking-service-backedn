import { Exception } from 'utils/Exceptions';

export class MustOneBookerError extends Exception {
  constructor () {
    super('Booking must have at least one booker');
  }
}
