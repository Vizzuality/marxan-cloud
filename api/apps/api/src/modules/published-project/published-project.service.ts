import { Injectable } from '@nestjs/common';
import { Either, left, right } from 'fp-ts/Either';
import { PublishedProjectCrudService } from '@marxan-api/modules/published-project/published-project-crud.service';
import { Repository } from 'typeorm';
import { Project } from '@marxan-api/modules/projects/project.api.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { FetchSpecification } from 'nestjs-base-service';
import { ProjectsRequest } from '@marxan-api/modules/projects/project-requests-info';
import { PublishedProject } from '@marxan-api/modules/published-project/entities/published-project.api.entity';
import { ProjectAccessControl } from '@marxan-api/modules/access-control';
import { UsersService } from '@marxan-api/modules/users/users.service';

export const notFound = Symbol(`project not found`);
export const accessDenied = Symbol(`not allowed`);
export const sameUnderModerationStatus = Symbol(
  `this project is already on that moderation status`,
);
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
    protected publicProjectsRepo: Repository<PublishedProject>,
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

    const isProjectAlreadyPublished = await this.publicProjectsRepo
      .findOne({ id })
      .then((result) => (result ? true : false));
    if (isProjectAlreadyPublished) {
      return left(alreadyPublished);
    }

    await this.crudService.create({
      id,
      name: project.name,
      description: project.description,
    });
    return right(true);
  }

  async changeModerationStatus(
    id: string,
    requestingUserId: string,
    status: boolean,
  ): Promise<Either<errors | typeof sameUnderModerationStatus, true>> {
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

    if (status === existingPublicProject.underModeration) {
      return left(sameUnderModerationStatus);
    }

    await this.crudService.update(id, {
      underModeration: !existingPublicProject.underModeration,
    });
    return right(true);
  }

  async findAll(fetchSpec: FetchSpecification, info?: ProjectsRequest) {
    return this.crudService.findAllPaginated(fetchSpec, info);
  }

  async findOne(
    id: string,
    info?: ProjectsRequest,
  ): Promise<Either<typeof notFound | typeof accessDenied, PublishedProject>> {
    const result = await this.publicProjectsRepo.findOne(id);

    if (!result) {
      return left(notFound);
    }

    if (
      result.underModeration === true &&
      info?.authenticatedUser?.id &&
      !(await this.acl.canPublishProject(info?.authenticatedUser.id, id))
    ) {
      return left(accessDenied);
    }
    return right(result);
    // library-sourced errors are no longer instances of HttpException
  }
}
