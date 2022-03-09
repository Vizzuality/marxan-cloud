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

export const notFound = Symbol(`project not found`);
export const accessDenied = Symbol(`not allowed`);
export const alreadyUnpublished = Symbol(`this project is not public`);
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
  ): Promise<Either<errors, true>> {
    try {
      const project = await this.projectRepository.findOne(id);

      if (!project) {
        return left(notFound);
      }

      if (!(await this.acl.canPublishProject(requestingUserId, id))) {
        return left(accessDenied);
      }

      const existingPublicProject = await this.crudService.getById(
        id,
        undefined,
        undefined,
      );

      const userIsAdmin = await this.usersService.isPlatformAdmin(
        requestingUserId,
      );

      if (existingPublicProject.isUnpublished && !userIsAdmin) {
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

  async unpublish(
    id: string,
    requestingUserId: string,
  ): Promise<Either<errors | typeof alreadyUnpublished, true>> {
    try {
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
    } catch {
      return left(internalError);
    }
  }

  async findAll(fetchSpec: FetchSpecification, info?: ProjectsRequest) {
    return this.crudService.findAllPaginated(fetchSpec, info);
  }

  async findOne(
    id: string,
    info?: ProjectsServiceRequest,
  ): Promise<Either<errors, PublishedProject | undefined>> {
    // /ACL slot/
    try {
      assertDefined(info?.authenticatedUser);
      const { authenticatedUser } = info;
      const existingPublicProject = await this.crudService.getById(
        id,
        undefined,
        info,
      );

      const userIsAdmin = await this.usersService.isPlatformAdmin(
        authenticatedUser.id,
      );

      if (existingPublicProject.isUnpublished && !userIsAdmin) {
        return left(accessDenied);
      }

      return right(existingPublicProject);
    } catch (error) {
      // library-sourced errors are no longer instances of HttpException
      return left(internalError);
    }
  }
}
