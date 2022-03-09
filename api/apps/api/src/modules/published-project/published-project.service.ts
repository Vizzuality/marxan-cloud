import { Injectable } from '@nestjs/common';
import { Either, left, right } from 'fp-ts/Either';
import { PublishedProjectCrudService } from '@marxan-api/modules/published-project/published-project-crud.service';
import { Repository } from 'typeorm';
import { Project } from '@marxan-api/modules/projects/project.api.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { FetchSpecification } from 'nestjs-base-service';
import {
  ProjectsRequest,
  ProjectsServiceRequest,
} from '@marxan-api/modules/projects/project-requests-info';
import { PublishedProject } from '@marxan-api/modules/published-project/entities/published-project.api.entity';
import { ProjectAccessControl } from '@marxan-api/modules/access-control';
import { UsersService } from '../users/users.service';
import { assertDefined } from '@marxan/utils';
import { string } from 'fp-ts';

export const notFound = Symbol(`project not found`);
export const accessDenied = Symbol(`not allowed`);
export const alreadyUnpublished = Symbol(`this project is not public`);
export const alreadyPublished = Symbol(`this project is public`);
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
    private readonly acl: ProjectAccessControl,
    private readonly usersService: UsersService,
  ) {}

  async publish(
    id: string,
    requestingUserId: string,
  ): Promise<Either<errors | typeof alreadyPublished, true>> {
    const project = await this.projectRepository.findOne(id);

    if (!project) {
      return left(notFound);
    }

    if (!(await this.acl.canPublishProject(requestingUserId, id))) {
      return left(accessDenied);
    }

    const userIsAdmin = await this.usersService.isPlatformAdmin(
      requestingUserId,
    );

    if (userIsAdmin) {
      const existingPublicProject = await this.crudService.getById(
        id,
        undefined,
        undefined,
      );
      if (!existingPublicProject.isUnpublished) {
        return left(alreadyPublished);
      }
    }

    await this.crudService.create({
      id,
      name: project.name,
      description: project.description,
    });
    return right(true);
  }

  async unpublish(
    id: string,
    requestingUserId: string,
  ): Promise<Either<errors | typeof alreadyUnpublished, true>> {
    const existingPublicProject = await this.crudService.getById(
      id,
      undefined,
      undefined,
    );

    if (!existingPublicProject) {
      return left(notFound);
    }
    if (!(await this.usersService.isPlatformAdmin(requestingUserId))) {
      return left(accessDenied);
    }
    if (existingPublicProject.isUnpublished) {
      return left(alreadyUnpublished);
    }

    await this.crudService.update(id, {
      isUnpublished: true,
    });
    return right(true);
  }

  async findAll(fetchSpec: FetchSpecification, info?: ProjectsRequest) {
    return this.crudService.findAllPaginated(fetchSpec, info);
  }

  async findOne(
    id: string,
    info?: ProjectsRequest,
  ): Promise<PublishedProject | undefined> {
    try {
      return await this.crudService.getById(id, undefined, info);
    } catch (error) {
      // library-sourced errors are no longer instances of HttpException
      return undefined;
    }
  }
}
