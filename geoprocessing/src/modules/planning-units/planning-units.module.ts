import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TileModule } from 'src/modules/tile/tile.module';
import { PlanningUnitsProcessor } from './planning-units.worker';
import { PlanningUnitsGeom } from 'src/modules/planning-units/planning-units.geo.entity';
import { PlanningUnitsService } from './planning-units.service';
import { PlanningUnitsController } from './planning-units.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PlanningUnitsGeom]), TileModule],
  providers: [PlanningUnitsProcessor, PlanningUnitsService],
  controllers: [PlanningUnitsController],
  exports: [PlanningUnitsProcessor, PlanningUnitsService],
})
export class PlanningUnitsModule {}
