import { HttpModule, Module } from '@nestjs/common';
import { ApiEventsService } from './api-events.service';

@Module({
  imports: [HttpModule],
  providers: [ApiEventsService],
  exports: [ApiEventsService],
})
export class ApiEventsModule {}
