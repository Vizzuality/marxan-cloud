import { AllExceptionsFilter } from './all-exceptions.exception.filter';
import { HttpException, ArgumentsHost } from '@nestjs/common';
import * as JSONAPISerializer from 'jsonapi-serializer';
import { after } from 'lodash';
jest.mock('jsonapi-serializer');

afterEach(() => {
  jest.clearAllMocks();
});
describe('AllExceptionFilter class spec (unit)', () => {
  const allExceptionsFilter = new AllExceptionsFilter();
  it('should be defined', () => {
    expect(new AllExceptionsFilter()).toBeDefined();
  });
  it('should call Andoni to help', () => {
    (JSONAPISerializer as jest.Mock).mockReturnValue({});

    const exceptionMock = ({
      getStatus: jest.fn(() => 500),
      message: 'Mock Message',
    } as unknown) as HttpException;

    const responseMock = {
      status: jest.fn(function () {
        return this;
      }),
      json: jest.fn(),
    };

    const hostMock = {
      switchToHttp: () => {
        return {
          getResponse: () => responseMock,
          getRequest: () => {
            return { url: 1 };
          },
        };
      },
    } as ArgumentsHost;
    allExceptionsFilter.catch(exceptionMock, hostMock);
    expect(responseMock.json).toHaveBeenCalledWith({ erros: [{}] });
  });
});
