import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { JobStatus, ScenarioType } from '../scenario.api.entity';
import { ScenarioMetadataDto } from './scenario-metadata.dto';

export class CreateScenarioDTO {
  @ApiProperty()
  @IsString()
  name!: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsEnum(Object.values(ScenarioType))
  type!: ScenarioType;

  @ApiProperty()
  @IsUUID()
  projectId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  numberOfRuns?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  boundaryLengthModifier?: number;

  @ApiPropertyOptional()
  @IsOptional()
  metadata?: ScenarioMetadataDto;

  @ApiProperty({ enum: JobStatus, enumName: 'JobStatus' })
  @IsOptional()
  @IsEnum(Object.values(JobStatus))
  status?: JobStatus;

  costSurfaceId?: string;
}
