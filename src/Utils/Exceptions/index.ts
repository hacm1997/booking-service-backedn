export class Exception extends Error {
  spanishMessage?: string;

  constructor (message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}
