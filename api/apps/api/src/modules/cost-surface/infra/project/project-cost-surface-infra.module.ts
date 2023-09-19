import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QueueApiEventsModule } from '../../../queue-api-events';
import { Project } from '@marxan-api/modules/projects/project.api.entity';
import {
  projectCostSurfaceEventsFactoryProvider,
  projectCostSurfaceQueueEventsProvider,
  projectCostSurfaceQueueProvider,
} from '@marxan-api/modules/cost-surface/infra/project/project-cost-surface-queue.provider';
import { ProjectCostSurfaceEventsHandler } from '@marxan-api/modules/cost-surface/infra/project/project-cost-surface-events.handler';
import { DeleteProjectHandler } from '@marxan-api/modules/projects/delete-project/delete-project.handler';
import { GeoFeature } from '@marxan-api/modules/geo-features/geo-feature.api.entity';

@Module({
  imports: [
    CqrsModule,
    QueueApiEventsModule,
    TypeOrmModule.forFeature([Project, GeoFeature]),
  ],
  providers: [
    projectCostSurfaceQueueProvider,
    projectCostSurfaceQueueEventsProvider,
    projectCostSurfaceEventsFactoryProvider,
    ProjectCostSurfaceEventsHandler,
    DeleteProjectHandler,
  ],
  exports: [
    projectCostSurfaceQueueProvider,
    projectCostSurfaceQueueEventsProvider,
    projectCostSurfaceEventsFactoryProvider,
  ],
})
export class ProjectCostSurfaceInfraModule {}
