import { ConsoleLogger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApiEvent } from './api-event.api.entity';
import {
  FirstApiEventByTopicAndKind,
  LatestApiEventByTopicAndKind,
} from './api-event.topic+kind.api.entity';
import { ApiEventsController } from './api-events.controller';
import { ApiEventsService } from './api-events.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ApiEvent,
      LatestApiEventByTopicAndKind,
      FirstApiEventByTopicAndKind,
    ]),
  ],
  providers: [ApiEventsService, ConsoleLogger],
  controllers: [ApiEventsController],
  exports: [ApiEventsService, TypeOrmModule],
})
export class ApiEventsModule {}
