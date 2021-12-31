import { Injectable } from '@nestjs/common';
import { Either, left, right } from 'fp-ts/Either';
import {
  DoesntExist,
  doesntExist,
  HasPendingExport,
  hasPendingExport,
} from '@marxan-api/modules/scenarios/project-checker.service';

@Injectable()
export class ProjectCheckerFake {
  #projectsWithPendingExports: string[] = [];
  #projectsThatAreNotReady: string[] = [];

  async hasProjectPendingExports(
    projectId: string,
  ): Promise<Either<HasPendingExport, boolean>> {
    return this.#projectsWithPendingExports.includes(projectId)
      ? left(hasPendingExport)
      : right(false);
  }

  async isProjectReady(
    projectId: string,
  ): Promise<Either<DoesntExist, boolean>> {
    return this.#projectsThatAreNotReady.includes(projectId)
      ? left(doesntExist)
      : right(true);
  }

  addPendingExportForProject(projectId: string) {
    this.#projectsWithPendingExports.push(projectId);
  }
}
