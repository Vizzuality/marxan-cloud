import { Module } from '@nestjs/common';
import { BestSolutionService } from './best-solution.service';
import { MarxanOutputParserService } from './marxan-output-parser.service';
import { MarxanOutputBestParserService } from './marxan-output-best-parser.service';

@Module({
  imports: [],
  providers: [
    MarxanOutputParserService,
    MarxanOutputBestParserService,
    BestSolutionService,
  ],
  exports: [
    MarxanOutputParserService,
    MarxanOutputBestParserService,
    BestSolutionService,
  ],
})
export class MarxanOutputParserModule {}
