import { Injectable } from '@nestjs/common';
import { Either, left, right } from 'fp-ts/Either';
import { PublishedProjectCrudService } from '@marxan-api/modules/published-project/published-project-crud.service';
import { Repository } from 'typeorm';
import { Project } from '@marxan-api/modules/projects/project.api.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { FetchSpecification } from 'nestjs-base-service';
import { ProjectsRequest } from '@marxan-api/modules/projects/project-requests-info';
import { PublishedProject } from '@marxan-api/modules/published-project/entities/published-project.api.entity';
import { ProjectAclService } from '@marxan-api/modules/projects-acl';

export const notFound = Symbol(`project not found`);
export const accessDenied = Symbol(`not allowed`);
export const internalError = Symbol(`internal error`);

export type errors =
  | typeof notFound
  | typeof accessDenied
  | typeof internalError;

@Injectable()
export class PublishedProjectService {
  constructor(
    @InjectRepository(Project) private projectRepository: Repository<Project>,
    private crudService: PublishedProjectCrudService,
    private readonly acl: ProjectAclService,
  ) {}

  async publish(
    id: string,
    requestingUserId: string,
  ): Promise<Either<errors, true>> {
    try {
      const project = await this.projectRepository.findOne(id);

      if (!project) {
        return left(notFound);
      }

      if (!(await this.acl.canPublish(requestingUserId, id))) {
        return left(accessDenied);
      }

      await this.crudService.create({
        id,
        name: project.name,
        description: project.description,
      });
      return right(true);
    } catch {
      return left(internalError);
    }
  }

  async findAll(fetchSpec: FetchSpecification, info?: ProjectsRequest) {
    return this.crudService.findAllPaginated(fetchSpec, info);
  }

  async findOne(
    id: string,
    info?: ProjectsRequest,
  ): Promise<PublishedProject | undefined> {
    // /ACL slot/
    try {
      return await this.crudService.getById(id, undefined, info);
    } catch (error) {
      // library-sourced errors are no longer instances of HttpException
      return undefined;
    }
  }
}
