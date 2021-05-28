import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkerModule } from '../../worker';
import { ShapefilesModule } from '../../shapefiles/shapefiles.module';
import { ProtectedArea } from '../protected-areas.geo.entity';

import { ProtectedAreaProcessor } from './protected-area-processor';
import { ProtectedAreaWorkerService } from './protected-area-worker.service';
import { GeometryExtractor } from './geometry-extractor';

@Module({
  imports: [
    WorkerModule,
    ShapefilesModule,
    TypeOrmModule.forFeature([ProtectedArea]),
  ],
  providers: [
    ProtectedAreaProcessor,
    ProtectedAreaWorkerService,
    GeometryExtractor,
  ],
})
export class ProtectedAreaWorkerModule {}
