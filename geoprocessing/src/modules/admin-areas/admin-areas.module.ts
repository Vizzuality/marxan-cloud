import { Logger, Module } from '@nestjs/common';
// import { TypeOrmModule } from '@nestjs/typeorm';

import { AdminAreasController } from './admin-areas.controller';
//import { AdminArea } from './admin-areas.geo.entity';
import { AdminAreasService } from './admin-areas.service';
import { TileModule } from 'modules/tile/tile.module';

const logger = new Logger('admin-areas');

logger.debug(TileModule);

@Module({
  imports: [TileModule],
  providers: [AdminAreasService],
  controllers: [AdminAreasController],
})
export class AdminAreasModule {}
