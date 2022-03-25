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

@CommandHandler(SetProjectGridFromShapefile)
export class SetProjectGridFromShapefileHandler
  implements IInferredCommandHandler<SetProjectGridFromShapefile> {
  constructor(
    @InjectRepository(Project) private readonly projects: Repository<Project>,
    private readonly events: ApiEventsService,
    @InjectEntityManager(DbConnections.geoprocessingDB)
    private readonly entityManager: EntityManager,
    private readonly eventBus: EventBus,
  ) {}

  async execute({
    projectId: project,
    planningAreaId,
    bbox,
  }: SetProjectGridFromShapefile): Promise<void> {
    const projectId = project.value;
    await this.events.create({
      kind: API_EVENT_KINDS.project__planningUnits__submitted__v1__alpha,
      topic: projectId,
      data: {
        source: `custom-grid`,
      },
    });

    await this.entityManager.transaction(async (manager) => {
      await manager
        .getRepository(ProjectsPuEntity)
        .update({ planningAreaId }, { projectId });
      await manager
        .getRepository(PlanningArea)
        .update({ id: planningAreaId }, { projectId });
    });
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
}
