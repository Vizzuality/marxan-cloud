import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExportEntity } from '../../export/adapters/entities/exports.api.entity';
import { ImportAdaptersModule } from '../adapters/import-adapters.module';
import { ImportArchive } from './import-archive';

@Module({
  imports: [
    TypeOrmModule.forFeature([ExportEntity]),
    CqrsModule,
    ImportAdaptersModule,
  ],
  providers: [ImportArchive],
  controllers: [],
  exports: [],
})
export class ImportApplicationModule {}
