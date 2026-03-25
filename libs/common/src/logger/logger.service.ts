import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class LoggerService {
  logger: Logger;

  constructor() {
    this.logger = new Logger(LoggerService.name);
  }

  log(message: string) {
    this.logger.log(message);
  }

  error(message: string) {
    this.logger.error(message);
  }

  warn(message: string) {
    this.logger.warn(message);
  }
}
