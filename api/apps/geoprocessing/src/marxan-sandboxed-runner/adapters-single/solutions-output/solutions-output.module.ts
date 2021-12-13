import { Module } from '@nestjs/common';
import { GeoOutputModule } from './geo-output';
import { ResultParserService } from './result-parser.service';
import { MostDifferentService } from './most-different.service';
import { BestSolutionService } from './best-solution.service';

@Module({
  imports: [GeoOutputModule],
  providers: [ResultParserService, MostDifferentService, BestSolutionService],
  exports: [ResultParserService],
})
export class SolutionsOutputModule {}
