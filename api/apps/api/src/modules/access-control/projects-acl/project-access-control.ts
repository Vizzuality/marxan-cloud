import { Permit } from '../access-control.types';
export abstract class ProjectAccessControl {
  abstract canCreateProject(userId: string): Promise<Permit>;
  abstract canEditProject(userId: string, projectId: string): Promise<Permit>;
  abstract canViewProject(userId: string, projectId: string): Promise<Permit>;
  abstract canPublishProject(
    userId: string,
    projectId: string,
  ): Promise<Permit>;
  abstract canDeleteProject(userId: string, projectId: string): Promise<Permit>;
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
