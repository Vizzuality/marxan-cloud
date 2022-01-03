import { Module } from '@nestjs/common';
import { FileRepositoryModule } from '@marxan/files-repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';

import { ProjectMetadata } from './project-metadata';
import { ProjectConfig } from './project-config';
import { PlanningAreaGadm } from './planning-area-gadm';
import { PlanningAreaCustomGrid } from './planning-area-custom-grid';
import { PlanningAreaCustom } from './planning-area-custom';

@Module({
  imports: [
    FileRepositoryModule,
    TypeOrmModule.forFeature([], geoprocessingConnections.apiDB),
  ],
  providers: [
    ProjectMetadata,
    ProjectConfig,
    PlanningAreaGadm,
    PlanningAreaCustom,
    PlanningAreaCustomGrid,
  ],
})
export class PiecesExportersModule {}
