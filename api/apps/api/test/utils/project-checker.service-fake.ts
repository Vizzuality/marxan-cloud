import { Injectable } from '@nestjs/common';
import { Either, left, right } from 'fp-ts/Either';
import {
  DoesntExist,
  doesntExist,
  HasPendingExport,
  hasPendingExport,
  ProjectChecker,
} from '@marxan-api/modules/projects/project-checker/project-checker.service';

@Injectable()
export class ProjectCheckerFake implements ProjectChecker {
  private projectsWithPendingExports: string[];
  private projectsThatAreNotReady: string[];

  constructor() {
    this.projectsWithPendingExports = [];
    this.projectsThatAreNotReady = [];
  }

  async hasPendingExports(
    projectId: string,
  ): Promise<Either<HasPendingExport, boolean>> {
    return this.projectsWithPendingExports.includes(projectId)
      ? left(hasPendingExport)
      : right(false);
  }

  async isProjectReady(
    projectId: string,
  ): Promise<Either<DoesntExist, boolean>> {
    return this.projectsThatAreNotReady.includes(projectId)
      ? left(doesntExist)
      : right(true);
  }

  addPendingExportForProject(projectId: string) {
    this.projectsWithPendingExports.push(projectId);
  }
}
