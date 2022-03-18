import { ConsoleLogger, Module, Scope } from '@nestjs/common';
import { PlanningAreaRepositoryModule } from '@marxan/planning-area-repository';

import { ShapefilesModule } from '@marxan/shapefile-converter';
import { geoprocessingConnections } from '@marxan-geoprocessing/ormconfig';
import { PlanningAreaService } from './planning-area.service';
import { PlanningAreaController } from './planning-area.controller';
import { gcConfigProvider } from './garbage-collector-config';
import { PlanningAreaSerializer } from './planning-area.serializer';
import { PlanningUnitsGridProcessor } from './planning-units-grid/planning-units-grid.processor';
import { PlanningAreaTilesService } from './planning-area-tiles/planning-area-tiles.service';
import { PlanningAreaGridTilesService } from './planning-units-grid/planning-area-grid-tiles.service';
import { TileModule } from '@marxan-geoprocessing/modules/tile/tile.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlanningArea } from '@marxan/planning-area-repository/planning-area.geo.entity';
import { PlanningUnitsGeom } from '@marxan-jobs/planning-unit-geometry';
import { PlanningAreaGarbageCollector } from './planning-area-garbage-collector.service';

@Module({
  imports: [
    PlanningAreaRepositoryModule.for(geoprocessingConnections.default.name),
    TypeOrmModule.forFeature([PlanningArea]),
    TypeOrmModule.forFeature([PlanningUnitsGeom]),
    ShapefilesModule,
    TileModule,
  ],
  providers: [
    PlanningAreaService,
    gcConfigProvider,
    PlanningAreaSerializer,
    PlanningUnitsGridProcessor,
    PlanningAreaTilesService,
    PlanningAreaGridTilesService,
    PlanningAreaGarbageCollector,
    ConsoleLogger,
  ],
  controllers: [PlanningAreaController],
})
export class PlanningAreaModule {}
