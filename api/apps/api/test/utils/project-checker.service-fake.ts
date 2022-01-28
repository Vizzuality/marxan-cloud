import {
  DoesntExist,
  doesntExist,
  ProjectChecker,
} from '@marxan-api/modules/projects/project-checker/project-checker.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Either, left, right } from 'fp-ts/Either';
import { Repository } from 'typeorm';
import { Project } from '../../src/modules/projects/project.api.entity';

@Injectable()
export class ProjectCheckerFake implements ProjectChecker {
  private projectsWithPendingExports: string[];
  private projectsWithPendingBlmCalibration: string[];
  private projectsWithPendingMarxanRun: string[];
  private projectsThatAreNotReady: string[];
  private projectsWithPendingImports: string[];

  constructor(
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
  ) {
    this.projectsWithPendingExports = [];
    this.projectsWithPendingBlmCalibration = [];
    this.projectsWithPendingMarxanRun = [];
    this.projectsThatAreNotReady = [];
    this.projectsWithPendingImports = [];
  }
  async hasPendingImports(
    projectId: string,
  ): Promise<Either<typeof doesntExist, boolean>> {
    const project = await this.projectRepo.findOne(projectId);
    if (!project) return left(doesntExist);

    return right(this.projectsWithPendingImports.includes(projectId));
  }

  async hasPendingExports(
    projectId: string,
  ): Promise<Either<DoesntExist, boolean>> {
    const project = await this.projectRepo.findOne(projectId);
    if (!project) return left(doesntExist);

    return right(this.projectsWithPendingExports.includes(projectId));
  }

  async hasPendingBlmCalibration(
    projectId: string,
  ): Promise<Either<DoesntExist, boolean>> {
    const project = await this.projectRepo.findOne(projectId);
    if (!project) return left(doesntExist);

    return right(this.projectsWithPendingBlmCalibration.includes(projectId));
  }

  async hasPendingMarxanRun(
    projectId: string,
  ): Promise<Either<DoesntExist, boolean>> {
    const project = await this.projectRepo.findOne(projectId);
    if (!project) return left(doesntExist);

    return right(this.projectsWithPendingMarxanRun.includes(projectId));
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

  addPendingImportsForProject(projectId: string) {
    this.projectsWithPendingImports.push(projectId);
  }

  addPendingBlmCalibrationForProject(projectId: string) {
    this.projectsWithPendingBlmCalibration.push(projectId);
  }

  addPendingMarxanRunForProject(projectId: string) {
    this.projectsWithPendingMarxanRun.push(projectId);
  }

  clear() {
    this.projectsThatAreNotReady = [];
    this.projectsWithPendingExports = [];
    this.projectsWithPendingBlmCalibration = [];
    this.projectsWithPendingMarxanRun = [];
    this.projectsWithPendingImports = [];
  }
}
