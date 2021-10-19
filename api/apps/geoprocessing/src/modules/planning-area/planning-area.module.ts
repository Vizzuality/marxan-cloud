import { Module } from '@nestjs/common';
import { PlanningAreaRepositoryModule } from '@marxan/planning-area-repository';
import { ShapefilesModule } from '@marxan/shapefile-converter';
import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { PlanningAreaService } from './planning-area.service';
import { PlanningAreaController } from './planning-area.controller';
import { gcConfigProvider } from './garbage-collector-config';
import { PlanningAreaSerializer } from './planning-area.serializer';
import { PlanningUnitsGridProcessor } from './planning-units-grid/planning-units-grid.processor';

@Module({
  imports: [
    PlanningAreaRepositoryModule.for(geoprocessingConnections.default.name),
    ShapefilesModule,
  ],
  providers: [
    PlanningAreaService,
    gcConfigProvider,
    PlanningAreaSerializer,
    PlanningUnitsGridProcessor,
  ],
  controllers: [PlanningAreaController],
})
export class PlanningAreaModule {}
