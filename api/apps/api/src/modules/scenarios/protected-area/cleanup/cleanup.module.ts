import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { ProtectedAreaUnlinkedSaga } from './protected-area-unlinked.saga';
import { CollectGarbageHandler } from './collect-garbage.handler';

@Module({
  imports: [CqrsModule],
  providers: [ProtectedAreaUnlinkedSaga, CollectGarbageHandler],
})
export class CleanupModule {}
