import { AdjustPlanningUnitsInput } from './adjust-planning-units-input';

export abstract class AdjustPlanningUnits {
  abstract update(
    scenarioId: string,
    constraints: AdjustPlanningUnitsInput,
  ): Promise<void>;
}
