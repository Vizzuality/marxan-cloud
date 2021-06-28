import { Module } from '@nestjs/common';
import { PlanningAreaRepositoryModule } from '@marxan/planning-area-repository';
import { ShapefilesModule } from '@marxan-geoprocessing/modules/shapefiles/shapefiles.module';
import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { PlanningAreaService } from './planning-area.service';
import { PlanningAreaController } from './planning-area.controller';
import { gcConfigProvider } from './garbage-collector-config';

@Module({
  imports: [
    PlanningAreaRepositoryModule.for(geoprocessingConnections.default.name),
    ShapefilesModule,
  ],
  providers: [PlanningAreaService, gcConfigProvider],
  controllers: [PlanningAreaController],
})
export class PlanningAreaModule {}
