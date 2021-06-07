import { Injectable } from '@nestjs/common';
import { GetAvailablePlanningUnits } from '../../ports/available-planning-units/get-available-planning-units';

@Injectable()
export class GetAvailablePuidsFake implements GetAvailablePlanningUnits {
  mock: jest.Mock<Promise<{ ids: string[] }>> = jest.fn();

  get(scenarioId: string): Promise<{ ids: string[] }> {
    return this.mock(scenarioId);
  }
}
