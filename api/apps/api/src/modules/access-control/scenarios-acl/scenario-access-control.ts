import { Permit } from '../access-control.types';
export abstract class ScenarioAccessControl {
  abstract canEditScenario(scenarioId: string, userId: string): Promise<Permit>;
  abstract canViewScenario(scenarioId: string, userId: string): Promise<Permit>;
  abstract canDeleteScenario(
    scenarioId: string,
    userId: string,
  ): Promise<Permit>;
  abstract canCreateSolution(
    userId: string,
    projectId: string,
  ): Promise<Permit>;
}
