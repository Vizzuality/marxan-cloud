import { EventEmitter } from 'events';
import { QueueEventsBuilder } from './queue-events.builder';
import { Logger } from '@nestjs/common';

jest.mock('bullmq', () => {
  const mockClient = new EventEmitter();
  const mockQueueEvents = Object.assign(new EventEmitter(), {
    client: Promise.resolve(mockClient),
    close: jest.fn().mockResolvedValue(undefined),
    disconnect: jest.fn().mockResolvedValue(undefined),
  });

  return {
    QueueEvents: jest.fn().mockImplementation(() => mockQueueEvents),
    __mockQueueEvents: mockQueueEvents,
    __mockClient: mockClient,
  };
});

const {
  QueueEvents,
  __mockQueueEvents: mockQueueEvents,
  __mockClient: mockClient,
} = jest.requireMock('bullmq');

describe('QueueEventsBuilder', () => {
  let builder: QueueEventsBuilder;
  const queueOptions = { connection: { host: 'localhost', port: 6379 } };

  beforeEach(() => {
    jest.clearAllMocks();
    mockQueueEvents.removeAllListeners();
    mockClient.removeAllListeners();
    builder = new QueueEventsBuilder(queueOptions as any);
  });

  it('should create QueueEvents with the given name and options', () => {
    builder.buildQueueEvents('test-queue');
    expect(QueueEvents).toHaveBeenCalledWith('test-queue', queueOptions);
  });

  it('should throw if buildQueueEvents is called twice', () => {
    builder.buildQueueEvents('test-queue');
    expect(() => builder.buildQueueEvents('test-queue')).toThrow(
      'Queue Events is already created!',
    );
  });

  it('should register an error handler on QueueEvents', () => {
    const loggerSpy = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation();

    builder.buildQueueEvents('test-queue');
    mockQueueEvents.emit('error', new Error('test error'));

    expect(loggerSpy).toHaveBeenCalledWith(
      'QueueEvents "test-queue" error: test error',
      expect.any(String),
    );
    loggerSpy.mockRestore();
  });

  describe('Redis client connection event logging', () => {
    let logSpy: jest.SpyInstance;
    let warnSpy: jest.SpyInstance;
    let errorSpy: jest.SpyInstance;

    beforeEach(async () => {
      logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
      warnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
      errorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();

      builder.buildQueueEvents('test-queue');
      await new Promise((resolve) => process.nextTick(resolve));
    });

    afterEach(() => {
      logSpy.mockRestore();
      warnSpy.mockRestore();
      errorSpy.mockRestore();
    });

    it('should log on connect', () => {
      mockClient.emit('connect');
      expect(logSpy).toHaveBeenCalledWith(
        'QueueEvents "test-queue": connected',
      );
    });

    it('should log on ready', () => {
      mockClient.emit('ready');
      expect(logSpy).toHaveBeenCalledWith('QueueEvents "test-queue": ready');
    });

    it('should warn on close', () => {
      mockClient.emit('close');
      expect(warnSpy).toHaveBeenCalledWith(
        'QueueEvents "test-queue": connection closed',
      );
    });

    it('should warn on reconnecting', () => {
      mockClient.emit('reconnecting');
      expect(warnSpy).toHaveBeenCalledWith(
        'QueueEvents "test-queue": reconnecting',
      );
    });

    it('should error on end', () => {
      mockClient.emit('end');
      expect(errorSpy).toHaveBeenCalledWith(
        'QueueEvents "test-queue": connection ended',
      );
    });
  });

  describe('onModuleDestroy', () => {
    it('should close and disconnect QueueEvents', async () => {
      builder.buildQueueEvents('test-queue');
      await builder.onModuleDestroy();
      expect(mockQueueEvents.close).toHaveBeenCalled();
      expect(mockQueueEvents.disconnect).toHaveBeenCalled();
    });

    it('should do nothing if no QueueEvents was built', async () => {
      await builder.onModuleDestroy();
      expect(mockQueueEvents.close).not.toHaveBeenCalled();
    });
  });
});
