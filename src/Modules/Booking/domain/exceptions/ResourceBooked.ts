import { Exception } from 'utils/Exceptions';

export class ResourceBookedError extends Exception {
  constructor () {
    super('Resource is already booked');
  }
}
