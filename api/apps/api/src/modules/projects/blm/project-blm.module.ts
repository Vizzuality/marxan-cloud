import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { BlmModule } from '@marxan-api/modules/blm';

import { SetProjectBlmHandler } from './set-project-blm-handler';
import { ProjectBlmSaga } from './project-blm.saga';
import { ChangeBlmRangeHandler } from './change-blm-range.handler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from '@marxan-api/modules/projects/project.api.entity';
import { DbConnections } from '@marxan-api/ormconfig.connections';

@Module({
  imports: [
    CqrsModule,
    BlmModule,
    TypeOrmModule.forFeature([Project]),
    TypeOrmModule.forFeature([], DbConnections.geoprocessingDB),
  ],
  providers: [SetProjectBlmHandler, ChangeBlmRangeHandler, ProjectBlmSaga],
})
export class ProjectBlmModule {}
