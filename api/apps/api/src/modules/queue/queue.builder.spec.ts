import { EventEmitter } from 'events';
import { QueueBuilder } from './queue.builder';
import { Logger } from '@nestjs/common';

jest.mock('bullmq', () => {
  const mockClient = new EventEmitter();
  const mockQueue = Object.assign(new EventEmitter(), {
    client: Promise.resolve(mockClient),
    close: jest.fn().mockResolvedValue(undefined),
    disconnect: jest.fn().mockResolvedValue(undefined),
  });

  return {
    Queue: jest.fn().mockImplementation(() => mockQueue),
    __mockQueue: mockQueue,
    __mockClient: mockClient,
  };
});

const { Queue, __mockQueue: mockQueue, __mockClient: mockClient } =
  jest.requireMock('bullmq');

describe('QueueBuilder', () => {
  let builder: QueueBuilder;
  const queueOptions = { connection: { host: 'localhost', port: 6379 } };

  beforeEach(() => {
    jest.clearAllMocks();
    mockQueue.removeAllListeners();
    mockClient.removeAllListeners();
    builder = new QueueBuilder(queueOptions as any);
  });

  it('should create a Queue with the given name and options', () => {
    builder.buildQueue('test-queue');
    expect(Queue).toHaveBeenCalledWith('test-queue', queueOptions);
  });

  it('should throw if buildQueue is called twice', () => {
    builder.buildQueue('test-queue');
    expect(() => builder.buildQueue('test-queue')).toThrow(
      'Queue is already created!',
    );
  });

  it('should register an error handler on the queue', () => {
    const loggerSpy = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation();

    builder.buildQueue('test-queue');
    mockQueue.emit('error', new Error('test error'));

    expect(loggerSpy).toHaveBeenCalledWith(
      'Queue "test-queue" error: test error',
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

      builder.buildQueue('test-queue');
      // Allow the .client.then() callback to execute
      await new Promise((resolve) => process.nextTick(resolve));
    });

    afterEach(() => {
      logSpy.mockRestore();
      warnSpy.mockRestore();
      errorSpy.mockRestore();
    });

    it('should log on connect', () => {
      mockClient.emit('connect');
      expect(logSpy).toHaveBeenCalledWith('Queue "test-queue": connected');
    });

    it('should log on ready', () => {
      mockClient.emit('ready');
      expect(logSpy).toHaveBeenCalledWith('Queue "test-queue": ready');
    });

    it('should warn on close', () => {
      mockClient.emit('close');
      expect(warnSpy).toHaveBeenCalledWith(
        'Queue "test-queue": connection closed',
      );
    });

    it('should warn on reconnecting', () => {
      mockClient.emit('reconnecting');
      expect(warnSpy).toHaveBeenCalledWith(
        'Queue "test-queue": reconnecting',
      );
    });

    it('should error on end', () => {
      mockClient.emit('end');
      expect(errorSpy).toHaveBeenCalledWith(
        'Queue "test-queue": connection ended',
      );
    });
  });

  describe('onModuleDestroy', () => {
    it('should close and disconnect the queue', async () => {
      builder.buildQueue('test-queue');
      await builder.onModuleDestroy();
      expect(mockQueue.close).toHaveBeenCalled();
      expect(mockQueue.disconnect).toHaveBeenCalled();
    });

    it('should do nothing if no queue was built', async () => {
      await builder.onModuleDestroy();
      expect(mockQueue.close).not.toHaveBeenCalled();
    });
  });
});
