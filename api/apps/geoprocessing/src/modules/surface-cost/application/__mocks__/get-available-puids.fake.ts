import { Injectable } from '@nestjs/common';
import {
  GetAvailablePlanningUnits,
  PUWithArea,
} from '../../ports/available-planning-units/get-available-planning-units';

@Injectable()
export class GetAvailablePuidsFake implements GetAvailablePlanningUnits {
  mock: jest.Mock<Promise<{ ids: string[] }>> = jest.fn();
  getPUsWithAreaMock: jest.Mock<Promise<PUWithArea[]>> = jest.fn();
  getMaxPUAreaForScenarioMock: jest.Mock<Promise<number>> = jest.fn();

  get(scenarioId: string): Promise<{ ids: string[] }> {
    return this.mock(scenarioId);
  }

  getPUsWithArea(scenarioId: string): Promise<PUWithArea[]> {
    return this.getPUsWithAreaMock(scenarioId);
  }

  getMaxPUAreaForScenario(scenarioId: string): Promise<number> {
    return this.getMaxPUAreaForScenarioMock(scenarioId);
  }
}
