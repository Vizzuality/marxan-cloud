import { Module } from '@nestjs/common';
import { WorkerModule } from '../../worker';
import { ProtectedAreaProcessor } from './protected-area-processor';
import { ShapefilesModule } from '../../shapefiles/shapefiles.module';

@Module({
  imports: [WorkerModule, ShapefilesModule],
  providers: [ProtectedAreaProcessor],
})
export class ProtectedAreaWorkerModule {}
