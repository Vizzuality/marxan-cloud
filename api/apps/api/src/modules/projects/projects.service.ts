import { Injectable } from '@nestjs/common';
import { FetchSpecification } from 'nestjs-base-service';
import { AppInfoDTO } from '@marxan-api/dto/info.dto';

import { GeoFeaturesService } from '@marxan-api/modules/geo-features/geo-features.service';

import { ProjectsCrudService, ProjectsInfoDTO } from './projects-crud.service';
import { JobStatusService } from './job-status';
import { ProtectedAreasFacade } from './protected-areas/protected-areas.facade';
import { Project } from './project.api.entity';
import { CreateProjectDTO } from './dto/create.project.dto';
import { UpdateProjectDTO } from './dto/update.project.dto';
import { PlanningAreasService } from './planning-areas';
import { assertDefined } from '@marxan/utils';

export { validationFailed } from './planning-areas';

@Injectable()
export class ProjectsService {
  constructor(
    private readonly geoCrud: GeoFeaturesService,
    private readonly projectsCrud: ProjectsCrudService,
    private readonly protectedAreaShapefile: ProtectedAreasFacade,
    private readonly jobStatusService: JobStatusService,
    private readonly planningAreaService: PlanningAreasService,
  ) {}

  async findAllGeoFeatures(
    fetchSpec: FetchSpecification,
    appInfo?: AppInfoDTO,
  ) {
    // /ACL slot/
    return this.geoCrud.findAllPaginated(fetchSpec, appInfo);
  }

  async findAll(fetchSpec: FetchSpecification, info?: ProjectsInfoDTO) {
    return this.projectsCrud.findAllPaginated(fetchSpec, info);
  }

  async findAllPublic(fetchSpec: FetchSpecification, info?: ProjectsInfoDTO) {
    // /ACL slot/
    return this.projectsCrud.findAllPaginated(fetchSpec, info);
  }

  async findOne(
    id: string,
    info?: ProjectsInfoDTO,
  ): Promise<Project | undefined> {
    // /ACL slot/
    try {
      return await this.projectsCrud.getById(id, undefined, info);
    } catch (error) {
      // library-sourced errors are no longer instances of HttpException
      return undefined;
    }
  }

  // TODO debt: shouldn't use API's DTO - avoid relating service to given access layer (Rest)
  async create(input: CreateProjectDTO, info: AppInfoDTO) {
    assertDefined(info.authenticatedUser);
    const project = await this.projectsCrud.create(input, info);
    await this.projectsCrud.assignCreatorRole(
      project.id,
      info.authenticatedUser.id,
    );
    return project;
  }

  async update(projectId: string, input: UpdateProjectDTO) {
    // /ACL slot - can?/
    return this.projectsCrud.update(projectId, input);
  }

  async remove(projectId: string) {
    // /ACL slot - can?/
    return this.projectsCrud.remove(projectId);
  }

  async addShapeFor(
    projectId: string,
    file: Express.Multer.File,
    info: ProjectsInfoDTO,
  ): Promise<Error | undefined> /** Debt: move to Either<ErrorSymbol,Ok> */ {
    // /ACL slot - can?/
    try {
      // throws HttpException
      await this.projectsCrud.getById(projectId, undefined, info);
    } catch {
      return new Error(`Not Found`);
    }

    this.protectedAreaShapefile.convert(projectId, file);
    return;
  }

  async getJobStatusFor(projectId: string, info: ProjectsInfoDTO) {
    await this.projectsCrud.getById(projectId, undefined, info);
    return await this.jobStatusService.getJobStatusFor(projectId);
  }

  async importLegacyProject(_: Express.Multer.File) {
    return new Project();
  }

  savePlanningAreaFromShapefile = this.planningAreaService.savePlanningAreaFromShapefile.bind(
    this.planningAreaService,
  );
}
