export type Allowed = true;
export type Denied = false;
export type Permit = Allowed | Denied;

export abstract class ProjectAccessControl {
  abstract canCreateProject(userId: string, projectId: string): Promise<Permit>;
  abstract canViewProject(userId: string, projectId: string): Promise<Permit>;
  abstract canPublishProject(
    userId: string,
    projectId: string,
  ): Promise<Permit>;
  abstract canCreateScenario(
    userId: string,
    projectId: string,
  ): Promise<Permit>;
  abstract canEditScenario(scenarioId: string, userId: string): Promise<Permit>;
  abstract canViewSolutions(
    scenarioId: string,
    userId: string,
  ): Promise<Permit>;
}
