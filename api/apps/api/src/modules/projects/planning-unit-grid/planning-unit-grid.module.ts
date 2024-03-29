import { Module } from '@nestjs/common';
import { QueueApiEventsModule } from '@marxan-api/modules/queue-api-events';
import { ApiEventsModule } from '@marxan-api/modules/api-events';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { DbConnections } from '@marxan-api/ormconfig.connections';
import { Project } from '@marxan-api/modules/projects/project.api.entity';
import { SetProjectGridFromShapefileHandler } from './set-project-grid-from-shapefile.handler';
import { CostSurfaceModule } from '@marxan-api/modules/cost-surface/cost-surface.module';

@Module({
  imports: [
    QueueApiEventsModule,
    ApiEventsModule,
    CqrsModule,
    TypeOrmModule.forFeature([Project]),
    TypeOrmModule.forFeature([], DbConnections.geoprocessingDB),
    CostSurfaceModule,
  ],
  providers: [SetProjectGridFromShapefileHandler],
  exports: [],
})
export class PlanningUnitGridModule {}
