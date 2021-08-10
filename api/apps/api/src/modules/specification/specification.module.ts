import { Module } from '@nestjs/common';
import { SpecificationApplicationModule } from './application/specification-application.module';
import { SpecificationAdaptersModule } from './adapters/specification-adapters.module';

@Module({
  imports: [SpecificationApplicationModule.for([SpecificationAdaptersModule])],
  exports: [SpecificationApplicationModule.for([SpecificationAdaptersModule])],
})
export class SpecificationModule {}
