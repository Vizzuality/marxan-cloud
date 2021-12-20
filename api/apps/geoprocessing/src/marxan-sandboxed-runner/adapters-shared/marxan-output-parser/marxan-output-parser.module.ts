import { Module } from '@nestjs/common';
import { BestSolutionService } from './best-solution.service';
import { MarxanOutputParserService } from './marxan-output-parser.service';

@Module({
  imports: [],
  providers: [MarxanOutputParserService, BestSolutionService],
  exports: [MarxanOutputParserService, BestSolutionService],
})
export class MarxanOutputParserModule {}
