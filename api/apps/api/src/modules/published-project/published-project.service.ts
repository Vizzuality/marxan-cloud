import { BadRequestException, Injectable } from '@nestjs/common';
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
import { CreatePublishProjectDto } from './dto/publish-project.dto';
import { WebshotService } from '@marxan/webshot';
import { AppConfig } from '@marxan-api/utils/config.utils';
import { assertDefined } from '@marxan/utils';
import { isLeft, isRight } from 'fp-ts/lib/Either';
import { ProjectsService } from '../projects/projects.service';

export const notFound = Symbol(`project not found`);
export const accessDenied = Symbol(`not allowed`);
export const underModerationError = Symbol(`this project is under moderation`);
export const sameUnderModerationStatus = Symbol(
  `this project is already on that moderation status`,
);
export const alreadyPublished = Symbol(`this project is public`);
export const notPublished = Symbol(`this project is not public yet`);
export const internalError = Symbol(`internal error`);
export const exportError = Symbol(`error while exporting project`);

export type errors =
  | typeof notFound
  | typeof accessDenied
  | typeof internalError;

@Injectable()
export class PublishedProjectService {
  constructor(
    @InjectRepository(Project) private projectRepository: Repository<Project>,
    @InjectRepository(PublishedProject)
    private publicProjectsRepo: Repository<PublishedProject>,
    private crudService: PublishedProjectCrudService,
    private projectService: ProjectsService,
    private webshotService: WebshotService,
    private readonly acl: ProjectAccessControl,
    private readonly usersService: UsersService,
  ) {}

  async publish(
    id: string,
    requestingUserId: string,
    projectToPublish: CreatePublishProjectDto,
  ): Promise<
    Either<errors | typeof alreadyPublished | typeof exportError, true>
  > {
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

    const scenarioQuery = `SELECT id from scenarios where scenarios.project_id = $1`;
    const scenarioIds = await this.projectRepository.query(scenarioQuery, [id]);
    const scenarioIdsForExport =
      projectToPublish.scenarioIds ||
      scenarioIds.map((scenario: any) => {
        return scenario?.id;
      });

    const exportResult = await this.projectService.requestExport(
      id,
      requestingUserId,
      scenarioIdsForExport,
      false,
    );

    if (isLeft(exportResult)) {
      return left(exportError);
    }

    // @debt If we end up moving the scenario map thumbnail generation
    // to the end of the Marxan run process, this part here regarding
    // the webshot should be removed and/or adapted to it. It looks
    // like it does not belong here at all anyways, but right now there
    // is not a better place to deal with this.

    const webshotUrl = AppConfig.get('webshot.url') as string;

    const {
      featuredScenarioId,
      config,
      ...projectWithoutScenario
    } = projectToPublish;

    assertDefined(featuredScenarioId);
    assertDefined(config);

    const pngData = await this.webshotService.getPublishedProjectsImage(
      featuredScenarioId,
      id,
      {
        ...config,
        screenshotOptions: {
          clip: { x: 0, y: 0, width: 500, height: 500 },
        },
      },
      webshotUrl,
    );

    if (isLeft(pngData)) {
      console.info(
        `Map screenshot for public project ${id} could not be generated`,
      );
    }

    await this.crudService.create({
      id,
      ...projectWithoutScenario,
      pngData: isRight(pngData) ? pngData.right : '',
      exportId: exportResult.right.exportId.value,
    });

    return right(true);
  }

  async unpublish(
    id: string,
    requestingUserId: string,
  ): Promise<
    Either<errors | typeof notPublished | typeof underModerationError, true>
  > {
    const project = await this.projectRepository.findOne(id);

    if (!project) {
      return left(notFound);
    }

    const isAdmin = await this.usersService.isPlatformAdmin(requestingUserId);

    if (!(await this.acl.canPublishProject(requestingUserId, id)) && !isAdmin) {
      return left(accessDenied);
    }

    const publicProject = await this.publicProjectsRepo.findOne({ id });
    if (!publicProject?.id) {
      return left(notPublished);
    }

    if (publicProject.underModeration && !isAdmin) {
      return left(underModerationError);
    }

    await this.publicProjectsRepo.delete({ id });
    return right(true);
  }

  async changeModerationStatus(
    id: string,
    requestingUserId: string,
    status: boolean,
    alsoUnpublish?: boolean,
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

    if (alsoUnpublish) {
      await this.unpublish(id, requestingUserId);
    }

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
    const isUnderModeration = result.underModeration === true;
    const isPlatformAdmin =
      info?.authenticatedUser?.id !== undefined &&
      (await this.usersService.isPlatformAdmin(info?.authenticatedUser?.id));
    if (isUnderModeration && !isPlatformAdmin) {
      return left(accessDenied);
    }
    return right(result);
  }
}
