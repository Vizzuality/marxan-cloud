import { ApiEventsService } from '@marxan-api/modules/api-events';
import { Project } from '@marxan-api/modules/projects/project.api.entity';
import { DbConnections } from '@marxan-api/ormconfig.connections';
import { ProjectsPuEntity } from '@marxan-jobs/planning-unit-geometry';
import { API_EVENT_KINDS } from '@marxan/api-events';
import { PlanningArea } from '@marxan/planning-area-repository/planning-area.geo.entity';
import { PlanningUnitSet } from '@marxan/planning-units-grid';
import { PlanningUnitGridShape as ProjectGridShape } from '@marxan/scenarios-planning-unit';
import {
  CommandHandler,
  EventBus,
  IInferredCommandHandler,
} from '@nestjs/cqrs';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { v4 } from 'uuid';
import { SetProjectGridFromShapefile } from './set-project-grid-from-shapefile.command';
import { CostSurfacePuDataEntity } from '@marxan/cost-surfaces';
import { CostRangeService } from '@marxan-api/modules/scenarios/cost-range-service';
import { isNil } from 'lodash';

@CommandHandler(SetProjectGridFromShapefile)
export class SetProjectGridFromShapefileHandler
  implements IInferredCommandHandler<SetProjectGridFromShapefile> {
  constructor(
    @InjectRepository(Project) private readonly projects: Repository<Project>,
    private readonly events: ApiEventsService,
    @InjectEntityManager(DbConnections.geoprocessingDB)
    private readonly entityManager: EntityManager,
    private readonly costRange: CostRangeService,
    private readonly eventBus: EventBus,
  ) {}

  async execute({
    projectId: project,
    costSurfaceId: costSurface,
    planningAreaId,
    bbox,
  }: SetProjectGridFromShapefile): Promise<void> {
    const projectId = project.value;
    const costSurfaceId: string = costSurface.value;
    await this.events.create({
      kind: API_EVENT_KINDS.project__planningUnits__submitted__v1__alpha,
      topic: projectId,
      data: {
        source: `custom-grid`,
      },
    });

    await this.entityManager.transaction(async (manager) => {
      if (
        !(await this.isPlanningAreaNotLinkedToAnyProjectYet(
          planningAreaId,
          manager,
        ))
      ) {
        throw new Error(
          `Planning area ${planningAreaId} is already linked to a project: no new project can be created using it as its own planning area.`,
        );
      }
      await manager
        .getRepository(ProjectsPuEntity)
        .update({ planningAreaId }, { projectId });
      await manager
        .getRepository(PlanningArea)
        .update({ id: planningAreaId }, { projectId });
      const puIds = await manager
        .getRepository(ProjectsPuEntity)
        .find({ where: { projectId } })
        .then((pu) => pu.map((p) => p.id));
      const costSurfaceRepository = manager.getRepository(
        CostSurfacePuDataEntity,
      );
      await Promise.all(
        puIds.map((puid) =>
          costSurfaceRepository.update(
            { projectsPuId: puid },
            { costSurfaceId },
          ),
        ),
      );
    });
    await this.costRange.updateCostSurfaceRange(costSurfaceId);
    await this.projects.update(
      {
        id: projectId,
      },
      {
        planningUnitGridShape: ProjectGridShape.FromShapefile,
        planningAreaGeometryId: planningAreaId,
        bbox,
      },
    );

    await this.events.createIfNotExists({
      kind: API_EVENT_KINDS.project__planningUnits__finished__v1__alpha,
      topic: projectId,
      externalId: v4(),
    });

    this.eventBus.publish(new PlanningUnitSet(projectId));
  }

  /**
   * When a custom planning area has just been uploaded (either as a planning
   * area shapefile or as a planning grid shapefile, from which we create the
   * planning area itself), it is not linked to any projects to start with.
   *
   * Only once a project is created (in apidb), we then set up its grid and
   * planning area from the previously-created planning area.
   *
   * However, planning areas where `project_id is null` are considered as
   * dangling from the garbage collector, so we create custom planning areas
   * initially with its `projectId` column set to the `id` of the planning area
   * record itself: this can be used as a proxy of the planning area not being
   * linked to any project.
   *
   * Once a project is created, we then update the planning area's `projectId`
   * to match the actual `id` of the new project. To avoid "double spending" of
   * a planning area (for example, if an API consumer issues more than one
   * request to create a project, supplying the same `planningAreaId`, for
   * whatever reason), we need to check that the planning area is not linked to
   * any project yet (therefore, that `id = projectId`), before linking it to a
   * project.
   */
  private async isPlanningAreaNotLinkedToAnyProjectYet(
    planningAreaId: string,
    transactionalEntityManager: EntityManager,
  ): Promise<boolean> {
    const planningArea = await transactionalEntityManager
      .getRepository(PlanningArea)
      .findOneBy({ id: planningAreaId, projectId: planningAreaId });
    return !isNil(planningArea);
  }
}
