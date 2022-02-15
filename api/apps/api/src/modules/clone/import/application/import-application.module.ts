import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ImportAdaptersModule } from '../adapters/import-adapters.module';
import { ImportArchive } from './import-archive';

@Module({
  imports: [CqrsModule, ImportAdaptersModule],
  providers: [ImportArchive],
  controllers: [],
  exports: [],
})
export class ImportApplicationModule {}
