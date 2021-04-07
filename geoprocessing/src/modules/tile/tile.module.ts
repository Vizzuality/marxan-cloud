import { Logger, Module } from '@nestjs/common';
import { TileService } from './tile.service';

const logger = new Logger('Vector tile module');

@Module({
  providers: [TileService],
  exports: [TileService],
})
export class TileModule {}
