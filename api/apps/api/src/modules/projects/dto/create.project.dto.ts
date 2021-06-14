import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsAlpha,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUppercase,
  IsUUID,
  Length,
} from 'class-validator';
import { Polygon, MultiPolygon } from 'geojson';
import { PlanningUnitGridShape } from '../project.api.entity';

/**
 * @todo We have this dto partially duplicated in the geoprocessing service
 * @file geoprocessing/src/modules/planning-units/planning-units.job.ts
 */
export class CreateProjectDTO {
  @ApiProperty()
  @IsString()
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsUUID()
  organizationId!: string;

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

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  planningUnitAreakm2?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
