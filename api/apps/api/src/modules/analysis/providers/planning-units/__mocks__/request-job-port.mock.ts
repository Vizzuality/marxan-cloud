import { Injectable } from '@nestjs/common';
import { RequestJobInput, RequestJobPort } from '../request-job.port';
import { AsyncJob } from '../../../async-job';

@Injectable()
export class RequestJobPortMock implements RequestJobPort {
  mock: jest.Mock<Promise<AsyncJob>, [RequestJobInput]> = jest.fn();

  async queue(input: RequestJobInput): Promise<AsyncJob> {
    return this.mock(input);
  }
}
