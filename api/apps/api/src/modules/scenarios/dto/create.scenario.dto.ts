import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { JobStatus, ScenarioType } from '../scenario.api.entity';
import { ScenarioMetadataDto } from './scenario-metadata.dto';
import { IUCNCategory } from '@marxan/iucn';

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
  @IsArray()
  @IsEnum(IUCNCategory, { each: true })
  wdpaIucnCategories?: IUCNCategory[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID(4, { each: true })
  customProtectedAreaIds?: string[];

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
  boundaryLengthModifier?: number;

  @ApiPropertyOptional()
  @IsOptional()
  metadata?: ScenarioMetadataDto;

  @ApiProperty({ enum: JobStatus, enumName: 'JobStatus' })
  @IsOptional()
  @IsEnum(Object.values(JobStatus))
  status?: JobStatus;
}
