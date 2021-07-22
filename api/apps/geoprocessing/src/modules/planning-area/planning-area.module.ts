import { Module } from '@nestjs/common';
import { PlanningAreaRepositoryModule } from '@marxan/planning-area-repository';
import { ShapefilesModule } from '@marxan-geoprocessing/modules/shapefiles/shapefiles.module';
import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { PlanningAreaService } from './planning-area.service';
import { PlanningAreaController } from './planning-area.controller';
import { gcConfigProvider } from './garbage-collector-config';
import { PlanningAreaSerializer } from './planning-area.serializer';

@Module({
  imports: [
    PlanningAreaRepositoryModule.for(geoprocessingConnections.default.name),
    ShapefilesModule,
  ],
  providers: [PlanningAreaService, gcConfigProvider, PlanningAreaSerializer],
  controllers: [PlanningAreaController],
})
export class PlanningAreaModule {}
