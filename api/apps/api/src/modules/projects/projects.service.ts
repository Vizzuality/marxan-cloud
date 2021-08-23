import { Injectable } from '@nestjs/common';
import { FetchSpecification } from 'nestjs-base-service';
import { Either, isLeft, left, right } from 'fp-ts/Either';
import { assertDefined } from '@marxan/utils';
import { AppInfoDTO } from '@marxan-api/dto/info.dto';

import { GeoFeaturesService } from '@marxan-api/modules/geo-features/geo-features.service';

import { ProjectsCrudService, ProjectsInfoDTO } from './projects-crud.service';
import { JobStatusService } from './job-status';
import { ProtectedAreasFacade } from './protected-areas/protected-areas.facade';
import { Project } from './project.api.entity';
import { CreateProjectDTO } from './dto/create.project.dto';
import { UpdateProjectDTO } from './dto/update.project.dto';
import { PlanningAreasService } from './planning-areas';
import { CanReadError, ProjectAclService } from './acl';
import { PromiseType } from 'utility-types';

export { validationFailed } from './planning-areas';

@Injectable()
export class ProjectsService {
  constructor(
    private readonly geoCrud: GeoFeaturesService,
    private readonly projectsCrud: ProjectsCrudService,
    private readonly protectedAreaShapefile: ProtectedAreasFacade,
    private readonly jobStatusService: JobStatusService,
    private readonly planningAreaService: PlanningAreasService,
    private readonly acl: ProjectAclService,
  ) {}

  async findAllGeoFeatures(
    fetchSpec: FetchSpecification,
    appInfo?: AppInfoDTO,
  ) {
    // /ACL slot/
    return this.geoCrud.findAllPaginated(fetchSpec, appInfo);
  }

  async findAll(
    fetchSpec: FetchSpecification,
    info: ProjectsInfoDTO,
  ): Promise<
    Either<
      any,
      PromiseType<ReturnType<ProjectsCrudService['findAllPaginated']>>
    >
  > {
    assertDefined(info.authenticatedUser?.id);
    const ownProjectIds = await this.acl.getOwn(info.authenticatedUser.id);
    // TODO check if provided any IDs are missing within ownProjectIds - error
    // TODO if provided IDs are missing, attach them to FetchSpec
    return right(await this.projectsCrud.findAllPaginated(fetchSpec, info));
  }

  async findOne(
    id: string,
    userId: string,
  ): Promise<Either<CanReadError, Project>> {
    const result = await this.acl.canRead(id, userId);
    if (isLeft(result)) {
      return result;
    }
    return right(await this.projectsCrud.getById(id));
  }

  async create(
    input: CreateProjectDTO,
    info: AppInfoDTO,
  ): Promise<Either<any, Project>> {
    assertDefined(info.authenticatedUser?.id);
    const project = await this.projectsCrud.create(input, info);
    const result = await this.acl.assignOwner(
      project.id,
      info.authenticatedUser.id,
    );
    if (isLeft(result)) {
      return left(``);
    }
    return right(project);
  }

  async update(
    projectId: string,
    input: UpdateProjectDTO,
  ): Promise<
    Either<any, PromiseType<ReturnType<ProjectsCrudService['update']>>>
  > {
    // /ACL slot - can?/
    return right(await this.projectsCrud.update(projectId, input));
  }

  async remove(projectId: string) {
    // /ACL slot - can?/
    return this.projectsCrud.remove(projectId);
  }

  async addShapeFor(
    projectId: string,
    file: Express.Multer.File,
  ): Promise<Error | undefined> /** Debt: move to Either<ErrorSymbol,Ok> */ {
    // /ACL slot - can?/
    try {
      // throws HttpException
      await this.projectsCrud.getById(projectId);
    } catch {
      return new Error(`Not Found`);
    }

    this.protectedAreaShapefile.convert(projectId, file);
    return;
  }

  async getJobStatusFor(projectId: string) {
    await this.projectsCrud.getById(projectId);
    return await this.jobStatusService.getJobStatusFor(projectId);
  }

  async importLegacyProject(_: Express.Multer.File) {
    return new Project();
  }

  savePlanningAreaFromShapefile = this.planningAreaService.savePlanningAreaFromShapefile.bind(
    this.planningAreaService,
  );
}
