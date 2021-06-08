import { Injectable } from '@nestjs/common';
import { RequestJobInput, RequestJobPort } from '../request-job.port';

@Injectable()
export class RequestJobPortMock implements RequestJobPort {
  mock: jest.Mock<Promise<void>, [RequestJobInput]> = jest.fn();

  async queue(input: RequestJobInput): Promise<void> {
    return this.mock(input);
  }
}
