import { ScenarioRunProgressV1Alpha1 } from '../events-data/scenario-run-progress-v1-alpha-1';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min, Max, Equals } from 'class-validator';
import { API_EVENT_KINDS } from '@marxan/api-events';

export class ScenarioRunProgressV1Alpha1DTO
  implements ScenarioRunProgressV1Alpha1 {
  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Max(1)
  fractionalProgress!: number;

  @ApiProperty()
  @Equals(API_EVENT_KINDS.scenario__run__progress__v1__alpha1)
  kind!: API_EVENT_KINDS.scenario__run__progress__v1__alpha1;
}
