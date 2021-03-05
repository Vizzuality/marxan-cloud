import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsAlpha,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUppercase,
  IsUUID,
  Length,
} from 'class-validator';
import { Dictionary } from 'lodash';
import { PlanningUnitGridShape } from '../project.api.entity';

export class CreateProjectDTO {
  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty()
  @IsUUID()
  organizationId: string;

  @ApiPropertyOptional({
    description: 'ISO 3166-1 alpha3 country code (uppercase)',
    example: 'ESP',
  })
  @IsAlpha()
  @IsUppercase()
  @Length(3, 3)
  @IsOptional()
  countryId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  adminAreaLevel1Id?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  adminAreaLevel2Id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(Object.values(PlanningUnitGridShape))
  planningUnitGridShape?: PlanningUnitGridShape;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  planningUnitAreakm2?: number;

  @ApiPropertyOptional()
  @IsOptional()
  extent?: Record<string, unknown>;

  @ApiPropertyOptional()
  metadata?: Dictionary<string>;
}
