import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { Either, left, right } from 'fp-ts/Either';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { intersection } from 'lodash';
import { isDefined } from '@marxan/utils';
import { CommandBus, EventBus } from '@nestjs/cqrs';

import { JobInput, JobOutput, ProtectedArea } from '@marxan/protected-areas';
import { ProjectSnapshot } from '@marxan/projects';
import { IUCNCategory } from '@marxan/iucn';
import { API_EVENT_KINDS } from '@marxan/api-events';
import { apiConnections } from '@marxan-api/ormconfig';
import { ApiEventsService } from '@marxan-api/modules/api-events';
import { PlanningAreasService } from '@marxan-api/modules/planning-areas';
import { AdminAreasService } from '@marxan-api/modules/admin-areas/admin-areas.service';

import { ScenarioProtectedArea } from './scenario-protected-area';
import { scenarioProtectedAreaQueueToken } from './queue.providers';

import { ProtectedAreaKind } from './protected-area.kind';
import { SelectProtectedArea } from '@marxan-api/modules/scenarios/protected-area/select-protected-area';
import { Scenario } from '@marxan-api/modules/scenarios/scenario.api.entity';
import { ProtectedAreaUnlinked } from './protected-area-unlinked';

import { ScenarioPlanningUnitsProtectedStatusCalculatorService } from '@marxan/scenarios-planning-unit';
import { CalculatePlanningUnitsProtectionLevel } from '@marxan-api/modules/planning-units-protection-level';

export const submissionFailed = Symbol(
  `System could not submit the async job.`,
);

export const invalidProtectedAreaId = Symbol(`invalid protected area id`);

export type ChangeProtectedAreasError = typeof invalidProtectedAreaId;

@Injectable()
export class ProtectedAreaService {
  constructor(
    @Inject(scenarioProtectedAreaQueueToken)
    private readonly queue: Queue<JobInput, JobOutput>,
    private readonly apiEvents: ApiEventsService,
    @InjectRepository(ProtectedArea, apiConnections.geoprocessingDB.name)
    protected readonly repository: Repository<ProtectedArea>,
    @InjectRepository(Scenario)
    protected readonly scenarios: Repository<Scenario>,
    private readonly planningArea: PlanningAreasService,
    private readonly events: EventBus,
    private readonly commands: CommandBus,
    private readonly planningUnitsStatusCalculatorService: ScenarioPlanningUnitsProtectedStatusCalculatorService,
  ) {}

  async addShapeFor(
    projectId: string,
    scenarioId: string,
    shapefile: JobInput['shapefile'],
    name: JobInput['name'],
  ): Promise<Either<typeof submissionFailed, true>> {
    const job = await this.queue.add(`add-protected-area`, {
      projectId,
      scenarioId,
      shapefile,
      name,
    });

    // bad typing? may happen that job wasn't added
    if (!job) {
      return left(submissionFailed);
    }

    const kind = API_EVENT_KINDS.project__protectedAreas__submitted__v1__alpha;
    try {
      await this.apiEvents.create({
        externalId: job.id + kind,
        kind,
        topic: scenarioId,
        data: {
          kind,
          scenarioId,
          projectId,
          name,
        },
      });
    } catch (error: unknown) {
      return left(submissionFailed);
    }

    return right(true);
  }

  async selectFor(
    scenario: {
      id: string;
      protectedAreaIds: string[];
      threshold: number;
    },
    project: ProjectSnapshot,
    newSelection: SelectProtectedArea[],
  ): Promise<Either<ChangeProtectedAreasError, ScenarioProtectedArea[]>> {
    const currentSelection = await this.getFor(scenario, project);

    const idsToAdd: string[] = [];
    const idsToRemove: string[] = [];
    const projectScopedIdsRemoved: string[] = [];

    // TODO refactor to pieces

    for (const change of newSelection) {
      const entry = currentSelection.find((item) => item.id === change.id);
      if (!entry) {
        return left(invalidProtectedAreaId);
      }

      if (entry.selected !== change.selected) {
        if (change.selected) {
          idsToAdd.push(change.id);
        } else {
          idsToRemove.push(change.id);

          if (entry.kind === ProtectedAreaKind.Project) {
            projectScopedIdsRemoved.push(change.id);
          }
        }
      }
    }

    await this.scenarios.update(
      {
        id: scenario.id,
      },
      {
        protectedAreaFilterByIds: idsToAdd,
        wdpaThreshold: scenario.threshold,
      },
    );

    if (idsToAdd.length > 0 || idsToRemove.length > 0) {
      await this.planningUnitsStatusCalculatorService.calculatedProtectionStatusForPlanningUnitsIn(
        {
          id: scenario.id,
          threshold: scenario.threshold,
        },
      );
      await this.commands.execute(
        new CalculatePlanningUnitsProtectionLevel(scenario.id, idsToAdd),
      );
    }

    // let some service to pick up and verify if anyone still uses it, maybe
    // schedule automatic removal
    if (projectScopedIdsRemoved.length > 0) {
      projectScopedIdsRemoved.forEach((id) =>
        this.events.publish(new ProtectedAreaUnlinked(id, project.id)),
      );
    }

    return right([]);
  }

  async getFor(
    scenario: {
      id: string;
      protectedAreaIds: string[];
    },
    project: ProjectSnapshot,
  ): Promise<ScenarioProtectedArea[]> {
    const { areas, categories } = await this.getGlobalProtectedAreas(project);

    const projectCustomAreas = await this.repository.find({
      where: {
        projectId: project.id,
      },
    });

    return [
      ...categories.map((category) => ({
        name: category,
        id: category,
        kind: ProtectedAreaKind.Global,
        selected:
          intersection(scenario.protectedAreaIds, areas[category] ?? [])
            .length > 0,
      })),
      ...projectCustomAreas.map((area) => ({
        name: area.fullName ?? '',
        id: area.id,
        kind: ProtectedAreaKind.Project,
        selected: scenario.protectedAreaIds.includes(area.id),
      })),
    ];
  }

  async getGlobalProtectedAreas(
    project: Pick<
      ProjectSnapshot,
      | 'countryId'
      | 'adminAreaLevel1'
      | 'adminAreaLevel2'
      | 'adminAreaRegion'
      | 'customPlanningArea'
    >,
  ): Promise<{
    categories: string[];
    areas: Record<string, string[]>;
  }> {
    const query = this.repository
      .createQueryBuilder('wdpa')
      .select(`iucn_cat`, `iucnCategory`)
      .distinct(true);

    // debt: duplicated from protected-areas.crud
    // debt: possibly remove it at all, we have all gid's
    if (project?.adminAreaRegion) {
      const level = AdminAreasService.levelFromId(project.adminAreaRegion);
      let whereClause: string;
      if (level === 0) {
        whereClause = `gid_0 = '${project.countryId}' and gid_1 is null and gid_2 is null`;
      } else if (level === 1) {
        whereClause = `gid_0 = '${project.countryId}' and gid_1 = '${project.adminAreaLevel1}' and gid_2 is null`;
      } else if (level === 2) {
        whereClause = `gid_0 = '${project.countryId}' and gid_1 = '${project.adminAreaLevel1}' and gid_2 = '${project.adminAreaLevel2}'`;
      } else {
        // debt: extract validation to standalone function
        throw new BadRequestException(
          'An invalid administrative area id may have been provided.',
        );
      }
      query.andWhere(
        `st_intersects(the_geom, (select the_geom from admin_regions WHERE ${whereClause}))`,
      );
    }

    if (project?.customPlanningArea) {
      query.andWhere(`st_intersects(the_geom, (select the_geom from planning_areas a
        WHERE a.id = '${project.customPlanningArea}'))`);
    }

    const wdpaCategories = (await query.getRawMany())
      .map((area) => area.iucnCategory)
      .filter(isDefined);

    if (wdpaCategories.length === 0) {
      return {
        categories: [],
        areas: {},
      };
    }

    const res = await this.planningArea.locatePlanningAreaEntity({
      countryId: project.countryId,
      adminAreaLevel1Id: project.adminAreaLevel1,
      adminAreaLevel2Id: project.adminAreaLevel2,
      planningAreaGeometryId: project.customPlanningArea,
    });

    if (!res) {
      return {
        categories: [],
        areas: {},
      };
    }

    const wdpaAreas = await this.findAllWDPAProtectedAreasInPlanningAreaByIUCNCategory(
      res.id,
      res.tableName,
      wdpaCategories,
    );

    /**
     * There may be multiple WDPA Areas per single WDPA Category
     * for example
     *
     * GEOM_001 'V'
     * GEOM_002 'V'
     * GEOM_003 'V'
     * ...
     *
     */

    const areas: Record<string, string[]> = {};
    for (const area of wdpaAreas) {
      if (!area.iucnCategory) continue;
      areas[area.iucnCategory] ??= [];
      areas[area.iucnCategory].push(area.id);
    }
    return {
      categories: wdpaCategories,
      areas,
    };
  }

  private async findAllWDPAProtectedAreasInPlanningAreaByIUCNCategory(
    planningAreaId: string,
    planningAreaTableName: string,
    iucnCategories: IUCNCategory[],
  ): Promise<ProtectedArea[]> {
    return await this.repository
      .createQueryBuilder(`protected_area`)
      .where(
        `protected_area.iucn_cat IN (:...iucnCategories)
        AND st_intersects(protected_area.the_geom,
        (select the_geom from ${planningAreaTableName} pa WHERE pa.id = :planningAreaId));`,
        { planningAreaId, iucnCategories },
      )
      .getMany();
  }
}
