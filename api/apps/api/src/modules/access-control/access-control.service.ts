import { Injectable } from '@nestjs/common';

import { ProjectAclService } from '@marxan-api/modules/projects-acl';

export type Allowed = true;
export type Denied = false;
export type Permit = Allowed | Denied;

@Injectable()
export class AccessControlService {
  constructor(private readonly projectAcl: ProjectAclService) {}

  canCreateProject(projectId: string, userId: string): Promise<Permit> {
    return this.projectAcl.canCreateProject(projectId, userId);
  }

  canViewProject(projectId: string, userId: string): Promise<Permit> {
    return this.projectAcl.canViewProject(projectId, userId);
  }

  canPublishProject(projectId: string, userId: string): Promise<Permit> {
    return this.projectAcl.canPublishProject(projectId, userId);
  }

  canCreateScenario(projectId: string, userId: string): Promise<Permit> {
    return this.projectAcl.canCreateScenario(projectId, userId);
  }

  canEditScenario(scenarioId: string, userId: string): Promise<Permit> {
    return this.projectAcl.canEditScenario(scenarioId, userId);
  }

  canViewSolutions(scenarioId: string, userId: string): Promise<Permit> {
    return this.projectAcl.canViewSolutions(scenarioId, userId);
  }
}
