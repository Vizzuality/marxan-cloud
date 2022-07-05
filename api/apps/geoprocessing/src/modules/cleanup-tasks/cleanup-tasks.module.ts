import { Module } from '@nestjs/common';
import { CleanupTasksService } from './cleanup-tasks.service';

@Module({
  imports: [],
  providers: [CleanupTasksService],
  exports: [CleanupTasksService],
})
export class CleanupTasksModule {}
