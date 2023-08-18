import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { QueueApiEventsModule } from '@marxan-api/modules/queue-api-events';
import { ApiEventsModule } from '@marxan-api/modules/api-events';
import { ProtectedAreaService } from './protected-area.service';

import { SelectionChangeModule } from './selection/selection-change.module';
import { SelectionGetterModule } from './getter/selection-getter.module';
import { CleanupModule } from './cleanup';

@Module({
  imports: [
    QueueApiEventsModule,
    ApiEventsModule,
    CqrsModule,
    SelectionChangeModule,
    SelectionGetterModule,
    CleanupModule,
  ],
  providers: [ProtectedAreaService],
  exports: [ProtectedAreaService],
})
export class ProtectedAreaModule {}
