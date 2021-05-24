import { Module } from '@nestjs/common';
import { TileService } from './tile.service';

@Module({
  providers: [TileService],
  exports: [TileService],
})
export class TileModule {}
