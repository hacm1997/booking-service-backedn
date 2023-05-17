import { GuestDetails } from './Details';

export class Guest {
  private readonly _id: string;
  private readonly _name: string;
  private readonly _email: string;
  private readonly _cellphone: string;
  private _details?: GuestDetails[];

  constructor (id: string, name: string, email: string, cellphone: string, details?: GuestDetails[]) {
    this._id = id;
    this._name = name;
    this._email = email;
    this._cellphone = cellphone;
    this._details = details;
  }

  get id (): string {
    return this._id;
  }

  get name (): string {
    return this._name;
  }

  get email (): string {
    return this._email;
  }

  get cellphone (): string {
    return this._cellphone;
  }

  get details (): GuestDetails[] | undefined {
    return this._details;
  }

  set details (details: GuestDetails[] | undefined) {
    this._details = details;
  }
}
