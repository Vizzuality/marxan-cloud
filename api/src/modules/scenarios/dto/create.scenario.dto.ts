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
  description: string;

  @ApiProperty()
  type: ScenarioType;

  @ApiProperty()
  projectId: string;

  @ApiProperty()
  @IsString()
  @Length(3)
  country: string;

  @ApiPropertyOptional()
  @IsOptional()
  extent: Record<string, unknown> | null;

  @ApiPropertyOptional()
  @IsOptional()
  wdpaFilter: Record<string, unknown> | null;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  @Min(0)
  @Max(100)
  wdpaThreshold: number | null;

  @IsUUID()
  adminRegionId: string;

  @ApiPropertyOptional()
  metadata: Dictionary<string>;
}
