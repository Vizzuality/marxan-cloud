import { HttpModule, Module } from '@nestjs/common';
//import { TypeOrmModule } from '@nestjs/typeorm'; - when to use typeOrmModule vs HttpModule?

import { VectorTileService } from './vector-tile.service';

@Module({
  imports: [
    HttpModule.register({
      maxContentLength: 100000000,
    }),
  ],
  providers: [VectorTileService],
  exports: [VectorTileService],
})
export class VectorTileModule {}
