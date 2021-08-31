import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { WorkerModule } from '../../worker';
import { ShapefilesModule } from '@marxan/shapefile-converter';
import { ProtectedArea } from '../protected-areas.geo.entity';

import { ProtectedAreaProcessor } from './protected-area-processor';
import { ProtectedAreaWorkerService } from './protected-area-worker.service';
import { GeometryExtractor } from './geometry-extractor';

@Module({
  imports: [
    CqrsModule,
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
