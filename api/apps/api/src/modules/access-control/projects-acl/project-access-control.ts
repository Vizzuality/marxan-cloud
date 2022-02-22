import { Either } from 'fp-ts/lib/Either';
import { Permit } from '@marxan-api/modules/access-control/access-control.types';
import { forbiddenError } from '@marxan-api/modules/access-control';
import { ScenarioLockResultPlural } from '@marxan-api/modules/access-control/scenarios-acl/locks/dto/scenario.lock.dto';

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
  abstract canDownloadProjectExport(
    userId: string,
    projectId: string,
  ): Promise<Permit>;
  abstract findAllLocks(
    userId: string,
    projectId: string,
  ): Promise<Either<typeof forbiddenError, ScenarioLockResultPlural>>;
}
