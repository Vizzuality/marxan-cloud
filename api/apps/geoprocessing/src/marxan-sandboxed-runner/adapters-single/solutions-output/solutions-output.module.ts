import { Module } from '@nestjs/common';
import { GeoOutputModule } from './geo-output';
import { ResultParserService } from './result-parser.service';
import { MostDifferentService } from './most-different.service';
import { MarxanOutputParserModule } from '../../adapters-shared/marxan-output-parser/marxan-output-parser.module';

@Module({
  imports: [GeoOutputModule, MarxanOutputParserModule],
  providers: [ResultParserService, MostDifferentService],
  exports: [ResultParserService],
})
export class SolutionsOutputModule {}
