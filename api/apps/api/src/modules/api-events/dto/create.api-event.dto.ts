import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsJSON, IsOptional, IsString, IsUUID } from 'class-validator';
import { API_EVENT_KINDS } from '@marxan/api-events';
import * as ApiEventsUserData from './apiEvents.user.data.dto';
import { ScenarioRunProgressV1Alpha1DTO } from './scenario-run-progress-v1-alpha-1';

export class CreateApiEventDTO {
  /**
   * Versioned kind of the event.
   */
  @ApiProperty()
  @IsEnum(Object.values(API_EVENT_KINDS))
  kind!: API_EVENT_KINDS;

  /**
   * Topic of an event; this will typically be the UUID of an entity in the
   * system about which events are emitted.
   */
  @ApiProperty()
  @IsUUID(4)
  topic!: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  externalId?: string;

  /**
   * Data payload of the event. Its semantics depend on kind.
   */
  @ApiPropertyOptional()
  @IsJSON()
  @IsOptional()
  data?:
    | Record<string, unknown>
    | ApiEventsUserData.ActivationTokenGeneratedV1Alpha1DTO
    | ScenarioRunProgressV1Alpha1DTO;
}
