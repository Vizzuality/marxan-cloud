import { AdjustPlanningUnitsInput } from './adjust-planning-units-input';
declare type Success = true;
export declare abstract class AdjustPlanningUnits {
    abstract update(scenarioId: string, constraints: AdjustPlanningUnitsInput): Promise<Success>;
}
export {};
