import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProtectedAreasController } from './protected-areas.controller';
import { ProtectedArea } from './protected-area.geo.entity';
import { ProtectedAreasService } from './protected-areas.service';
import { apiConnections } from '../../ormconfig';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [ProtectedArea],
      apiConnections.geoprocessingDB.name,
    ),
  ],
  providers: [ProtectedAreasService],
  controllers: [ProtectedAreasController],
  exports: [ProtectedAreasService],
})
export class ProtectedAreasModule {}
