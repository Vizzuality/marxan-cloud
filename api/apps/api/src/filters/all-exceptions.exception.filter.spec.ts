import { AllExceptionsFilter } from './all-exceptions.exception.filter';
import { ArgumentsHost, ConsoleLogger, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';

describe('AllExceptionFilter class spec (unit)', () => {
  let filter: AllExceptionsFilter;
  let argumentMock: jest.Mocked<ArgumentsHost>;
  let jsonMock: jest.Mock;

  beforeEach(async () => {
    const sandbox = await Test.createTestingModule({
      providers: [AllExceptionsFilter, ConsoleLogger],
    }).compile();
    sandbox.useLogger(false);
    filter = sandbox.get(AllExceptionsFilter);
    jsonMock = jest.fn();
    argumentMock = mockArgumentsHost(jsonMock);
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  it(`wraps http error`, async () => {
    // Act
    await filter.catch(
      new NotFoundException('Resource not found'),
      argumentMock,
    );

    // Asset
    responseStatus(jsonMock).toEqual(404);
    responseTitle(jsonMock).toEqual('Resource not found');
    responseMetaPath(jsonMock).toMatchInlineSnapshot(`"your-url"`);
  });
});

const responseStatus = (jsonMock: jest.Mock): jest.JestMatchers<any> =>
  expect(jsonMock.mock.calls[0][0].errors[0].status);

const responseTitle = (jsonMock: jest.Mock): jest.JestMatchers<any> =>
  expect(jsonMock.mock.calls[0][0].errors[0].title);

const responseMetaPath = (jsonMock: jest.Mock): jest.JestMatchers<any> =>
  expect(jsonMock.mock.calls[0][0].errors[0].meta.path);

const mockArgumentsHost: (
  jsonMock: jest.Mock,
  url?: string,
) => jest.Mocked<ArgumentsHost> = (jsonMock: jest.Mock, url = 'your-url') => ({
  switchToHttp: jest.fn().mockReturnValue({
    getResponse: jest.fn().mockReturnValue({
      status: jest.fn().mockReturnValue({
        header: jest.fn().mockReturnThis(),
        json: jsonMock,
      }),
    }),
    getRequest: jest.fn().mockReturnValue({
      url,
    }),
  }),
  getArgByIndex: jest.fn(),
  getArgs: jest.fn(),
  getType: jest.fn(),
  switchToRpc: jest.fn(),
  switchToWs: jest.fn(),
});
