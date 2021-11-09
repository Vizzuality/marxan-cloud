export type Allowed = true;
export type Denied = false;

export type Permit = Allowed | Denied;

type Result = Promise<Permit>;

export abstract class AccessControlService {
  abstract canCreateProject(projectId: string, userId: string): Result;
  abstract canViewProject(projectId: string, userId: string): Result;
  abstract canPublishProject(projectId: string, userId: string): Result;
  abstract canCreateScenario(projectId: string, userId: string): Result;
  abstract canEditScenario(scenarioId: string, userId: string): Result;
  abstract canViewSolutions(scenarioId: string, userId: string): Result;
}
