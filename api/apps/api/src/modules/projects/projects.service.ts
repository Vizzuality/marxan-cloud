import { forbiddenError } from '@marxan-api/modules/access-control';
import { Injectable } from '@nestjs/common';
import { FetchSpecification } from 'nestjs-base-service';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Either, isLeft, left, right } from 'fp-ts/Either';

import {
  FindResult,
  GeoFeaturesService,
} from '@marxan-api/modules/geo-features/geo-features.service';
import { GeoFeaturesRequestInfo } from '@marxan-api/modules/geo-features';

import { ProjectsCrudService } from './projects-crud.service';
import { JobStatusService } from './job-status';
import { Project } from './project.api.entity';
import { CreateProjectDTO } from './dto/create.project.dto';
import { UpdateProjectDTO } from './dto/update.project.dto';
import { PlanningAreasService } from '@marxan-api/modules/planning-areas';
import { assertDefined } from '@marxan/utils';

import {
  ProjectsRequest,
  ProjectsServiceRequest,
} from './project-requests-info';
import { GetProjectErrors, GetProjectQuery } from '@marxan/projects';
import {
  Blm,
  GetProjectFailure as GetBlmFailure,
  ProjectBlmRepo,
} from '@marxan-api/modules/blm';
import {
  ExportId,
  ExportProject,
  GetExportArchive,
} from '@marxan-api/modules/clone';
import { GetFailure as GetArchiveLocationFailure } from '@marxan-api/modules/clone/export/application/get-archive.query';
import { BlockGuard } from '@marxan-api/modules/projects/block-guard/block-guard.service';
import { API_EVENT_KINDS } from '@marxan/api-events';
import { ResourceId } from '@marxan/cloning/domain';
import { Readable } from 'stream';
import { ProjectAccessControl } from '../access-control';
import { Permit } from '../access-control/access-control.types';
import { ApiEventsService } from '../api-events';
import {
  ChangeProjectBlmRange,
  ChangeProjectRangeErrors,
} from '@marxan-api/modules/projects/blm';

export { validationFailed } from '../planning-areas';

export const projectNotFound = Symbol(`project not found`);
export const notAllowed = Symbol(`not allowed to that action`);
export const notFound = Symbol(`project not found`);
export const exportNotFound = Symbol(`project export not found`);
export const apiEventDataNotFound = Symbol(`missing data in api event`);

@Injectable()
export class ProjectsService {
  constructor(
    private readonly geoCrud: GeoFeaturesService,
    private readonly projectsCrud: ProjectsCrudService,
    private readonly jobStatusService: JobStatusService,
    private readonly planningAreaService: PlanningAreasService,
    private readonly projectBlmRepository: ProjectBlmRepo,
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
    private readonly projectAclService: ProjectAccessControl,
    private readonly blockGuard: BlockGuard,
    private readonly apiEventsService: ApiEventsService,
  ) {}

  async findAllGeoFeatures(
    fetchSpec: FetchSpecification,
    appInfo: GeoFeaturesRequestInfo,
  ): Promise<Either<GetProjectErrors, FindResult>> {
    const project = await this.assertProject(
      appInfo.params?.projectId,
      appInfo.authenticatedUser,
    );
    if (isLeft(project)) {
      return project;
    }

    return right(
      await this.geoCrud.findAllPaginated(fetchSpec, {
        ...appInfo,
        params: {
          ...appInfo.params,
          projectId: project.right.id,
          bbox: project.right.bbox,
        },
      }),
    );
  }

  async findAll(fetchSpec: FetchSpecification, info: ProjectsServiceRequest) {
    return this.projectsCrud.findAllPaginated(fetchSpec, info);
  }

  async findOne(
    id: string,
    info: ProjectsServiceRequest,
  ): Promise<Either<typeof projectNotFound | typeof forbiddenError, Project>> {
    try {
      const project = await this.projectsCrud.getById(id, undefined, info);
      if (
        !(await this.projectAclService.canViewProject(
          info.authenticatedUser.id,
          id,
        ))
      ) {
        return left(forbiddenError);
      }
      return right(project);
    } catch (error) {
      // library-sourced errors are no longer instances of HttpException
      return left(projectNotFound);
    }
  }

  async findProjectBlm(
    projectId: string,
    userId: string,
  ): Promise<Either<GetBlmFailure | typeof forbiddenError, Blm>> {
    if (!(await this.projectAclService.canViewProject(userId, projectId))) {
      return left(forbiddenError);
    }

    return await this.projectBlmRepository.get(projectId);
  }

  // TODO debt: shouldn't use API's DTO - avoid relating service to given access layer (Rest)
  async create(
    input: CreateProjectDTO,
    info: ProjectsRequest,
  ): Promise<Either<Permit, Project>> {
    assertDefined(info.authenticatedUser);
    if (
      !(await this.projectAclService.canCreateProject(
        info.authenticatedUser.id,
      ))
    ) {
      return left(false);
    }
    const project = await this.projectsCrud.create(input, info);
    await this.projectsCrud.assignCreatorRole(
      project.id,
      info.authenticatedUser.id,
    );
    return right(project);
  }

  async update(
    projectId: string,
    input: UpdateProjectDTO,
    userId: string,
  ): Promise<Either<Permit, Project>> {
    await this.blockGuard.ensureThatProjectIsNotBlocked(projectId);

    if (!(await this.projectAclService.canEditProject(userId, projectId))) {
      return left(false);
    }
    return right(await this.projectsCrud.update(projectId, input));
  }

  async updateBlmValues(
    projectId: string,
    userId: string,
    range: [number, number],
  ): Promise<Either<ChangeProjectRangeErrors | typeof forbiddenError, Blm>> {
    await this.blockGuard.ensureThatProjectIsNotBlocked(projectId);

    if (!(await this.projectAclService.canEditProject(userId, projectId))) {
      return left(forbiddenError);
    }
    return await this.commandBus.execute(
      new ChangeProjectBlmRange(projectId, range),
    );
  }

  async requestExport(
    projectId: string,
    userId: string,
  ): Promise<Either<typeof forbiddenError | typeof projectNotFound, string>> {
    await this.blockGuard.ensureThatProjectIsNotBlocked(projectId);

    const canExportProject = await this.projectAclService.canExportProject(
      userId,
      projectId,
    );

    if (!canExportProject) return left(forbiddenError);

    const exportId = await this.commandBus.execute(
      new ExportProject(new ResourceId(projectId)),
    );
    return right(exportId.value);
  }

  async remove(
    projectId: string,
    userId: string,
  ): Promise<Either<Permit, void>> {
    await this.blockGuard.ensureThatProjectIsNotBlocked(projectId);

    if (!(await this.projectAclService.canDeleteProject(userId, projectId))) {
      return left(false);
    }
    return right(await this.projectsCrud.remove(projectId));
  }

  async getJobStatusFor(projectId: string, info: ProjectsRequest) {
    await this.projectsCrud.getById(projectId, undefined, info);
    return await this.jobStatusService.getJobStatusFor(projectId);
  }

  async importLegacyProject(_: Express.Multer.File, userId: string) {
    if (!(await this.projectAclService.canCreateProject(userId))) {
      return left(false);
    }
    return right(new Project());
  }

  // TODO add ensureThatProjectIsNotBlocked guard
  savePlanningAreaFromShapefile = this.planningAreaService.savePlanningAreaFromShapefile.bind(
    this.planningAreaService,
  );

  private async assertProject(
    projectId = '',
    forUser: ProjectsRequest['authenticatedUser'],
  ) {
    return await this.queryBus.execute(
      new GetProjectQuery(projectId, forUser?.id),
    );
  }

  async getExportedArchive(
    projectId: string,
    userId: string,
    exportId: string,
  ): Promise<
    Either<
      GetArchiveLocationFailure | typeof notAllowed | typeof projectNotFound,
      Readable
    >
  > {
    const response = await this.assertProject(projectId, { id: userId });
    if (isLeft(response)) return left(projectNotFound);

    const canDownloadExport = await this.projectAclService.canDownloadProjectExport(
      userId,
      projectId,
    );

    if (!canDownloadExport) return left(notAllowed);

    return this.queryBus.execute(new GetExportArchive(new ExportId(exportId)));
  }

  async getLatestExportForProject(
    projectId: string,
    userId: string,
  ): Promise<
    Either<
      | typeof exportNotFound
      | typeof forbiddenError
      | typeof apiEventDataNotFound
      | typeof projectNotFound,
      string
    >
  > {
    const response = await this.assertProject(projectId, { id: userId });

    if (isLeft(response)) return left(projectNotFound);

    const canDownloadExport = await this.projectAclService.canDownloadProjectExport(
      userId,
      projectId,
    );

    if (!canDownloadExport) return left(forbiddenError);

    try {
      const latestExportFinishedApiEvent = await this.apiEventsService.getLatestEventForTopic(
        {
          kind: API_EVENT_KINDS.project__export__finished__v1__alpha,
          topic: projectId,
        },
      );
      const exportId = latestExportFinishedApiEvent.data?.exportId as
        | string
        | undefined;
      if (!exportId) return left(apiEventDataNotFound);
      return right(exportId);
    } catch (err) {
      return left(exportNotFound);
    }
  }
}
