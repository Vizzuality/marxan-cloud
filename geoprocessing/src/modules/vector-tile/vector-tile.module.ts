import { Logger, Module } from '@nestjs/common';
import { TileServerService } from './vector-tile.service';

const logger = new Logger('Vector tile module');

const test = TileServerService;
logger.debug(test)

@Module({
  providers: [TileServerService],
  exports: [TileServerService],
})
export class VectorTileModule {}
