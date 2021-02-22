import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Max,
  Min,
} from 'class-validator';
import { Dictionary } from 'lodash';
import { ScenarioType } from '../scenario.api.entity';

export class CreateScenarioDTO {
  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsEnum(ScenarioType)
  type: ScenarioType;

  @ApiProperty()
  @IsUUID()
  projectId: string;

  @ApiPropertyOptional()
  @IsOptional()
  wdpaFilter?: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  @Min(0)
  @Max(100)
  wdpaThreshold?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  numberOfRuns?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  boundaryLengthModifier: number;

  @ApiPropertyOptional()
  @IsOptional()
  metadata?: Dictionary<string>;
}
