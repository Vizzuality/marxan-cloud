<<<<<<< HEAD
import { Module } from '@nestjs/common';
import { TileService } from './tile.service';

=======
import { Logger, Module } from '@nestjs/common';
import { TileService } from './tile.service';

const logger = new Logger('Vector tile module');

>>>>>>> unification of mvt server and testing index html
@Module({
  providers: [TileService],
  exports: [TileService],
})
export class TileModule {}
