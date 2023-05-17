import { Resource } from '@Resources/domain/entities/Resource';
import { Guest } from '@Users/domain/entities/Guest';
import { json } from 'utils/json.interface';
import { MustOneBookerError } from '../exceptions/MustOneBooker';

export interface BookingProps {
  id: string
  sk?: string
  code: string
  calendar_block_id?: string
  date_from: string | Date
  date_to: string | Date
  bookingDetails?: json
  booker?: Guest
  bookers?: Guest[]
  state?: string
  resource: Resource | Partial<Resource>
}

export class Booking {
  private readonly _props: BookingProps;

  constructor (props: BookingProps) {
    if (props.booker === undefined && props.bookers === undefined) {
      throw new MustOneBookerError();
    }
    this._props = props;
  }

  get id (): string {
    return this._props.id;
  }

  get calendar_block_id (): string | undefined {
    return this._props.calendar_block_id;
  }

  get date_from (): string | Date {
    return this._props.date_from;
  }

  get date_to (): string | Date {
    return this._props.date_to;
  }

  get booker (): Guest | undefined {
    return this._props.booker;
  }

  get bookers (): Guest[] | undefined {
    return this._props.bookers;
  }

  get resource (): Partial<Resource> {
    return this._props.resource;
  }

  get bookingDetails (): json | undefined {
    return this._props.bookingDetails;
  }

  get state (): string | undefined {
    return this._props.state;
  }

  get sk (): string | undefined {
    return this._props.sk;
  }

  get code (): string {
    return this._props.code;
  }
}
