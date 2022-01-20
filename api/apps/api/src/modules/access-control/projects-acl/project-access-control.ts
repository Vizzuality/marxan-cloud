import { Permit } from '@marxan-api/modules/access-control/access-control.types';
export abstract class ProjectAccessControl {
  abstract canCreateProject(userId: string): Promise<Permit>;
  abstract canEditProject(userId: string, projectId: string): Promise<Permit>;
  abstract canViewProject(userId: string, projectId: string): Promise<Permit>;
  abstract canPublishProject(
    userId: string,
    projectId: string,
  ): Promise<Permit>;
  abstract canDeleteProject(userId: string, projectId: string): Promise<Permit>;
  abstract canExportProject(userId: string, projectId: string): Promise<Permit>;
}
