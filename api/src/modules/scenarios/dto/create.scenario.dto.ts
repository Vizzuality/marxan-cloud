import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
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
  type: ScenarioType;

  @ApiProperty()
  projectId: string;

  @ApiProperty()
  @IsString()
  @Length(3)
  country: string;

  @ApiProperty()
  extent: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsOptional()
  wdpaFilter?: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  @Min(0)
  @Max(100)
  wdpaThreshold?: number;

  @ApiProperty()
  @IsUUID()
  adminRegionId: string;

  @ApiPropertyOptional()
  metadata?: Dictionary<string>;
}
