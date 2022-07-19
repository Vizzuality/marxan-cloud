import { apiConnections } from '@marxan-api/ormconfig';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExportCleanupService } from './export-cleanup.service';

@Module({
  imports: [TypeOrmModule.forFeature([], apiConnections.default)],
  providers: [ExportCleanupService],
  exports: [ExportCleanupService],
})
export class ExportCleanupModule {}
