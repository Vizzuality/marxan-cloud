import { Permit } from '@marxan-api/modules/access-control/access-control.service';

export interface IProjectAclService {
  canCreateProject(projectId: string, userId: string): Promise<Permit>;
  canViewProject(projectId: string, userId: string): Promise<Permit>;
  canPublishProject(projectId: string, userId: string): Promise<Permit>;
  canCreateScenario(projectId: string, userId: string): Promise<Permit>;
  canEditScenario(scenarioId: string, userId: string): Promise<Permit>;
  canViewSolutions(scenarioId: string, userId: string): Promise<Permit>;
}
