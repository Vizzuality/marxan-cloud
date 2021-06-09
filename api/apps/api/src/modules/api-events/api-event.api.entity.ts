import { ApiProperty } from '@nestjs/swagger';

import { IsEnum } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseServiceResource } from '@marxan-api/types/resource.interface';
import { API_EVENT_KINDS } from '@marxan/api-events';

export const apiEventResource: BaseServiceResource = {
  className: 'ApiEvent',
  name: {
    singular: 'api_event',
    plural: 'api_events',
  },
};

/**
 * An event topic qualified by kind.
 */
export interface QualifiedEventTopic {
  topic: string;
  kind: API_EVENT_KINDS;
}

/**
 * An Event used to exchange information between components of the API.
 */
@Entity('api_events')
export class ApiEvent {
  /**
   * Unique identifier of an event. Usually generated automatically and normally
   * not used anywhere.
   */
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /**
   * Timestamp of the event.
   */
  @Column('timestamp', {
    default: () => 'now()',
  })
  timestamp!: Date;

  /**
   * Each event topic (for example, the UUID of an entity) may be used across
   * distinct event kinds. For example, events emitted during creation and
   * validation of a new user account will all use the user's UUID as topic and,
   * as kind, `API_EVENT_KINDS.UserSignedUp` when the account is created,
   * `API_EVENT_KINDS.UserAccountActivationTokenGenerated` when a one-time
   * activation token is generated, and then
   * `API_EVENT_KINDS.UserAccountActivationSucceeded` or
   * `API_EVENT_KINDS.UserAccountActivationSucceeded` when the validation
   * succeeds or fails, respectively (the latter could happen if the user tries
   * to validate an expired token).
   */
  @ApiProperty()
  @IsEnum(Object.values(API_EVENT_KINDS))
  @Column('enum')
  kind!: string;

  /**
   * Topic of an event; this will typically be the UUID of an entity in the
   * system about which events are emitted.
   */
  @ApiProperty()
  @Column('uuid')
  topic!: string;

  /**
   * Data payload of the event. Its semantics depend on kind.
   *
   * @debt Right now, we don't use formal schemas: emitters and consumers of
   * events are responsible for the appropriate handling of shared semantics.
   */
  @Column('jsonb')
  data!: Record<string, unknown>;
}

export class JSONAPIApiEventData {
  @ApiProperty()
  type = 'countries';

  @ApiProperty()
  id!: string;

  @ApiProperty()
  attributes!: ApiEvent;
}

export class ApiEventResult {
  @ApiProperty()
  data!: JSONAPIApiEventData;
}
