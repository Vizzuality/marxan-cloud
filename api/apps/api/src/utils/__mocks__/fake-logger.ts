import { LoggerService } from '@nestjs/common';

export class FakeLogger implements LoggerService {
  constructor(public readonly context?: string) {}

  debug = jest.fn();
  error = jest.fn();
  log = jest.fn();
  verbose = jest.fn();
  warn = jest.fn();
}
