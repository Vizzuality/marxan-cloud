import {
  DoesntExist,
  doesntExist,
  ProjectChecker,
} from '@marxan-api/modules/projects/project-checker/project-checker.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Either, isRight, left, right } from 'fp-ts/Either';
import { Repository } from 'typeorm';
import { Project } from '../../src/modules/projects/project.api.entity';
import { ScenarioChecker } from '../../src/modules/scenarios/scenario-checker/scenario-checker.service';

@Injectable()
export class ProjectCheckerFake implements ProjectChecker {
  private projectsWithPendingExports: string[];
  private projectsThatAreNotReady: string[];
  private projectsWithPendingImports: string[];

  constructor(
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
    private readonly scenarioChecker: ScenarioChecker,
  ) {
    this.projectsWithPendingExports = [];
    this.projectsThatAreNotReady = [];
    this.projectsWithPendingImports = [];
  }

  async hasPendingImports(
    projectId: string,
  ): Promise<Either<typeof doesntExist, boolean>> {
    const project = await this.projectRepo.findOne(projectId, {
      relations: ['scenarios'],
    });
    if (!project) return left(doesntExist);

    const projectPendingImport =
      this.projectsWithPendingImports.includes(projectId);

    if (!project.scenarios || projectPendingImport)
      return right(projectPendingImport);

    const results = await Promise.all(
      project.scenarios.map(async (scenario) => {
        const result = await this.scenarioChecker.hasPendingImport(scenario.id);
        return isRight(result) ? result.right : false;
      }),
    );

    return right(
      projectPendingImport ||
        results.some((scenarioPendingImport) => scenarioPendingImport),
    );
  }

  async hasPendingExports(
    projectId: string,
  ): Promise<Either<DoesntExist, boolean>> {
    const project = await this.projectRepo.findOne(projectId, {
      relations: ['scenarios'],
    });
    if (!project) return left(doesntExist);

    const projectPendingExport =
      this.projectsWithPendingExports.includes(projectId);

    if (!project.scenarios || projectPendingExport)
      return right(projectPendingExport);

    const results = await Promise.all(
      project.scenarios.map(async (scenario) => {
        const result = await this.scenarioChecker.hasPendingExport(scenario.id);
        return isRight(result) ? result.right : false;
      }),
    );

    return right(
      projectPendingExport ||
        results.some((scenarioPendingExport) => scenarioPendingExport),
    );
  }

  async hasPendingBlmCalibration(
    projectId: string,
  ): Promise<Either<DoesntExist, boolean>> {
    const project = await this.projectRepo.findOne(projectId, {
      relations: ['scenarios'],
    });
    if (!project) return left(doesntExist);

    if (!project.scenarios) return right(false);

    const results = await Promise.all(
      project.scenarios.map(async (scenario) => {
        const result = await this.scenarioChecker.hasPendingBlmCalibration(
          scenario.id,
        );
        return isRight(result) ? result.right : false;
      }),
    );

    return right(
      results.some((pendingBlmCalibration) => pendingBlmCalibration),
    );
  }

  async hasPendingMarxanRun(
    projectId: string,
  ): Promise<Either<DoesntExist, boolean>> {
    const project = await this.projectRepo.findOne(projectId, {
      relations: ['scenarios'],
    });
    if (!project) return left(doesntExist);

    if (!project.scenarios) return right(false);

    const results = await Promise.all(
      project.scenarios.map(async (scenario) => {
        const result = await this.scenarioChecker.hasPendingMarxanRun(
          scenario.id,
        );
        return isRight(result) ? result.right : false;
      }),
    );

    return right(results.some((pendingMarxanRun) => pendingMarxanRun));
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

  addPendingImportForProject(projectId: string) {
    this.projectsWithPendingImports.push(projectId);
  }

  clear() {
    this.projectsThatAreNotReady = [];
    this.projectsWithPendingExports = [];
    this.projectsWithPendingImports = [];
  }
}
