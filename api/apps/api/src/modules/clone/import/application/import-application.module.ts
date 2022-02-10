import { Module } from '@nestjs/common';
import { ImportAdaptersModule } from '../adapters/import-adapters.module';

@Module({
  imports: [ImportAdaptersModule],
  providers: [],
})
export class ImportApplicationModule {}
