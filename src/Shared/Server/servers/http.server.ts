import * as http from 'http';
import express from 'express';
import routes from '../routes';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import env from 'env/index';

export class Server {
  private readonly _port: string;
  private readonly _app: express.Application;
  private _httpServer?: http.Server;
  private readonly options: cors.CorsOptions = {
    allowedHeaders: [
      'Origin',
      'Cookie',
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Access-Control-Allow-Credentials',
      'Access-Control-Allow-Origin',
      'Access-Control-Allow-Headers',
      'Access-Control-Allow-Methods',
      'Access-Control-Request-Headers',
      'Access-Control-Request-Method',
      'X-Forwarded-For',
      'X-Forwarded-Host',
      'X-Forwarded-Proto',
      'XSRF-TOKEN',
      'X-XSRF-TOKEN',
      'X-HTTP-Method-Override',
      'X-HTTP-Method',
      'xsrfCookie'
    ],
    credentials: true,
    methods: 'GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE',
    origin: [...env.frontend_urls],
    preflightContinue: false,
    exposedHeaders: ['set-cookie']
  };

  constructor (port: string) {
    this._port = port;
    this._app = express();
    this._app.use(cors(this.options));
    this._app.use(cookieParser());
    this._app.use(express.json());
    this._app.use(routes);
  }

  async listen (): Promise<void> {
    return await new Promise(resolve => {
      this._httpServer = this._app.listen(this._port, () => {
        console.log(`Server listening on port ${this._port}`);
        resolve();
      });
    });
  }

  async stop (): Promise<void> {
    return await new Promise((resolve, reject) => {
      this._httpServer?.close((error) => {
        if (error != null) {
          console.error(error);
          return reject(error);
        };
        console.log(`Server ${this._port} stopped`);
        return resolve();
      });
    });
  }
}
