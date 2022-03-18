import { ConsoleLogger, Module, Scope } from '@nestjs/common';
import { TileService } from './tile.service';

@Module({
  providers: [
    TileService,
    {
      provide: ConsoleLogger,
      useClass: ConsoleLogger,
      scope: Scope.TRANSIENT,
    },
  ],
  exports: [TileService],
})
export class TileModule {}
