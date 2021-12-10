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
import { PlanningAreasService } from './planning-areas';
import { assertDefined } from '@marxan/utils';

import {
  ProjectsRequest,
  ProjectsServiceRequest,
} from './project-requests-info';
import { GetProjectErrors, GetProjectQuery } from '@marxan/projects';
import { ChangeBlmRange } from '@marxan-api/modules/projects/blm';
import {
  GetFailure,
  ProjectBlm,
  ProjectBlmRepo,
} from '@marxan-api/modules/blm';
import { ProjectAccessControl } from '../access-control';
import { Permit } from '../access-control/access-control.types';

export { validationFailed } from './planning-areas';

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
  ): Promise<Project | undefined> {
    // /ACL slot/
    try {
      return await this.projectsCrud.getById(id, undefined, info);
    } catch (error) {
      // library-sourced errors are no longer instances of HttpException
      return undefined;
    }
  }

  async findProjectBlm(id: string): Promise<Either<GetFailure, ProjectBlm>> {
    return await this.projectBlmRepository.get(id);
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

  async update(projectId: string, input: UpdateProjectDTO) {
    return this.projectsCrud.update(projectId, input);
  }

  async updateBlmValues(projectId: string, range: [number, number]) {
    return await this.commandBus.execute(new ChangeBlmRange(projectId, range));
  }

  async remove(
    projectId: string,
    userId: string,
  ): Promise<Either<Permit, void>> {
    if (!(await this.projectAclService.canDeleteProject(userId, projectId))) {
      return left(false);
    }
    return right(await this.projectsCrud.remove(projectId));
  }

  async getJobStatusFor(projectId: string, info: ProjectsRequest) {
    await this.projectsCrud.getById(projectId, undefined, info);
    return await this.jobStatusService.getJobStatusFor(projectId);
  }

  async importLegacyProject(_: Express.Multer.File) {
    return new Project();
  }

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
}
