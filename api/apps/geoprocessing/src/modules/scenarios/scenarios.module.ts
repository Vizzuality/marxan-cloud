import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ScenariosController } from './scenarios.controller';
import { ScenariosService } from './scenarios.service';
import { TileModule } from '@marxan-geoprocessing/modules/tile/tile.module';
import { ScenariosPuPaDataGeo } from '@marxan/scenarios-planning-unit/scenarios-pu-pa-data.geo.entity';


@Module({
  imports: [
    forwardRef(() =>TypeOrmModule.forFeature([ScenariosPuPaDataGeo])),
    TileModule,
  ],
  providers: [ScenariosService],
  controllers: [ScenariosController],
  exports: [ScenariosService, TypeOrmModule],
})
export class ScenariosModule {}
