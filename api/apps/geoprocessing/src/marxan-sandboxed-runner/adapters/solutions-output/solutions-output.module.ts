import { Module } from '@nestjs/common';
import { MarxanExecutionMetadataModule } from './metadata';
import { ResultParserService } from './result-parser.service';

@Module({
  imports: [MarxanExecutionMetadataModule],
  providers: [ResultParserService],
  exports: [ResultParserService],
})
export class SolutionsOutputModule {}
