export class FakeLogger {
  debug = jest.fn();
  error = jest.fn();
  log = jest.fn();
  verbose = jest.fn();
  warn = jest.fn();
}
