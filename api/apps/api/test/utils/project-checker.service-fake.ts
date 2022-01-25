import { Injectable } from '@nestjs/common';
import { Either, left, right } from 'fp-ts/Either';
import {
  DoesntExist,
  doesntExist,
  ProjectChecker,
} from '@marxan-api/modules/projects/project-checker/project-checker.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from '../../src/modules/projects/project.api.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProjectCheckerFake implements ProjectChecker {
  private projectsWithPendingExports: string[];
  private projectsThatAreNotReady: string[];
  private publicProjects: string[];

  constructor(
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
  ) {
    this.projectsWithPendingExports = [];
    this.projectsThatAreNotReady = [];
    this.publicProjects = [];
  }

  async hasPendingExports(
    projectId: string,
  ): Promise<Either<DoesntExist, boolean>> {
    const project = await this.projectRepo.findOne(projectId);
    if (!project) return left(doesntExist);

    return right(this.projectsWithPendingExports.includes(projectId));
  }

  async isProjectReady(
    projectId: string,
  ): Promise<Either<DoesntExist, boolean>> {
    return this.projectsThatAreNotReady.includes(projectId)
      ? left(doesntExist)
      : right(true);
  }

  async isPublic(
    projectId: string,
  ): Promise<Either<typeof doesntExist, boolean>> {
    const project = await this.projectRepo.findOne(projectId);
    if (!project) return left(doesntExist);

    return right(this.publicProjects.includes(projectId));
  }

  addPendingExportForProject(projectId: string) {
    this.projectsWithPendingExports.push(projectId);
  }

  addPublicProject(projectId: string) {
    this.publicProjects.push(projectId);
  }
}
