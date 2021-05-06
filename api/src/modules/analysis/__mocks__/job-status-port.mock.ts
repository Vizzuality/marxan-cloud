import { Injectable } from '@nestjs/common';
import { AsyncJob } from '../async-job';
import { JobStatusPort } from '../job-status.port';

@Injectable()
export class JobStatusPortMock implements JobStatusPort {
  mock: jest.Mock<Promise<AsyncJob>, [string]> = jest.fn();

  async scenarioStatus(scenarioId: string): Promise<AsyncJob> {
    return this.mock(scenarioId);
  }
}
