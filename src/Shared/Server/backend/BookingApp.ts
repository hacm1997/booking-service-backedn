import env from 'Shared/env';
import { Server } from '../servers/http.server';

export class BookingApp {
  private _server?: Server;

  async start (): Promise<void> {
    const port: string = env.PORT ?? '8080';
    this._server = new Server(port);
    return await this._server.listen();
  }

  async stop (): Promise<void> {
    await this._server?.stop();
  }
}
