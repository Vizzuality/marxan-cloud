import {
  forbiddenError,
  ProjectAccessControl,
} from '@marxan-api/modules/access-control';
import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { FetchSpecification } from 'nestjs-base-service';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Either, isLeft, isRight, left, right } from 'fp-ts/Either';
import { validate as isValidUUID } from 'uuid';
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
import {
  PlanningAreasService,
  PlanningGids,
} from '@marxan-api/modules/planning-areas';
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
import {
  exportNotFound,
  GetFailure as GetArchiveLocationFailure,
} from '@marxan-api/modules/clone/export/application/get-archive.query';
import { BlockGuard } from '@marxan-api/modules/projects/block-guard/block-guard.service';
import { ResourceId } from '@marxan/cloning/domain';
import { Readable } from 'stream';
import { Permit } from '@marxan-api/modules/access-control/access-control.types';
import { ScenarioLockResultPlural } from '@marxan-api/modules/access-control/scenarios-acl/locks/dto/scenario.lock.dto';
import {
  ChangeProjectBlmRange,
  ChangeProjectRangeErrors,
} from '@marxan-api/modules/projects/blm';
import {
  GenerateExportFromZipFile,
  GenerateExportFromZipFileError,
} from '../clone/infra/import/generate-export-from-zip-file.command';
import {
  ImportProject,
  ImportProjectCommandResult,
  ImportProjectError,
} from '../clone/import/application/import-project.command';
import { PlanningUnitGridShape } from '@marxan/scenarios-planning-unit';
import { UserId } from '@marxan/domain-ids';
import { ExportProjectCommandResult } from '../clone/export/application/export-project.command';
import { ExportRepository } from '../clone/export/application/export-repository.port';
import {
  StartLegacyProjectImport,
  StartLegacyProjectImportError,
  StartLegacyProjectImportResult,
} from '../legacy-project-import/application/start-legacy-project-import.command';
import {
  RunLegacyProjectImport,
  RunLegacyProjectImportError,
} from '../legacy-project-import/application/run-legacy-project-import.command';
import { LegacyProjectImportFileType } from '@marxan/legacy-project-import';
import {
  AddFileToLegacyProjectImport,
  AddFileToLegacyProjectImportHandlerErrors,
} from '../legacy-project-import/application/add-file-to-legacy-project-import.command';
import { LegacyProjectImportFileId } from '@marxan/legacy-project-import/domain/legacy-project-import-file.id';
import {
  DeleteFileFromLegacyProjectImport,
  DeleteFileFromLegacyProjectImportHandlerErrors,
} from '../legacy-project-import/application/delete-file-from-legacy-project-import.command';
import { GetLegacyProjectImportErrors } from '../legacy-project-import/application/get-legacy-project-import-errors.query';
import { CancelLegacyProjectImport } from '../legacy-project-import/application/cancel-legacy-project-import.command';
import {
  DeleteProject,
  DeleteProjectFailed,
} from './delete-project/delete-project.command';
import {
  UpdateSolutionsAreLocked,
  UpdateSolutionsAreLockedError,
} from '../legacy-project-import/application/update-solutions-are-locked-to-legacy-project-import.command';
import { SetProjectBlm } from './blm/set-project-blm';
import {
  blmCreationFailure,
  CreateInitialScenarioBlm,
} from '../scenarios/blm-calibration/create-initial-scenario-blm.command';
import { LegacyProjectImportRepository } from '../legacy-project-import/domain/legacy-project-import/legacy-project-import.repository';
import { unknownPdfWebshotError, WebshotService } from '@marxan/webshot';
import { GetScenarioFailure } from '@marxan-api/modules/blm/values/blm-repos';
import stream from 'stream';
import { AppConfig } from '@marxan-api/utils/config.utils';
import { WebshotBasicPdfConfig } from '@marxan/webshot/webshot.dto';
import { ScenariosService } from '@marxan-api/modules/scenarios/scenarios.service';

export { validationFailed } from '../planning-areas';

export const projectNotFound = Symbol(`project not found`);
export const projectNotEditable = Symbol(`project not editable`);
export const projectIsMissingInfoForRegularPus = Symbol(
  `project is missing info for regular planning units`,
);
export const notAllowed = Symbol(`not allowed to that action`);
export const notFound = Symbol(`project not found`);

// Check where to centralize this symbols
export const exportResourceKindIsNotProject = Symbol(
  `export is not for a project`,
);
export const exportIsNotStandalone = Symbol(`export is not standalone`);
export const projectIsNotPublished = Symbol(`project is not published`);
export const projectNotFoundForExport = Symbol(`project not found`);

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
    private readonly exportRepository: ExportRepository,
    private readonly legacyProjectImportRepository: LegacyProjectImportRepository,
    private readonly webshotService: WebshotService,
    @Inject(forwardRef(() => ScenariosService))
    private readonly scenariosService: ScenariosService,
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

  async getActualUrlForProjectPlanningAreaTiles(
    projectId: string,
    userId: string,
    z: number,
    x: number,
    y: number,
  ): Promise<
    Either<
      GetProjectErrors | typeof forbiddenError | typeof projectNotFound,
      { from: string; to: string }
    >
  > {
    if (!(await this.projectAclService.canViewProject(userId, projectId))) {
      return left(forbiddenError);
    }

    const project = await this.projectsCrud.getById(projectId);

    if (!project.planningAreaId) {
      return left(projectNotFound);
    }

    const planningAreaId = isValidUUID(project.planningAreaId)
      ? { planningAreaGeometryId: project.planningAreaId }
      : this.idToGid(project.planningAreaId);

    const planningAreaEntity = await this.planningAreaService.locatePlanningAreaEntity(
      planningAreaId,
    );

    if (!planningAreaEntity) {
      return left(projectNotFound);
    }
    /*
    we are redirecting to the planning area service to get the tiles
    **/

    const level = Object.keys(planningAreaId).length - 1;
    /**
     * @todo: In the future we should decouple this.
     */
    const endpointRedirect: { [k: string]: { from: string; to: string } } = {
      planning_areas: {
        from: `/projects/${projectId}/planning-area/tiles`,
        to: `/projects/planning-area/${projectId}/preview/tiles`,
      },
      admin_regions: {
        from: `/projects/${projectId}/planning-area/tiles/${z}/${x}/${y}.mvt`,
        to: `/administrative-areas/${level}/preview/tiles/${z}/${x}/${y}.mvt?guid=${project.planningAreaId}`,
      },
    };
    if (!endpointRedirect[planningAreaEntity.tableName]) {
      return left(forbiddenError);
    }

    return right(endpointRedirect[planningAreaEntity.tableName]);
  }

  async getActualUrlForProjectPlanningGridTiles(
    projectId: string,
    userId: string,
    z: number,
    x: number,
    y: number,
  ): Promise<
    Either<
      GetProjectErrors | typeof forbiddenError | typeof projectNotFound,
      { from: string; to: string; query: {} }
    >
  > {
    if (!(await this.projectAclService.canViewProject(userId, projectId))) {
      return left(forbiddenError);
    }

    const project = await this.projectsCrud.getById(projectId);

    if (!project.planningUnitGridShape) {
      return left(projectNotFound);
    }
    /**
     we are redirecting to the planning area service to get the tiles.

     @todo: In the future we should decouple this text url stuff.

     */
    if (project.planningUnitGridShape === 'from_shapefile') {
      return right({
        from: `/projects/${projectId}/grid/tiles`,
        to: `/projects/planning-area/${projectId}/grid/preview/tiles`,
        query: {},
      });
    } else {
      return right({
        from: `/projects/${projectId}/grid/tiles/${z}/${x}/${y}.mvt`,
        to: `/planning-units/preview/regular/${project.planningUnitGridShape}/${
          project.planningUnitAreakm2
        }/tiles/${z}/${x}/${y}.mvt?bbox=${JSON.stringify(project.bbox)}`,
        query: {
          bbox: JSON.stringify(project.bbox),
        },
      });
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
  ): Promise<
    Either<
      typeof projectIsMissingInfoForRegularPus | typeof forbiddenError,
      Project
    >
  > {
    const dtoHasRegularShape =
      input.planningUnitGridShape &&
      [PlanningUnitGridShape.Hexagon, PlanningUnitGridShape.Square].includes(
        input.planningUnitGridShape,
      );
    const dtoHasNeededInfoForRegularShapes =
      input.planningAreaId ||
      input.adminAreaLevel1Id ||
      input.adminAreaLevel2Id ||
      input.countryId;
    if (dtoHasRegularShape && !dtoHasNeededInfoForRegularShapes)
      return left(projectIsMissingInfoForRegularPus);

    assertDefined(info.authenticatedUser);
    if (
      !(await this.projectAclService.canCreateProject(
        info.authenticatedUser.id,
      ))
    ) {
      return left(forbiddenError);
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

  async doesPlanningAreaBelongToProjectAndCanUserViewIt(
    planningAreaId: string,
    userId: string,
  ): Promise<Either<typeof forbiddenError, void>> {
    const projectIsFound = await this.assertProject(planningAreaId, {
      id: userId,
    });

    if (isRight(projectIsFound)) {
      if (
        !(await this.projectAclService.canViewProject(userId, planningAreaId))
      ) {
        return left(forbiddenError);
      }
    }
    return right(void 0);
  }

  async find(projectId: string): Promise<Project | undefined> {
    try {
      return this.projectsCrud.getById(projectId);
    } catch {
      return undefined;
    }
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
    scenarioIds: string[],
    cloning: boolean,
  ): Promise<
    Either<
      typeof forbiddenError | typeof projectNotFound,
      ExportProjectCommandResult
    >
  > {
    await this.blockGuard.ensureThatProjectIsNotBlocked(projectId);

    const canExportProject = await this.projectAclService.canExportProject(
      userId,
      projectId,
    );

    if (!cloning && !canExportProject) return left(forbiddenError);

    const canCloneProject =
      !cloning ||
      (cloning && (await this.projectAclService.canCloneProject(userId)));

    if (!canCloneProject) return left(forbiddenError);

    const res = await this.commandBus.execute(
      new ExportProject(
        new ResourceId(projectId),
        scenarioIds,
        new UserId(userId),
        cloning,
      ),
    );

    return right(res);
  }

  async clone(
    exportId: ExportId,
    userId: UserId,
  ): Promise<
    Either<
      | typeof exportNotFound
      | typeof exportResourceKindIsNotProject
      | typeof exportIsNotStandalone
      | typeof projectNotFoundForExport
      | typeof projectIsNotPublished
      | ImportProjectError,
      ImportProjectCommandResult
    >
  > {
    const exportInstance = await this.exportRepository.find(exportId);
    if (!exportInstance) return left(exportNotFound);
    if (!exportInstance.isForProject())
      return left(exportResourceKindIsNotProject);
    if (exportInstance.importResourceId) return left(exportIsNotStandalone);

    const project = await this.find(exportInstance.resourceId.value);
    if (!project) return left(projectNotFoundForExport);
    if (!project.isPublic) return left(projectIsNotPublished);

    return this.commandBus.execute(new ImportProject(exportId, userId));
  }

  async remove(
    projectId: string,
    userId: string,
  ): Promise<Either<Permit | DeleteProjectFailed, true>> {
    await this.blockGuard.ensureThatProjectIsNotBlocked(projectId);

    if (!(await this.projectAclService.canDeleteProject(userId, projectId))) {
      return left(false);
    }

    return this.commandBus.execute(new DeleteProject(projectId));
  }

  async getJobStatusFor(projectId: string, info: ProjectsRequest) {
    await this.projectsCrud.getById(projectId, undefined, info);
    return await this.jobStatusService.getJobStatusFor(projectId);
  }

  async startLegacyProjectImport(
    projectName: string,
    userId: string,
    description?: string,
  ): Promise<
    Either<
      typeof forbiddenError | StartLegacyProjectImportError,
      StartLegacyProjectImportResult
    >
  > {
    const userCanCreateProject = await this.projectAclService.canCreateProject(
      userId,
    );

    if (!userCanCreateProject) {
      return left(forbiddenError);
    }

    return this.commandBus.execute(
      new StartLegacyProjectImport(
        projectName,
        new UserId(userId),
        description,
      ),
    );
  }

  async addFileToLegacyProjectImport(
    projectId: string,
    file: Express.Multer.File,
    fileType: LegacyProjectImportFileType,
    userIdentifier: string,
  ): Promise<
    Either<AddFileToLegacyProjectImportHandlerErrors, LegacyProjectImportFileId>
  > {
    const resourceId = new ResourceId(projectId);
    const userId = new UserId(userIdentifier);

    return this.commandBus.execute(
      new AddFileToLegacyProjectImport(
        resourceId,
        file.buffer,
        fileType,
        userId,
      ),
    );
  }

  async deleteFileFromLegacyProjectImport(
    projectId: string,
    fileId: string,
    userIdentifier: string,
  ): Promise<Either<DeleteFileFromLegacyProjectImportHandlerErrors, true>> {
    const resourceId = new ResourceId(projectId);
    const legacyProjectImportFileId = new LegacyProjectImportFileId(fileId);
    const userId = new UserId(userIdentifier);

    return this.commandBus.execute(
      new DeleteFileFromLegacyProjectImport(
        resourceId,
        legacyProjectImportFileId,
        userId,
      ),
    );
  }

  async cancelLegacyProject(projectId: string, userId: string) {
    return this.commandBus.execute(
      new CancelLegacyProjectImport(
        new ResourceId(projectId),
        new UserId(userId),
      ),
    );
  }

  async runLegacyProject(
    projectId: string,
    solutionsAreLocked: boolean,
    userId: string,
  ): Promise<
    Either<
      | UpdateSolutionsAreLockedError
      | RunLegacyProjectImportError
      | typeof blmCreationFailure,
      true
    >
  > {
    const legacyProjectImportOrError = await this.legacyProjectImportRepository.find(
      new ResourceId(projectId),
    );

    if (isLeft(legacyProjectImportOrError)) return legacyProjectImportOrError;

    const { scenarioId } = legacyProjectImportOrError.right.toSnapshot();

    const updateSolutionsAreLocked = await this.commandBus.execute(
      new UpdateSolutionsAreLocked(
        new ResourceId(projectId),
        solutionsAreLocked,
      ),
    );
    if (isLeft(updateSolutionsAreLocked)) return updateSolutionsAreLocked;

    await this.commandBus.execute(new SetProjectBlm(projectId));

    const setScenarioBlmValuesOrError = await this.commandBus.execute(
      new CreateInitialScenarioBlm(scenarioId, projectId),
    );

    if (isLeft(setScenarioBlmValuesOrError)) return setScenarioBlmValuesOrError;

    return this.commandBus.execute(
      new RunLegacyProjectImport(new ResourceId(projectId), new UserId(userId)),
    );
  }

  async getLegacyProjectImportErrors(projectId: string, userId: string) {
    return this.queryBus.execute(
      new GetLegacyProjectImportErrors(
        new ResourceId(projectId),
        new UserId(userId),
      ),
    );
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
      | GetArchiveLocationFailure
      | typeof notAllowed
      | typeof projectNotFound
      | typeof exportNotFound,
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
      typeof exportNotFound | typeof forbiddenError | typeof projectNotFound,
      { exportId: string; userId: string; createdAt: Date }
    >
  > {
    const response = await this.assertProject(projectId, { id: userId });

    if (isLeft(response)) return left(projectNotFound);

    const canDownloadExport = await this.projectAclService.canDownloadProjectExport(
      userId,
      projectId,
    );

    if (!canDownloadExport) return left(forbiddenError);

    const [latestExport] = await this.exportRepository.findLatestExportsFor(
      projectId,
      1,
      {
        isFinished: true,
        isLocal: true,
        isStandalone: true,
      },
    );

    if (!latestExport) return left(exportNotFound);

    return right({
      exportId: latestExport.id.value,
      userId: latestExport.toSnapshot().ownerId,
      createdAt: latestExport.toSnapshot().createdAt,
    });
  }

  async getLatestExportsForProject(
    projectId: string,
    userId: string,
  ): Promise<
    Either<
      typeof exportNotFound | typeof forbiddenError | typeof projectNotFound,
      { exportId: string; userId: string; createdAt: Date }[]
    >
  > {
    const response = await this.assertProject(projectId, { id: userId });

    if (isLeft(response)) return left(projectNotFound);

    const canDownloadExport = await this.projectAclService.canDownloadProjectExport(
      userId,
      projectId,
    );

    if (!canDownloadExport) return left(forbiddenError);

    const latestExports = await this.exportRepository.findLatestExportsFor(
      projectId,
      5,
      {
        isFinished: true,
        isLocal: true,
        isStandalone: true,
      },
    );

    return right(
      latestExports.map((exportInstance) => ({
        exportId: exportInstance.id.value,
        userId: exportInstance.toSnapshot().ownerId,
        createdAt: exportInstance.toSnapshot().createdAt,
      })),
    );
  }

  async findAllLocks(
    projectId: string,
    userId: string,
  ): Promise<Either<typeof forbiddenError, ScenarioLockResultPlural>> {
    return await this.projectAclService.findAllLocks(userId, projectId);
  }

  async importProjectFromZipFile(
    exportFile: Express.Multer.File,
    userId: string,
    projectName?: string,
  ): Promise<
    Either<
      | GenerateExportFromZipFileError
      | ImportProjectError
      | typeof forbiddenError,
      ImportProjectCommandResult
    >
  > {
    if (!(await this.projectAclService.canImportProject(userId))) {
      return left(forbiddenError);
    }

    const exportIdOrError = await this.commandBus.execute(
      new GenerateExportFromZipFile(exportFile, new UserId(userId)),
    );

    if (isLeft(exportIdOrError)) {
      return exportIdOrError;
    }

    const idsOrError = await this.commandBus.execute(
      new ImportProject(exportIdOrError.right, new UserId(userId), projectName),
    );

    if (isLeft(idsOrError)) {
      return idsOrError;
    }

    return right(idsOrError.right);
  }

  async getScenarioFrequencyComparisonMap(
    scenarioIdA: string,
    scenarioIdB: string,
    userId: string,
    configForWebshot: WebshotBasicPdfConfig,
  ): Promise<
    Either<
      | typeof forbiddenError
      | GetScenarioFailure
      | typeof unknownPdfWebshotError,
      stream.Readable
    >
  > {
    const scenarioA = await this.scenariosService.getById(scenarioIdA, {
      authenticatedUser: { id: userId },
    });
    const scenarioB = await this.scenariosService.getById(scenarioIdB, {
      authenticatedUser: { id: userId },
    });

    if (isLeft(scenarioA)) {
      return scenarioA;
    }

    if (isLeft(scenarioB)) {
      return scenarioB;
    }

    if (scenarioA.right.projectId !== scenarioB.right.projectId) {
      throw new BadRequestException(
        `Scenarios ${scenarioIdA} and ${scenarioIdB} are not in the same project.`,
      );
    }
    if (
      !(await this.projectAclService.canViewProject(
        userId,
        scenarioA.right.projectId,
      ))
    ) {
      return left(forbiddenError);
    }
    const webshotUrl = AppConfig.get('webshot.url') as string;

    /** @debt Refactor to use @nestjs/common's StreamableFile
     (https://docs.nestjs.com/techniques/streaming-files#streamable-file-class)
     after upgrading NestJS to v8. **/
    const pdfStream = await this.webshotService.getScenarioFrequencyComparisonMap(
      scenarioIdA,
      scenarioIdB,
      scenarioA.right.projectId,
      configForWebshot,
      webshotUrl,
    );

    return pdfStream;
  }

  /**
   * @todo: this is a good candidate for a new static method in class
   * Gids (static planningGidsFromAreaId()
   *
   **/
  private idToGid(gid: string): PlanningGids {
    const myArray = gid.split('.');
    return myArray.reduce((acc: {}, curr: string, idx: number) => {
      const key = idx === 0 ? 'countryId' : `adminAreaLevel${idx}Id`;
      return { ...acc, [key]: curr };
    }, {});
  }
}
