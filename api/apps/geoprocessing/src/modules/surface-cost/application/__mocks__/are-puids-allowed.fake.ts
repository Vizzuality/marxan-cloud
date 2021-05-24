import { Injectable } from '@nestjs/common';
import { ArePuidsAllowedPort } from '../../ports/pu-validator/are-puuids-allowed.port';

@Injectable()
export class ArePuidsAllowedFake implements ArePuidsAllowedPort {
  mock: jest.Mock<Promise<{ errors: unknown[] }>> = jest.fn();

  async validate(
    scenarioId: string,
    puIds: string[],
  ): Promise<{ errors: unknown[] }> {
    return this.mock(scenarioId, puIds);
  }
}
