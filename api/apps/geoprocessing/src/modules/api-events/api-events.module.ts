import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CqrsModule } from '@nestjs/cqrs';
import { ApiEventsSubscriber } from './api-events-subscriber';
import { ApiEventsService } from './api-events.service';

@Module({
  imports: [HttpModule, CqrsModule],
  providers: [ApiEventsService, ApiEventsSubscriber],
  exports: [ApiEventsService],
})
export class ApiEventsModule {}
