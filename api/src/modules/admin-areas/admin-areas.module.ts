import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AdminAreasController } from './admin-areas.controller';
import { AdminArea } from './admin-area.geo.entity';
import { AdminAreasService } from './admin-areas.service';
import { apiConnections } from '../../ormconfig';

@Module({
  imports: [
    TypeOrmModule.forFeature([AdminArea], apiConnections.geoprocessingDB.name),
  ],
  providers: [AdminAreasService],
  controllers: [AdminAreasController],
  exports: [AdminAreasService],
})
export class AdminAreasModule {}
