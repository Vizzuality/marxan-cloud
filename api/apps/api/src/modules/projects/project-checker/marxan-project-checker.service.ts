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
import { In, Repository } from 'typeorm';

@Injectable()
export class MarxanProjectChecker implements ProjectChecker {
  constructor(
    private readonly apiEvents: ApiEventsService,
    @InjectRepository(Project)
    private readonly repository: Repository<Project>,
    private readonly planningAreas: PlanningAreasService,
    private readonly scenarioChecker: ScenarioChecker,
  ) {}

  async hasPendingImports(
    projectId: string,
  ): Promise<Either<typeof doesntExist, boolean>> {
    throw new Error('Method not implemented.');
  }

  async hasPendingBlmCalibration(
    projectId: string,
  ): Promise<Either<typeof doesntExist, boolean>> {
    const project = await this.repository.findOne(projectId, {
      relations: ['scenarios'],
    });

    if (!project) {
      return left(doesntExist);
    }

    if (!project.scenarios) return right(false);

    const result = await Promise.all(
      project.scenarios.map((scenario) =>
        this.scenarioChecker.hasPendingBlmCalibration(scenario.id),
      ),
    );

    return right(result.some((hasPendingExport) => hasPendingExport));
  }

  async hasPendingMarxanRun(
    projectId: string,
  ): Promise<Either<typeof doesntExist, boolean>> {
    const project = await this.repository.findOne(projectId, {
      relations: ['scenarios'],
    });

    if (!project) {
      return left(doesntExist);
    }

    if (!project.scenarios) return right(false);

    const result = await Promise.all(
      project.scenarios.map((scenario) =>
        this.scenarioChecker.hasPendingMarxanRun(scenario.id),
      ),
    );

    return right(result.some((hasPendingMarxanRun) => hasPendingMarxanRun));
  }

  async hasPendingExports(
    projectId: string,
  ): Promise<Either<DoesntExist, boolean>> {
    const project = await this.repository.findOne(projectId);

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

    const pendingExportExists =
      exportEvent?.kind ===
      API_EVENT_KINDS.project__export__submitted__v1__alpha;

    return right(pendingExportExists);
  }

  async isProjectReady(
    projectId: string,
  ): Promise<Either<DoesntExist, boolean>> {
    const project = await this.repository.findOne(projectId);
    if (project === undefined) {
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
