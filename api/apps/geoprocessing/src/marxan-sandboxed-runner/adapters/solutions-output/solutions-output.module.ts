import { Module } from '@nestjs/common';
import { GeoOutputModule } from './geo-output';
import { ResultParserService } from './result-parser.service';

@Module({
  imports: [GeoOutputModule],
  providers: [ResultParserService],
  exports: [ResultParserService],
})
export class SolutionsOutputModule {}
