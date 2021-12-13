import { Module } from '@nestjs/common';
import { FileRepositoryModule } from '@marxan/files-repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';

import { ProjectMetadata } from './project-metadata';

@Module({
  imports: [
    FileRepositoryModule,
    TypeOrmModule.forFeature([], geoprocessingConnections.apiDB),
  ],
  providers: [ProjectMetadata],
})
export class PiecesExportersModule {}
