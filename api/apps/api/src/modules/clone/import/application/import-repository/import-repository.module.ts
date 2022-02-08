import { Module } from '@nestjs/common';
import { ImportRepository } from '@marxan-api/modules/clone/import/application/import-repository/import.repository.port';
import { MemoryImportRepository } from '@marxan-api/modules/clone/import/application/import-repository/memory--import.repository.adapter';

@Module({
  imports: [],
  providers: [{ useClass: MemoryImportRepository, provide: ImportRepository }],
  exports: [ImportRepository],
})
export class ImportRepositoryModule {}
