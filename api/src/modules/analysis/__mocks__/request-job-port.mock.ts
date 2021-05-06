import { Injectable } from '@nestjs/common';
import { AsyncJob } from '../async-job';
import { RequestJobInput, RequestJobPort } from '../request-job.port';

@Injectable()
export class RequestJobPortMock implements RequestJobPort {
  mock: jest.Mock<Promise<AsyncJob>, [RequestJobInput]> = jest.fn();

  async queue(input: RequestJobInput): Promise<AsyncJob> {
    return this.mock(input);
  }
}
