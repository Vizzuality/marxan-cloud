import { Injectable } from '@nestjs/common';
import {
  GetAvailablePlanningUnits,
  PlanningUnitWithPuid,
} from '../../ports/available-planning-units/get-available-planning-units';

@Injectable()
export class GetAvailablePuidsFake implements GetAvailablePlanningUnits {
  mock: jest.Mock<Promise<PlanningUnitWithPuid[]>> = jest.fn();

  get(scenarioId: string): Promise<PlanningUnitWithPuid[]> {
    return this.mock(scenarioId);
  }
}
