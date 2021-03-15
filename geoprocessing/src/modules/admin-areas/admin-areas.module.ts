import {Logger, Module } from '@nestjs/common';
// import { TypeOrmModule } from '@nestjs/typeorm';

import { AdminAreasController } from './admin-areas.controller';
//import { AdminArea } from './admin-areas.geo.entity';
import { AdminAreasService } from './admin-areas.service';
import { VectorTileModule } from 'modules/vector-tile/vector-tile.module';

const logger = new Logger('admin-areas');

logger.debug(VectorTileModule)

@Module({
  imports: [
     VectorTileModule,
  ],
  providers: [AdminAreasService],
  controllers: [AdminAreasController],
})
export class AdminAreasModule {}
