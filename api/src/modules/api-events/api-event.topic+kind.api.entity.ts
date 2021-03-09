import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { IsEnum } from 'class-validator';
import { Column, Entity, PrimaryColumn } from 'typeorm';

import { API_EVENT_APIVERSIONS, API_EVENT_KINDS } from './api-event.api.entity';

export class ApiEventByTopicAndKind {
  @Column('timestamp without time zone', {
    default: () => 'now()',
  })
  timestamp: Date;

  @ApiProperty()
  @IsEnum(Object.values(API_EVENT_KINDS))
  @PrimaryColumn('enum', { nullable: false })
  kind: string;

  @ApiProperty()
  @IsEnum(Object.values(API_EVENT_APIVERSIONS))
  @Column('enum', { name: 'api_version', nullable: false })
  apiVersion: string;

  @ApiProperty()
  @PrimaryColumn('uuid', { nullable: false })
  topic: string;

  @ApiPropertyOptional()
  @Column('jsonb', { nullable: false })
  data: object;
}

// tslint:disable-next-line: max-classes-per-file
@Entity('latest_api_event_by_topic_and_kind')
export class LatestApiEventByTopicAndKind extends ApiEventByTopicAndKind {}

// tslint:disable-next-line: max-classes-per-file
@Entity('first_api_event_by_topic_and_kind')
export class FirstApiEventByTopicAndKind extends ApiEventByTopicAndKind {}
