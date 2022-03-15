import { Injectable } from '@nestjs/common';
import { ArePuidsAllowedPort } from '../are-puids-allowed.port';

@Injectable()
export class ArePuidsAllowedMock implements ArePuidsAllowedPort {
  mock: jest.Mock<Promise<{ errors: string[] }>, [string, string[]]> =
    jest.fn();

  async validate(
    scenarioId: string,
    puIds: string[],
  ): Promise<{ errors: unknown[] }> {
    return this.mock(scenarioId, puIds);
  }
}
