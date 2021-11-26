import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BlmModule } from '@marxan-api/modules/blm';
import { DbConnections } from '@marxan-api/ormconfig.connections';

import { SetProjectBlmHandler } from './set-project-blm-handler';
import { ProjectBlmSaga } from './project-blm.saga';
import { ChangeBlmRangeHandler } from './change-blm-range.handler';
import { Project } from '../project.api.entity';
import { PlanningUnitAreaFetcher } from '@marxan-api/modules/projects/blm/planning-unit-area-fetcher';

@Module({
  imports: [
    CqrsModule,
    BlmModule,
    TypeOrmModule.forFeature([Project]),
    TypeOrmModule.forFeature([], DbConnections.geoprocessingDB),
  ],
  providers: [
    SetProjectBlmHandler,
    ChangeBlmRangeHandler,
    ProjectBlmSaga,
    PlanningUnitAreaFetcher,
  ],
  exports: [BlmModule],
})
export class ProjectBlmModule {}
