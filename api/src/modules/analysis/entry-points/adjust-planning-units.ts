import { AdjustPlanningUnitsInput } from './adjust-planning-units-input';

type Success = true;

export abstract class AdjustPlanningUnits {
  abstract update(
    scenarioId: string,
    constraints: AdjustPlanningUnitsInput,
  ): Promise<Success>;
}
