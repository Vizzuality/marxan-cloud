import { Module } from '@nestjs/common';
import { GeoOutputModule } from './geo-output';
import { ResultParserService } from './result-parser.service';
import { MostDifferentService } from './most-different.service';

@Module({
  imports: [GeoOutputModule],
  providers: [ResultParserService, MostDifferentService],
  exports: [ResultParserService],
})
export class SolutionsOutputModule {}
