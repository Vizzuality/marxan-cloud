import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarxanExecutionMetadataGeoEntity } from '@marxan/marxan-output';
import { DbConnections } from '@marxan-api/ormconfig.connections';

import { OutputFilesService } from './output-files.service';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [MarxanExecutionMetadataGeoEntity],
      DbConnections.geoprocessingDB,
    ),
  ],
  providers: [OutputFilesService],
  exports: [OutputFilesService],
})
export class OutputFilesModule {}
