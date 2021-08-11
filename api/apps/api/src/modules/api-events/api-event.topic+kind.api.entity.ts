import { API_EVENT_KINDS } from '@marxan/api-events';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { IsEnum } from 'class-validator';
import { Column, Entity, PrimaryColumn } from 'typeorm';

export class ApiEventByTopicAndKind {
  @Column('timestamp without time zone', {
    default: () => 'now()',
  })
  timestamp!: Date;

  @ApiProperty()
  @IsEnum(Object.values(API_EVENT_KINDS))
  @PrimaryColumn('enum', { enum: API_EVENT_KINDS })
  kind!: API_EVENT_KINDS;

  @ApiProperty()
  @PrimaryColumn('uuid')
  topic!: string;

  @ApiPropertyOptional()
  @Column('jsonb')
  data?: Record<string, unknown>;
}

@Entity('latest_api_event_by_topic_and_kind')
export class LatestApiEventByTopicAndKind extends ApiEventByTopicAndKind {}

@Entity('first_api_event_by_topic_and_kind')
export class FirstApiEventByTopicAndKind extends ApiEventByTopicAndKind {}
