import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { WorkerModule } from '../../worker';
import { ShapefilesModule } from '@marxan/shapefile-converter';
import { ProtectedArea } from '@marxan/protected-areas';

import { ProtectedAreaProcessor } from './protected-area-processor';
import { ProtectedAreaWorkerService } from './protected-area-worker.service';

@Module({
  imports: [
    CqrsModule,
    WorkerModule,
    ShapefilesModule,
    TypeOrmModule.forFeature([ProtectedArea]),
  ],
  providers: [ProtectedAreaProcessor, ProtectedAreaWorkerService],
})
export class ProtectedAreaWorkerModule {}
