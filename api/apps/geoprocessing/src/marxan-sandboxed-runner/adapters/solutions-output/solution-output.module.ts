import { Module } from '@nestjs/common';
import { SolutionsRepository } from '../../ports/solutions-repository';
import { SolutionsOutputFacade } from './solutions-output.facade';

@Module({
  providers: [
    {
      provide: SolutionsRepository,
      useClass: SolutionsOutputFacade,
    },
  ],
  exports: [SolutionsRepository],
})
export class SolutionOutputModule {}
