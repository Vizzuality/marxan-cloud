import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ImportApplicationModule } from './application/import-application.module';

@Module({
  imports: [CqrsModule, ImportApplicationModule],
  exports: [],
})
export class ImportModule {}
