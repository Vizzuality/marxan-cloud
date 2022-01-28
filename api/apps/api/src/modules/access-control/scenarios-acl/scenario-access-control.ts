import { Permit } from '@marxan-api/modules/access-control/access-control.types';
export abstract class ScenarioAccessControl {
  abstract canEditScenario(scenarioId: string, userId: string): Promise<Permit>;
  abstract canViewScenario(scenarioId: string, userId: string): Promise<Permit>;
  abstract canDeleteScenario(
    scenarioId: string,
    userId: string,
  ): Promise<Permit>;
  abstract canCreateScenario(
    userId: string,
    projectId: string,
  ): Promise<Permit>;
  abstract canCloneScenario(userId: string, projectId: string): Promise<Permit>;
}
