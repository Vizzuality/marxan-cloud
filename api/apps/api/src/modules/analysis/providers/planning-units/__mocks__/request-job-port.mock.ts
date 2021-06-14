import { Injectable } from '@nestjs/common';
import { JobInput } from '@marxan-jobs/planning-unit-geometry';
import { RequestJobPort } from '../request-job.port';

@Injectable()
export class RequestJobPortMock implements RequestJobPort {
  mock: jest.Mock<Promise<void>, [JobInput]> = jest.fn();

  async queue(input: JobInput): Promise<void> {
    return this.mock(input);
  }
}
