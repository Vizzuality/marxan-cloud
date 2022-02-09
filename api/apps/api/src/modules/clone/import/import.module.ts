import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ImportRepositoryModule } from './application/import-repository/import-repository.module';

@Module({
  imports: [CqrsModule, ImportRepositoryModule],
  exports: [],
})
export class ImportModule {}
