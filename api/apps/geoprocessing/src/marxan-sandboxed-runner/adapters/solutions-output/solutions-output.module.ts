import { Module } from '@nestjs/common';
import { MarxanExecutionMetadataModule } from './metadata';

@Module({
  imports: [MarxanExecutionMetadataModule],
})
export class SolutionsOutputModule {}
