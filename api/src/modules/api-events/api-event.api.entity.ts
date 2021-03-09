import { ApiProperty } from '@nestjs/swagger';

import { IsEnum } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * Available kinds of API Events. See the Event.kind prop documentation below
 * for more information.
 */
export enum API_EVENT_KINDS {
  UserSignedUp = 'UserSignUp',
  UserAccountActivationTokenGenerated = 'UserAccountActivationTokenGenerated',
  UserAccountActivationSucceeded = 'UserAccountActivationSucceeded',
  UserAccountActivationFailed = 'UserAccountActivationFailed',
  UserPasswordResetTokenGenerated = 'UserPasswordResetTokenGenerated',
  UserPasswordResetSucceeded = 'UserPasswordResetSucceeded',
  UserPasswordResetFailed = 'UserPasswordResetFailed',
}

/**
 * Available apiVersions of API Events. See the Event.apiVersion prop
 * documentation below for more information.
 */
export enum API_EVENT_APIVERSIONS {
  v1alpha1 = 'v1alpha1',
}

/**
 * An event topic qualified by kind and apiVersion.
 */
export interface QualifiedEventTopic {
  topic: string;
  kind: API_EVENT_KINDS;
  apiVersion: API_EVENT_APIVERSIONS;
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
  id: string;

  /**
   * Timestamp of the event.
   */
  @Column('timestamp without time zone', {
    default: () => 'now()',
  })
  timestamp: Date;

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
  kind: string;

  /**
   * The API Version of an event kind.
   *
   * Semantics of a given event kind may vary over time: the apiVersion for a
   * given kind should be incremented when this happens, so that emitters and
   * consumers of events can interpret the event's semantics appropriately.
   */
  @ApiProperty()
  @IsEnum(Object.values(API_EVENT_APIVERSIONS))
  @Column('enum', { name: 'api_version' })
  apiVersion: string;

  /**
   * Topic of an event; this will typically be the UUID of an entity in the
   * system about which events are emitted.
   */
  @ApiProperty()
  @Column('uuid')
  topic: string;

  /**
   * Data payload of the event. Its semantics depend on kind and apiVersion.
   *
   * @debt Right now, we don't use formal schemas: emitters and consumers of
   * events are responsible for the appropriate handling of shared semantics.
   */
  @Column('jsonb')
  data: Record<string, unknown>;
}

export class JSONAPIApiEventData {
  @ApiProperty()
  type = 'countries';

  @ApiProperty()
  id: string;

  @ApiProperty()
  attributes: ApiEvent;
}

export class ApiEventResult {
  @ApiProperty()
  data: JSONAPIApiEventData;
}
