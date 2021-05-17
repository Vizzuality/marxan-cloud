import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TileModule } from 'src/modules/tile/tile.module';
import { PlanningUnitsProcessor } from './planning-units.worker';
import { PlanningUnitsController } from './planning-units.controller';
import { ShapefileService } from '../shapefiles/shapefiles.service';
import { PlanningUnitsGeom } from 'src/modules/planning-units/planning-units.geo.entity';
import { PlanningUnitsService } from './planning-units.service';
import { FileService } from '../files/files.service';

import { WorkerModule } from '../worker/worker.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PlanningUnitsGeom]),
    TileModule,
    WorkerModule.register({
      name: 'planning-units',
      worker: __dirname + '/planning-units.job.ts',
    }),
  ],
  providers: [
    PlanningUnitsProcessor,
    ShapefileService,
    FileService,
    PlanningUnitsService,
    Logger,
  ],
  controllers: [PlanningUnitsController],
  exports: [PlanningUnitsProcessor, PlanningUnitsService],
})
export class PlanningUnitsModule {}
