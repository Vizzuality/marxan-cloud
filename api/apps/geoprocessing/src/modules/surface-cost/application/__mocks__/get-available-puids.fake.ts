import { Injectable } from '@nestjs/common';
import {
  GetAvailablePlanningUnits,
  PlanningUnitWithPuid,
  PUWithArea,
} from '../../ports/available-planning-units/get-available-planning-units';

@Injectable()
export class GetAvailablePuidsFake implements GetAvailablePlanningUnits {
  mock: jest.Mock<Promise<PlanningUnitWithPuid[]>> = jest.fn();
  getPUsWithAreaMock: jest.Mock<Promise<PUWithArea[]>> = jest.fn();
  getMaxPUAreaForScenarioMock: jest.Mock<Promise<number>> = jest.fn();

  get(scenarioId: string): Promise<PlanningUnitWithPuid[]> {
    return this.mock(scenarioId);
  }

  getPUsWithArea(scenarioId: string): Promise<PUWithArea[]> {
    return this.getPUsWithAreaMock(scenarioId);
  }

  getMaxPUAreaForScenario(scenarioId: string): Promise<number> {
    return this.getMaxPUAreaForScenarioMock(scenarioId);
  }
}
