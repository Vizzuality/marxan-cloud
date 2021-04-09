import { Module } from '@nestjs/common';

import { AdminAreasController } from './admin-areas.controller';
import { AdminAreasService } from './admin-areas.service';
import { TileModule } from 'src/modules/tile/tile.module';

@Module({
  imports: [TileModule],
  providers: [AdminAreasService],
  controllers: [AdminAreasController],
})
export class AdminAreasModule {}
