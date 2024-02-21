import { ApiEventsService } from '@marxan-api/modules/api-events';
import { PlanningAreasService } from '@marxan-api/modules/planning-areas/planning-areas.service';
import {
  doesntExist,
  DoesntExist,
  ProjectChecker,
} from '@marxan-api/modules/projects/project-checker/project-checker.service';
import { Project } from '@marxan-api/modules/projects/project.api.entity';
import { ScenarioChecker } from '@marxan-api/modules/scenarios/scenario-checker/scenario-checker.service';
import { API_EVENT_KINDS } from '@marxan/api-events';
import { isDefined } from '@marxan/utils';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Either, left, right } from 'fp-ts/Either';
import { isRight } from 'fp-ts/lib/These';
import { In, Repository } from 'typeorm';
import { GeoFeature } from '@marxan-api/modules/geo-features/geo-feature.api.entity';
import { JobStatus } from '@marxan-api/modules/scenarios/scenario.api.entity';

@Injectable()
export class MarxanProjectChecker implements ProjectChecker {
  constructor(
    private readonly apiEvents: ApiEventsService,
    @InjectRepository(Project)
    private readonly repository: Repository<Project>,
    @InjectRepository(GeoFeature)
    private readonly featureRepo: Repository<GeoFeature>,
    private readonly planningAreas: PlanningAreasService,
    private readonly scenarioChecker: ScenarioChecker,
  ) {}

  async hasPendingImports(
    projectId: string,
  ): Promise<Either<typeof doesntExist, boolean>> {
    const project = await this.repository.findOne({
      where: { id: projectId },
      relations: { scenarios: true },
    });

    if (!project) {
      return left(doesntExist);
    }

    const importEvent = await this.apiEvents
      .getLatestEventForTopic({
        topic: projectId,
        kind: In([
          API_EVENT_KINDS.project__import__finished__v1__alpha,
          API_EVENT_KINDS.project__import__failed__v1__alpha,
          API_EVENT_KINDS.project__import__submitted__v1__alpha,
        ]),
      })
      .catch(this.createNotFoundHandler());

    const projectPendingImport =
      importEvent?.kind ===
      API_EVENT_KINDS.project__import__submitted__v1__alpha;

    if (!project.scenarios || projectPendingImport)
      return right(projectPendingImport);

    const results = await Promise.all(
      project.scenarios.map(async (scenario) => {
        const result = await this.scenarioChecker.hasPendingImport(scenario.id);
        return isRight(result) ? result.right : false;
      }),
    );

    return right(
      projectPendingImport ||
        results.some((scenarioPendingExport) => scenarioPendingExport),
    );
  }

  async hasPendingExports(
    projectId: string,
  ): Promise<Either<DoesntExist, boolean>> {
    const project = await this.repository.findOne({
      where: { id: projectId },
      relations: { scenarios: true },
    });

    if (!project) {
      return left(doesntExist);
    }

    const exportEvent = await this.apiEvents
      .getLatestEventForTopic({
        topic: projectId,
        kind: In([
          API_EVENT_KINDS.project__export__finished__v1__alpha,
          API_EVENT_KINDS.project__export__failed__v1__alpha,
          API_EVENT_KINDS.project__export__submitted__v1__alpha,
        ]),
      })
      .catch(this.createNotFoundHandler());

    const projectPendingExport =
      exportEvent?.kind ===
      API_EVENT_KINDS.project__export__submitted__v1__alpha;

    if (!project.scenarios || projectPendingExport)
      return right(projectPendingExport);

    const results = await Promise.all(
      project.scenarios.map(async (scenario) => {
        const result = await this.scenarioChecker.hasPendingExport(scenario.id);
        return isRight(result) ? result.right : false;
      }),
    );

    return right(
      projectPendingExport ||
        results.some((scenarioPendingExport) => scenarioPendingExport),
    );
  }

  async hasPendingBlmCalibration(
    projectId: string,
  ): Promise<Either<typeof doesntExist, boolean>> {
    const project = await this.repository.findOne({
      where: { id: projectId },
      relations: { scenarios: true },
    });

    if (!project) {
      return left(doesntExist);
    }

    if (!project.scenarios) return right(false);

    const results = await Promise.all(
      project.scenarios.map(async (scenario) => {
        const result = await this.scenarioChecker.hasPendingBlmCalibration(
          scenario.id,
        );
        return isRight(result) ? result.right : false;
      }),
    );

    return right(results.some((hasPendingExport) => hasPendingExport));
  }

  async hasPendingMarxanRun(
    projectId: string,
  ): Promise<Either<typeof doesntExist, boolean>> {
    const project = await this.repository.findOne({
      where: { id: projectId },
      relations: { scenarios: true },
    });

    if (!project) {
      return left(doesntExist);
    }

    if (!project.scenarios) return right(false);

    const results = await Promise.all(
      project.scenarios.map(async (scenario) => {
        const result = await this.scenarioChecker.hasPendingMarxanRun(
          scenario.id,
        );
        return isRight(result) ? result.right : false;
      }),
    );

    return right(results.some((hasPendingMarxanRun) => hasPendingMarxanRun));
  }

  async hasPendingFeatures(
    projectId: string,
  ): Promise<Either<DoesntExist, boolean>> {
    const project = await this.repository.findOne({
      where: { id: projectId },
      relations: { scenarios: true },
    });

    if (!project) {
      return left(doesntExist);
    }

    const pendingFeatures = await this.featureRepo.count({
      where: { projectId, creationStatus: JobStatus.running },
    });

    return right(pendingFeatures > 0);
  }

  async isProjectReady(
    projectId: string,
  ): Promise<Either<DoesntExist, boolean>> {
    const project = await this.repository.findOne({
      where: { id: projectId },
    });
    if (!isDefined(project)) {
      return left(doesntExist);
    }
    const planningUnitEvent = await this.apiEvents
      .getLatestEventForTopic({
        topic: projectId,
        kind: In([
          API_EVENT_KINDS.project__planningUnits__failed__v1__alpha,
          API_EVENT_KINDS.project__planningUnits__finished__v1__alpha,
          API_EVENT_KINDS.project__planningUnits__submitted__v1__alpha,
        ]),
      })
      .catch(this.createNotFoundHandler());
    const gridEvent = await this.apiEvents
      .getLatestEventForTopic({
        topic: projectId,
        kind: In([
          API_EVENT_KINDS.project__grid__failed__v1__alpha,
          API_EVENT_KINDS.project__grid__finished__v1__alpha,
          API_EVENT_KINDS.project__grid__submitted__v1__alpha,
        ]),
      })
      .catch(this.createNotFoundHandler());
    return right(
      (await this.hasRequiredPlanningArea(project)) &&
        planningUnitEvent?.kind ===
          API_EVENT_KINDS.project__planningUnits__finished__v1__alpha &&
        (gridEvent === undefined ||
          gridEvent.kind ===
            API_EVENT_KINDS.project__grid__finished__v1__alpha),
    );
  }

  private createNotFoundHandler() {
    return (error: unknown) => {
      if (!(error instanceof NotFoundException)) throw error;
      return undefined;
    };
  }

  private async hasRequiredPlanningArea(project: Project): Promise<boolean> {
    const area = await this.planningAreas.locatePlanningAreaEntity(project);
    return isDefined(area);
  }
}
