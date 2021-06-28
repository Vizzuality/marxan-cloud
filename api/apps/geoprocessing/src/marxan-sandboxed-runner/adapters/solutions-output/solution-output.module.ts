import { Module } from '@nestjs/common';
import { ScenariosOutputResultsGeoEntity } from '@marxan/scenarios-planning-unit';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SolutionsRepository } from '../../ports/solutions-repository';
import { SolutionsOutputFacade } from './solutions-output.facade';

@Module({
  imports: [TypeOrmModule.forFeature([ScenariosOutputResultsGeoEntity])],
  providers: [
    {
      provide: SolutionsRepository,
      useClass: SolutionsOutputFacade,
    },
  ],
  exports: [SolutionsRepository],
})
export class SolutionOutputModule {}
