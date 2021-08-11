import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FeaturesController } from './features.controller';
import { FeatureService } from './features.service';
import { TileModule } from '@marxan-geoprocessing/modules/tile/tile.module';
import { GeoFeatureGeometry } from '@marxan-geoprocessing/modules/features/features.geo.entity';
import { WorkerModule } from '@marxan-geoprocessing/modules/worker';
import {
  copyQueueNameProvider,
  copyWorkerBuilderProvider,
  copyQueueEventsProvider,
  splitQueueNameProvider,
  splitWorkerBuilderProvider,
  splitQueueEventsProvider,
  stratificationQueueNameProvider,
  stratificationWorkerBuilderProvider,
  stratificationQueueEventsProvider,
} from './processing/worker-builder.providers';
import { ProcessingWorker } from './processing/processing.worker';

@Module({
  imports: [
    TypeOrmModule.forFeature([GeoFeatureGeometry]),
    TileModule,
    WorkerModule,
  ],
  providers: [
    FeatureService,
    copyQueueNameProvider,
    copyWorkerBuilderProvider,
    copyQueueEventsProvider,
    splitQueueNameProvider,
    splitWorkerBuilderProvider,
    splitQueueEventsProvider,
    stratificationQueueNameProvider,
    stratificationWorkerBuilderProvider,
    stratificationQueueEventsProvider,
    ProcessingWorker,
  ],
  controllers: [FeaturesController],
  exports: [FeatureService],
})
export class FeaturesModule {}
