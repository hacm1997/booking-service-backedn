import { createLogger, transports, format, Logger } from 'winston';
import { ILogger } from './logger.interface';

export class LoggerService implements ILogger {
  public logger: Logger;

  constructor () {
    this.logger = createLogger({
      transports: [new transports.Console()],
      format: format.combine(
        format.timestamp(),
        format.printf(
          ({ level, message, timestamp }) => `${timestamp as string} ${level}: ${message as string}`
        )
      )
    });
  }

  log (message: string): void {
    this.logger.info(message);
  }

  error (message: string): void {
    this.logger.error(message);
  }

  warn (message: string): void {
    this.logger.warn(message);
  }

  debug (message: string): void {
    this.logger.debug(message);
  }
}
